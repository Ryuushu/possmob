import { useIsFocused } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import ItemList from '../../component/itemlist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetupPrinter = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');
  const isFocused = useIsFocused()

  const enableBluetooth = async () => {
    try {
      await BluetoothManager.enableBluetooth();
      console.log('Bluetooth turned on successfully');
    } catch (error) {
      console.log('Failed to turn on Bluetooth:', error);
      // Retry enabling Bluetooth
      await enableBluetooth();
    }
  };
  useEffect(() => {
    BluetoothManager.isBluetoothEnabled()
      .then(async (enabled) => {
        if (enabled) {
          setBleOpend(Boolean(enabled));
          setLoading(false);
          address = await AsyncStorage.getItem('bltaddress');
          namablt = await AsyncStorage.getItem('bltname');
          if (address == null || namablt == null) {
            setBoundAddress('');
            setName('');
          } else {
            setBoundAddress(address);
            setName(namablt);
          }

        } else {
          await enableBluetooth();
          setBleOpend(true); // Bluetooth has been enabled
          setLoading(false);
        }
      })
      .catch((error) => {
        error;
      });

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
        () => {
          ToastAndroid.show(
            'Device Not Support Bluetooth !',
            ToastAndroid.LONG,
          );
        },
      );
    }
    if (pairedDevices.length < 1) {
      scan();
    }
  }, [
    boundAddress,
    deviceAlreadPaired,
    deviceFoundEvent,
    pairedDevices,
    scan,
    isFocused
  ]);

  const deviceAlreadPaired = useCallback(
    rsp => {
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) { }
      }
      if (ds && ds.length) {
        let pared = pairedDevices;
        if (pared.length < 1) {
          pared = pared.concat(ds || []);
        }
        setPairedDevices(pared);
      }
    },
    [pairedDevices],
  );

  const deviceFoundEvent = useCallback(
    rsp => {
      var r = null;
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device;
        } else {
          r = JSON.parse(rsp.device);
        }
      } catch (e) {
        // ignore error
      }

      if (r) {
        let found = foundDs || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x) {
            return x.address == r.address;
          });
          if (duplicated == -1) {
            found.push(r);
            setFoundDs(found);
          }
        }
      }
    },
    [foundDs],
  );

  const connect = async row => {
    setLoading(true);

    if (
      (await AsyncStorage.getItem('bltaddress')) == null ||
      (await AsyncStorage.getItem('bltaddress')) == undefined ||
      (await AsyncStorage.getItem('bltaddress')) == ' '
    ) {
      address = row.address;
    } else {
      address = await AsyncStorage.getItem('bltaddress');
    }
    try {
      await BluetoothManager.connect(address).then(async s => {
        setLoading(false)
        setBoundAddress(row.address);
        await AsyncStorage.setItem('bltaddress', row.address);
        await AsyncStorage.setItem('bltname', row.name || 'UNKNOWN');
        setName(row.name || 'UNKNOWN');
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  const unPair = async address => {
    setLoading(true);
    BluetoothManager.unpaire(address).then(
      async s => {
        setLoading(false);
        setBoundAddress('');
        setName('');
        await AsyncStorage.setItem('bltaddress', '');
        await AsyncStorage.setItem('bltname', '');
      },
      e => {
        setLoading(false);
        alert(e);
      },
    );
  };

  const scanDevices = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      BluetoothManager.scanDevices().then(
        s => {
          // const pairedDevices = s.paired;
          var found = s.found;
          try {
            found = JSON.parse(found); //@FIX_it: the parse action too weired..
          } catch (e) {
            console.log(e);
          }
          var fds = foundDs;
          if (found && found.length) {
            fds = found;
          }
          setFoundDs(fds);
          setLoading(false);
        },
        er => {
          setLoading(false);
          console.log(er);
        },
      );
    }, 2000)

  }, [foundDs]);

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'meminta izin untuk mengakses bluetooth dan gps',
          message:
            'memerlukan akses ke bluetooth dan gps untuk proses koneksi ke bluetooth printer',
          buttonNeutral: 'Lain Waktu',
          buttonNegative: 'Tidak',
          buttonPositive: 'Boleh',
        };
        try {
          let isPermitedLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (Platform.Version >= 31) {
            let isPermitedBluetooth = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            do {
              const grant = await PermissionsAndroid.requestMultiple([
                // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
              ]).then(result => {
                if (
                  result['android.permission.ACCESS_FINE_LOCATION'] &&
                  result['android.permission.BLUETOOTH_CONNECT'] &&
                  result['android.permission.BLUETOOTH_SCAN'] &&
                  result['android.permission.BLUETOOTH_ADVERTISE'] ===
                  PermissionsAndroid.RESULTS.GRANTED
                ) {
                  scanDevices();
                } else {
                  console.log('gagal');
                }
              });
            } while (!isPermitedBluetooth);


          } else {
            do {
              var grant = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              );
            } while (!isPermitedLocation);
            if (grant === PermissionsAndroid.RESULTS.GRANTED) {
              scanDevices();
            } else {
              console.log('Silahkan Ijinkan Lokasi');
            }

          }
        } catch (error) {
          alert(error)
        }

      }
      blueTooth()
    } catch (err) {
      console.log(err);
    }
  }, [scanDevices]);

  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.bluetoothStatusContainer}>
        <Text style={styles.bluetoothStatus(bleOpend ? '#47BF34' : '#A8A9AA')}>
          Bluetooth {bleOpend ? 'Aktif' : 'Non Aktif'}
        </Text>
      </View>
      {!bleOpend && (
        <Text style={styles.bluetoothInfo}>Mohon aktifkan bluetooth anda</Text>
      )}
      <Text style={styles.sectionTitle}>
        Printer yang terhubung ke aplikasi:
      </Text>
      {boundAddress.length > 0 && (
        <ItemList
          label={name}
          value={boundAddress}
          onPress={() => unPair(boundAddress)}
          actionText="Putus"
          color="#E9493F"
        />
      )}
      {boundAddress.length < 1 && (
        <Text style={styles.printerInfo}>Belum ada printer yang terhubung</Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.sectionTitle}>
          Bluetooth yang terhubung ke HP ini:
        </Text>
        {loading ? <View style={{ backgroundColor: '#00BCD4', width: 25, height: 25, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#000' }}>*</Text>
        </View> : <TouchableOpacity onPress={() => scan()} style={{ backgroundColor: '#00BCD4', width: 25, height: 25, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#000' }}>*</Text>
        </TouchableOpacity>}
      </View>

      {loading ? <ActivityIndicator size="large" color="#00ff00" style={{ marginBottom: 18 }} /> : null}
      <View style={styles.containerList}>
        {pairedDevices.map((item, index) => {
          return (
            <ItemList
              key={index}
              onPress={() => connect(item)}
              label={item.name}
              value={item.address}
              connected={item.address === boundAddress}
              actionText="Hubungkan"
              color="#00BCD4"
            />
          );
        })}
      </View>
      <View style={{ height: 100 }} />
      <View style={{ marginBottom: 120 }}>
      </View>

    </ScrollView>
  );
};
export default SetupPrinter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  containerList: { flex: 1, flexDirection: 'column' },
  bluetoothStatusContainer: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  bluetoothStatus: color => ({
    backgroundColor: color,
    padding: 8,
    borderRadius: 2,
    color: 'white',
    paddingHorizontal: 14,
    marginBottom: 20,
  }),
  bluetoothInfo: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    color: '#FFC806',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  printerInfo: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    color: '#E9493F',
    marginBottom: 20,
  },
});
