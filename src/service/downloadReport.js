import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import BASE_URL from '../../config';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const downloadReport = async (type, bool) => {
    try {
        const token = await AsyncStorage.getItem('tokenAccess');
        const folderPath = `${RNFS.DownloadDirectoryPath}/aplikasipos`;
        let url = bool
            ? `${BASE_URL}/laporanpenjualan/export/${type}`
            : `${BASE_URL}/laporanpembelian/export/${type}`;

        // Cek apakah folder 'aplikasipos' ada, jika tidak buat folder
        const folderExists = await RNFS.exists(folderPath);
        if (!folderExists) {
            await RNFS.mkdir(folderPath);
        }

        // Download file dengan konfigurasi RNBlobUtil
        const response = await RNBlobUtil.config({ fileCache: true }).fetch('GET', url, {
            Authorization: `Bearer ${token}`
        });
        // Ambil nama file dari Content-Disposition
        const contentDisposition = response.info().headers['Content-Disposition'] || response.info().headers['content-disposition'];
        let fileName = `laporan_${type}.xlsx`; // Default jika tidak ditemukan

        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/);
            if (match) {
                fileName = decodeURIComponent(match[1]); // Decode nama file jika ada
            }
        }

        // Tentukan path lengkap untuk menyimpan file
        const filePath = `${folderPath}/${fileName}`;

        // Pindahkan file dari cache ke folder tujuan
        await RNFS.moveFile(response.path(), filePath);

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
