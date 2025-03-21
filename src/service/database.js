
import { fetchDataFromServer, sendUnsyncedData } from "./api";
import db from "./db";


const tables = [
  { alias: "toko", name: "toko"},
  { alias: "produk", name: "produk"},
  { alias: "kategori", name: "kategori"},
  // { alias: "transaksi-penjualan", name: "transaksi_penjualan", is_id_toko: true, is_bool: false },
  // { alias: "detail-transaksi-penjualan", name: "detail_transaksi_penjualan", is_id_toko: true, is_bool: false }
];

// Sinkronisasi data dari server ke SQLite
export const syncDataDariServer = async (token,id_toko) => {
  try {
    for (const table of tables) {
      const dataDariServer = await fetchDataFromServer(`get-${table.alias}`, token);
      console.log(dataDariServer.data)
      db.transaction(tx => {
        try {
          if (!["transaksi_penjualan", "detail_transaksi_penjualan"].includes(table.name)) {
            tx.executeSql(`DELETE FROM ${table.name};`); // Hapus data lama untuk data master
          } else {
            tx.executeSql(`DELETE FROM ${table.name} WHERE synced = 1;`); // Hapus transaksi yang sudah tersinkron
          }
          // console.log(dataDariServer.status)
          if (dataDariServer.status == "success") {
            dataDariServer.data.forEach(item => {
              const keys = Object.keys(item).join(", ");
              const values = Object.values(item);
              const placeholders = values.map(() => "?").join(", ");
              console.log(values.map(val => (val && typeof val === "object" ? JSON.stringify(val) : val)))
              tx.executeSql(
                `INSERT INTO ${table.name} (${keys}) VALUES (${placeholders});`,
                values.map(val => (val && typeof val === "object" ? JSON.stringify(val) : val)), // Pastikan objek dikonversi ke string
                (_, result) => console.log(`✅ Data berhasil ditambahkan ke ${table.name}:`, result),
                (_, error) => {
                  console.error(`❌ Gagal menambahkan data ke ${table.name}:`, error.message || error);
                  return true; // Menghentikan transaksi jika ada error
                }
              );

            });
          }

        } catch (err) {
          console.error(`❌ Error dalam transaksi untuk tabel ${table.name}:`, err);
        }
      });
    }

    console.log("✅ Sinkronisasi dari server selesai.");
  } catch (error) {
    console.error("❌ Gagal mengambil data dari server:", error);
  }
};


// Sinkronisasi data dari SQLite ke server
export const syncDataKeServer = async (token) => {
  for (const table of tables) {
    if (["transaksi_penjualan", "detail_transaksi_penjualan"].includes(table.name)) {
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM ${table.name} WHERE synced = 0;`, [], async (_, { rows }) => {
          const dataBelumSync = rows._array;

          if (dataBelumSync.length > 0) {
            const success = await sendUnsyncedData(dataBelumSync, table.alias, token);

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
