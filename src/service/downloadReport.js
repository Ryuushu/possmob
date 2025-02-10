import axios from 'axios';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
// import { requestStoragePermission } from './PermissionService';
import BASE_URL from '../../config';
import { Buffer } from 'react-native-buffer';
const API_BASE_URL = `${BASE_URL}/laporan/export`;
import RNBlobUtil from 'react-native-blob-util';

export const downloadReport = async (type) => {
    // const hasPermission = await requestStoragePermission();
    // if (!hasPermission) {
    //     Alert.alert('Izin Diperlukan', 'Aplikasi membutuhkan izin untuk menyimpan file.');
    //     return;
    // }

    try {
        // Membuat path folder aplikasi
        const folderPath = `${RNFS.DownloadDirectoryPath}/aplikasipos`;
        const url = `${BASE_URL}/laporan/export/${type}`;
        // Cek apakah folder 'aplikasipos' ada, jika tidak buat folder
        const folderExists = await RNFS.exists(folderPath);
        if (!folderExists) {
            await RNFS.mkdir(folderPath);  // Membuat folder baru
        }

        // Mendapatkan nama file
        const fileName = `laporan_${type}.xlsx`;

        // Tentukan path lengkap untuk menyimpan file
        const filePath = `${folderPath}/${fileName}`;

        // Mengambil data laporan dari server
        const response = await RNBlobUtil.config({ fileCache: true })
            .fetch('GET', url);

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
