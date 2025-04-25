import {Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

// Fungsi untuk mengecek dan meminta izin
const checkAndRequestPermission = async permission => {
  const status = await check(permission);

  if (status === RESULTS.GRANTED) {
    console.log(`${permission} sudah diberikan.`);
    return true;
  }
  if (status === RESULTS.DENIED) {
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  }
  if (status === RESULTS.BLOCKED || status === RESULTS.UNAVAILABLE) {
    Alert.alert(
      'Izin Diperlukan',
      'Silakan aktifkan izin ini secara manual di Pengaturan.',
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Buka Pengaturan', onPress: () => openSettings()},
      ],
    );

    return false;
  }
  console.warn(`Izin ${permission} ditolak oleh sistem atau pengguna.`);
  return false;
};

// Fungsi utama untuk meminta semua izin yang diperlukan
export const requestPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const permissionsToRequest = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  ];

  if (Platform.Version >= 33) {
    permissionsToRequest.push(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    permissionsToRequest.push(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE);
  } else if (Platform.Version >= 31) {
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    permissionsToRequest.push(PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE);
  } else {
    permissionsToRequest.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  }

  let allGranted = true;
  for (const permission of permissionsToRequest) {
    const granted = await checkAndRequestPermission(permission);
    if (!granted) allGranted = false;
  }

  console.log('Semua izin sudah diproses.');
  return allGranted;
};
