import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase(
  { name: "mydatabase.db", location: "default" },
  () => console.log("Database berhasil dibuka"),
  error => console.error("Gagal membuka database", error)
);
export default db;