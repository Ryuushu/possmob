import { ImageBackground, StyleSheet, Text, View, Dimensions, Image, PermissionsAndroid, Platform, Linking } from 'react-native'
import React, { useEffect} from 'react'
import { logosplash, splashscreen } from '../../assets'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import EventEmitter from 'events'



const Splashscreen = ({ navigation }) => {
  const eventEmitter = new EventEmitter();

  const get = async () => {
    try {
      // await GoogleSignin.configure({
      //   scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file']
      // })
      // const cek = await AsyncStorage.getItem('tokenAccess')
      // const cekspreadsheet = await AsyncStorage.getItem('TokenSheet')
      // const isSignedIn = await GoogleSignin.isSignedIn()
      // await GoogleSignin.hasPlayServices();
      // await GoogleSignin.signIn()
      // const res = await GoogleSignin.getTokens()
      // console.log(res)
      // await AsyncStorage.setItem('tokenAccess', res.accessToken)
      // const user = await GoogleSignin.getCurrentUser()
      // await AsyncStorage.setItem('usergooglesignin', JSON.stringify(user.user))
      const ceklog = await AsyncStorage.getItem('islog')

      const address = await AsyncStorage.getItem('bltaddress');
      if (address != null || address != '') {
        Activasionblt(address)
      }
      if (ceklog) {
        setTimeout(() => {
          
          navigation.replace('Routestack')
        }, 5000)
      }
      else {
        setTimeout(() => {
          navigation.replace('loginpage')
        }, 5000)
      }
      // if (cekspreadsheet) {
      //   setTimeout(() => {
      //     navigation.replace('Routestack')
      //   }, 2000)
      // }
      // else {
      //   setTimeout(() => {
      //     navigation.replace('GuidePage')
      //   }, 2000)
      // }
    } catch (error) {
      // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      //   RNRestart.Restart()
      // } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      //   await GoogleSignin.signIn()
      // }
      // else if (error.code === statusCodes.IN_PROGRESS) {
      //   console.log('sign progress')
      // }
      // else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      //   console.log('play services not available or outdated')
      //   // play services not available or outdated
      // }
      // else {
      //   RNRestart.Restart()
      //   console.log(error)
      //   console.log(error.code)
      // }
    }
  }
  const Permassion = async () => {
    try {
      if (Platform.Version > 30) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA
        ];

        await PermissionsAndroid.requestMultiple(permissions).then(result => {
          if (
            result['android.permission.ACCESS_FINE_LOCATION'] &&
            result['android.permission.BLUETOOTH_CONNECT'] &&
            result['android.permission.BLUETOOTH_SCAN'] &&
            result['android.permission.BLUETOOTH_ADVERTISE'] &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            get()
          } else {
            const eventEmitter = new EventEmitter();
            Linking.openSettings()
            eventEmitter.emit('permissionChanged');
          }
        });
      } else {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA
        ];
        await PermissionsAndroid.requestMultiple(permissions).then(result => {
          if (
            result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] &&
            result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] &&
            result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            get()
          } else {

            Linking.openSettings()
            eventEmitter.emit('permissionChanged');
          }
        });

      }
    } catch (e) {
      console.log('Error while checking permission');
      console.log(e);
    }
  };
  const Activasionblt = async (address) => {
    if (address) {
      try {
        BluetoothManager.connect(address)
          .then(
            s => {
              console.log('Paired ' + s);
            },
            e => {
              console.log(JSON.stringify(e));
              alert(e);
            },
          )
      } catch (e) {
        console.log(e)
      }

    }
  };

  useEffect(() => {
    Permassion()
    eventEmitter.addListener('permissionChanged', handlePermissionChange)

    return () => {
      eventEmitter.removeListener('permissionChanged', handlePermissionChange);
    };
  }, []);
  const handlePermissionChange = async () => {
    Permassion()
  }
  return (
    <View style={{ height: Dimensions.get('window').height, flex: 1 }}>
      <ImageBackground source={splashscreen} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Image source={logosplash} style={{ marginHorizontal: 12, width: Dimensions.get('screen').width * 0.9, height: Dimensions.get('screen').height * 0.42,aspectRatio: 1, }} />
          <Text style={{ marginTop: 16, fontSize: 42, color: '#fff', fontFamily: 'InknutAntiqua-Regular' }}>Barokah 313</Text>
        </View>
      </ImageBackground>
    </View>
  )
}

export default Splashscreen

const styles = StyleSheet.create({})