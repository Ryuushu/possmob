import axios from 'axios';
import {getUnsyncedData, markAsSynced} from './database';

const API_URL = `${BASE_URL}/sync`;

export const syncDataToServer = async () => {
  try {
    const produk = await getUnsyncedData('produk');
    const transaksiPenjualan = await getUnsyncedData('transaksi_penjualan');
    const transaksiPembelian = await getUnsyncedData('transaksi_pembelian');
    const pekerja = await getUnsyncedData('pekerja');
    const toko = await getUnsyncedData('toko');

    if (!produk.length && !transaksiPenjualan.length && !transaksiPembelian.length && !pekerja.length && !toko.length) {
      console.log('Tidak ada data yang perlu disinkronisasi.');
      return;
    }

    const response = await axios.post(API_URL, {
      produk,
      transaksi_penjualan: transaksiPenjualan,
      transaksi_pembelian: transaksiPembelian,
      pekerja,
      toko
    });

    if (response.status === 200) {
      if (produk.length) await markAsSynced('produk', produk.map(p => p.id));
      if (transaksiPenjualan.length) await markAsSynced('transaksi_penjualan', transaksiPenjualan.map(t => t.id));
      if (transaksiPembelian.length) await markAsSynced('transaksi_pembelian', transaksiPembelian.map(t => t.id));
      if (pekerja.length) await markAsSynced('pekerja', pekerja.map(p => p.id));
      if (toko.length) await markAsSynced('toko', toko.map(t => t.id));
      
      console.log('Sinkronisasi berhasil!');
    }
  } catch (error) {
    console.error('Gagal sinkronisasi:', error);
  }
};
