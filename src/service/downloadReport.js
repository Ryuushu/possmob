import axios from 'axios';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
// import { requestStoragePermission } from './PermissionService';
import BASE_URL from '../../config';
import { Buffer } from 'react-native-buffer';
const API_BASE_URL = `${BASE_URL}/laporan/export`;
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const downloadReport = async (type, bool) => {

    try {
        const token = await AsyncStorage.getItem('tokenAccess');
        const folderPath = `${RNFS.DownloadDirectoryPath}/aplikasipos`;
        let url = "";
        console.log(bool)
        if (bool) {
            url = `${BASE_URL}/laporanpenjualan/export/${type}`;
        } else {
            url = `${BASE_URL}/laporanpembelian/export/${type}`;

        }
        console.log(url)
        // Cek apakah folder 'aplikasipos' ada, jika tidak buat folder
        const folderExists = await RNFS.exists(folderPath);
        if (!folderExists) {
            await RNFS.mkdir(folderPath);  // Membuat folder baru
        }

        const response = await RNBlobUtil.config({ fileCache: true })
            .fetch('GET', url);
        const contentDisposition = response.info().headers['Content-Disposition'] || response.info().headers['content-disposition'];

        let fileName = `laporan_${type}.xlsx`; // Default jika tidak ditemukan

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match) {
                fileName = match[1]; // Ambil nama file dari header
            }
        }

        // Tentukan path lengkap untuk menyimpan file
        const filePath = `${folderPath}/${fileName}`;

        // Ambil file dalam bentuk base64
        const base64Data = await response.base64();

        // Menyimpan base64 ke file
        await RNBlobUtil.fs.writeFile(filePath, base64Data, 'base64');


        Alert.alert('Download Selesai', `Laporan disimpan di ${filePath}`);
    } catch (error) {
        Alert.alert('Error', 'Gagal mengunduh laporan');
        console.error('Download error:', error);
    }
};
const arrayBufferToBase64 = (arrayBuffer) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Mengambil bagian base64 setelah 'data:application/octet-stream;base64,'
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(new Blob([arrayBuffer]));
    });
};
