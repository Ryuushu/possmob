import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase(
  { name: "mydatabase.db", location: "default" },
  () => {
    console.log("Database berhasil dibuka");
  },
  error => console.error("Gagal membuka database", error)
);

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS toko (
        id_toko INTEGER PRIMARY KEY,
        id_pemilik TEXT NOT NULL,
        nama_toko TEXT NOT NULL,
        alamat_toko TEXT NOT NULL,
        whatsapp TEXT,
        instagram TEXT,
        url_img TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced BOOLEAN
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS produk (
        kode_produk  INTEGER PRIMARY KEY,
        nama_produk TEXT NOT NULL,
        id_toko INTEGER NOT NULL,
        kode_kategori INTEGER NOT NULL,
        harga INTEGER NOT NULL,
        harga_beli INTEGER,
        stok INTEGER,
        is_stock_managed BOOLEAN NOT NULL,
        url_img TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS kategori (
        kode_kategori INTEGER PRIMARY KEY,
        nama_kategori TEXT NOT NULL,
        is_stok BOLEAN NOT NULL,
        id_toko  INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transaksi_penjualan (
        id_transaksi INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER NOT NULL,
        id_toko INTEGER NOT NULL,
        id_diskon INTEGER,
        totalharga INTEGER NOT NULL,
        pembayaran INTEGER NOT NULL,
        kembalian INTEGER NOT NULL,
        ppn INTEGER NOT NULL,
        bulatppn INTEGER NOT NULL,
        valuediskon INTEGER NOT NULL,
        tipediskon INTEGER NOT NULL,
        jenis_pembayaran INTEGER NOT NULL,
        created_at TEXT, 
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS detail_transaksi_penjualan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_transaksi INTEGER NOT NULL,
        kode_produk TEXT NOT NULL,
        harga INTEGER NOT NULL,
        qty INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        created_at TEXT,
        updated_at TEXT
      );`
    );

  }, error => console.error("Gagal membuat tabel", error), () => console.log("Semua tabel berhasil dibuat"));
};

export default db;
