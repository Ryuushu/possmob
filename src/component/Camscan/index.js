import { StyleSheet, Text, View, KeyboardAvoidingView, Vibration, Dimensions, Alert, } from 'react-native'
import React, { useState, useRef } from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import BarcodeMask from 'react-native-barcode-mask';
import { setForm } from '../../redux/action';


const Camscan = (addchart) => {

  const boxTopLeftX = 400;  
  const boxTopLeftY = 480; 
  const boxBottomRightX = 800; 
  const boxBottomRightY = 520; 
  
  const [barcodes, setBarcodes] = useState('')
  const Navigation = useNavigation()
  const dispatch = useDispatch();
  const scannerRef = useRef(null);
  const TRXReducer = useSelector(state => state.TRXReducer);
  const setCart = (item, idpproduk, count, harga, id_tensaksi) => {
    let ids = '';
    if (TRXReducer.id_produk == null) {
      ids = id_tensaksi;
    } else {
      ids = TRXReducer.id_produk;
    }

    let cart = {
      idtrx: ids,
      item: item,
      id: idpproduk,
      count: count,
      subTotal: harga,
    };
    dispatch({ type: 'CART', value: cart });
  };
  const setidproduk = id => {
    dispatch({ type: 'IDPRODUK', value: id });
  };

  const onSuccess = async (e) => {
    const { bounds } = e;

    const boxLeft = parseFloat(bounds.origin[0].x);
    const boxRight = parseFloat(bounds.origin[1].x);
    const boxTop = parseFloat(bounds.origin[0].y);
    const boxBottom = parseFloat(bounds.origin[1].y);
    
    if (
      boxLeft >= boxTopLeftX &&
      boxRight <= boxBottomRightX &&
      boxTop >= boxTopLeftY &&
      boxBottom <= boxBottomRightY
    ) {
      setBarcodes(e.data)
      if (addchart.route.params) {
        const sheetid = await AsyncStorage.getItem('TokenSheet');
        const token = await AsyncStorage.getItem('tokenAccess');
        await axios
          .get(
            'https://sheets.googleapis.com/v4/spreadsheets/' +
            sheetid +
            '/values/Produk',
            {
              headers: {
                Authorization: 'Bearer ' + token,
              },
            },
          )
          .then(res => {
            const item = res.data.values.filter(fill => fill[4] != null ? fill[4] == e.data : null)[0]
            if (!item) {
              Alert.alert("Barcode Belum Terdaftar", "Barcode Belum Terdaftar", [
                {
                  text: 'OK',
                  onPress: () => resetactivecam(),
                },])
            }
            else {
              const rawdate = new Date();
              const date = moment(rawdate).format('DD-MM-YY').split('-');
              const id_tensaksi =
                'TRX-' +
                date[0] +
                date[1] +
                date[2] +
                Math.floor(Math.random() * 1000000) +
                1;
              setidproduk(id_tensaksi);
              let idpproduk = item[0];
              let harga = item[2];
              let count = 1;
              setCart(item, idpproduk, count, harga, id_tensaksi);
              Navigation.navigate('Routestack')

            }
          })

      }
      else {
        dispatch(setForm("barcodeproduk", e.data));
        Navigation.navigate('formkasir')
      }
    } else {
      resetactivecam()
    }

  }
  const handleLayoutMeasured = (event) => {
    const { layout, target } = event.nativeEvent;
    console.log('Barcode Mask Layout:', event);
  };
  const resetactivecam = () => {
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  }
  return (
    <KeyboardAvoidingView style={styles.root}>
      <View style={styles.upperSection}>
        <QRCodeScanner
          onRead={e => onSuccess(e)}
          ref={scannerRef}
          showMarker={true}
          bottomContent={<View><Text style={styles.textBold}>{barcodes}</Text></View>
          }
          vibrate={false}
          customMarker={
            <View style={styles.maskContainer}>
              <BarcodeMask width={320} height={110} outerMaskOpacity={0.6} edgeColor={'#db6e37'} animatedLineColor={'#db6e37'} lineAnimationDuration={1000} />
            </View>
          }
          markerStyle={{ position: 'absolute', top: 70, height: 80, width: 300 }}
          cameraStyle={{ height: Dimensions.get('window').height * 1 }}
        />
      </View>
    </KeyboardAvoidingView >
  )
}

export default Camscan

const styles = StyleSheet.create({
  maskContainer: {
    flex: 1,
    position: 'absolute',
    top: -450,
    left: 0,
    width: 400,
    height: Dimensions.get('screen').height*1.6,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  root: {
    flex: 1,
  },
  upperSection: {
    flex: 1
  },
  lowerSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  camera: {
    height: '100%',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
})