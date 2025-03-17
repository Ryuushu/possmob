import db from "./db";

// 🛠 Daftar tabel yang akan disinkronkan
const tables = [
  { alias: "store", name: "toko" },
  { alias: "product", name: "produk" },
  { alias: "discount", name: "diskon" },
  { alias: "category", name: "kategori" },
  { alias: "sales_transaction", name: "transaksi_penjualan" },
  { alias: "sales_detail", name: "detail_transaksi_penjualan" }
];

// Sinkronisasi data dari server ke SQLite
export const syncDataDariServer = async () => {
  for (const table of tables) {
    const dataDariServer = await fetchDataFromServer(`get-${table.alias}`);

    db.transaction(tx => {
      if (!["transaksi_penjualan", "detail_transaksi_penjualan"].includes(table.name)) {
        tx.executeSql(`DELETE FROM ${table.name};`); // Hapus data lama untuk data master
      } else {
        tx.executeSql(`DELETE FROM ${table.name} WHERE synced = 1;`); // Hapus transaksi yang sudah tersinkron
      }

      dataDariServer.forEach(item => {
        const keys = Object.keys(item).join(", ");
        const values = Object.values(item);
        const placeholders = values.map(() => "?").join(", ");

        tx.executeSql(
          `INSERT INTO ${table.name} (${keys}) VALUES (${placeholders});`,
          values
        );
      });
    });
  }

  console.log("✅ Sinkronisasi dari server selesai.");
};

// Sinkronisasi data dari SQLite ke server
export const syncDataKeServer = async () => {
  for (const table of tables) {
    if (["transaksi_penjualan", "detail_transaksi_penjualan"].includes(table.name)) {
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM ${table.name} WHERE synced = 0;`, [], async (_, { rows }) => {
          const dataBelumSync = rows._array;

          if (dataBelumSync.length > 0) {
            const success = await sendUnsyncedData(dataBelumSync, table.alias);

            if (success) {
              db.transaction(tx => {
                tx.executeSql(`UPDATE ${table.name} SET synced = 1 WHERE synced = 0;`);
              });
              console.log(`✅ Data ${table.name} berhasil dikirim ke server.`);
            }
          }
        });
      });
    }
  }
};  
