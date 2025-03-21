import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Iprinter } from '../../assets/icon';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const FinalPage = ({ route, navigation }) => {
  const params = route.params
  const currency = new Intl.NumberFormat('id-ID');
  const CartReducer = useSelector(state => state.CartReducer);
  const TunaiReducer = useSelector(state => state.TunaiReducer);
  const DiskonReducer = useSelector(state => state.DiskonReducer);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);


  const dispatch = useDispatch()
  const setup = async () => {
    setModalVisibleLoading(true)
    const data = params.data

    try {
      await BluetoothEscposPrinter.printText('\r\n\r\n', {});
      // await BluetoothEscposPrinter.printPic(chillLogo, { width: 200, height: 100 });
      // await BluetoothEscposPrinter.printerAlign(
      //   BluetoothEscposPrinter.ALIGN.CENTER,
      // );
      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [33],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['\x1B\x61\x01' + data.toko.nama_toko],
        {},
      );
      await BluetoothEscposPrinter.setBlob(0);

      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [data.toko.alamat_toko],
        {},
      );

      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [data.id_transaksi],
        {},
      );
      // await BluetoothEscposPrinter.printColumn(
      //   [9, 24],
      //   [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      //   ['', data.id_transaksi],
      //   {},
      // );
      await BluetoothEscposPrinter.printColumn(
        [10, 22],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["Tanggal", moment(data.created_at).format('DD MMM yyyy HH:mm:ss')],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [10, 22],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Kasir', data.user.nama],
        {},
      );
      if (data.toko.whatsapp != null && data.toko.whatsapp != "") {
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ['Whatsapp', data.toko.whatsapp],
          {},
        );
      }
      if (data.toko.instagram != null && data.toko.instagram != "") {
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ['Instagram', data.toko.instagram],
          {},
        );
      }
      await BluetoothEscposPrinter.printColumn(
        [17, 15],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Jenis Pembayaran', data.jenis_pembayaran],
        {},
      );


      await BluetoothEscposPrinter.printText('\r\n', {});
      await BluetoothEscposPrinter.printColumn(
        [11, 11, 11],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['==========', 'Pesanan', '=========='],
        {},
      );
      // CartReducer.cartitem.map(async(items,index)=>{

      for (const element of data.items) {
        const quantity = element.qty;
        const pricePerUnit = element.harga;
        const subtotal = quantity * pricePerUnit;
        const formattedSubtotal = 'Rp.' + currency.format(subtotal);

        await BluetoothEscposPrinter.printColumn(
          [32],
          [BluetoothEscposPrinter.ALIGN.LEFT],
          [element.nama_produk],
          {}
        );
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          [`${quantity}x Rp.${currency.format(pricePerUnit)}`, formattedSubtotal],
          {}
        );
        await BluetoothEscposPrinter.printText('\r\n', {});
      }
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Subtotal', 'Rp.' + currency.format(data.subtotal).toString()],
        {},
      );
      data.ppn != "" && data.ppn != 0 && data.ppn != null ? await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Ppn', currency.format(data.ppn).toString() + "%"],
        {},
      ) : null
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Total', 'Rp.' + currency.format(data.totalharga).toString()],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Tunai', 'Rp.' + currency.format(data.pembayaran).toString()],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Kembalian', 'Rp.' + currency.format(data.kembalian).toString()],
        {},
      );
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.printText('\r\n\r\n', {});
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['"' + 'Terimakasih Atas Pembeliannya' + '"'],
        {},
      );
      await BluetoothEscposPrinter.printText('\r\n\r\n', {});
      await BluetoothEscposPrinter.printText('\r\n\r\n', {});
      setModalVisibleLoading(false)
    } catch (e) {
      setModalVisibleLoading(false)
      alert(e.message || 'ERROR');
    }
  };
  const Submit = async () => {
    dispatch({ type: 'REMOVEALL' })
    dispatch({ type: 'NOMINAL', value: null })
    dispatch({ type: 'RMIDPRODUK', value: null })
    dispatch({ type: 'DISKON', valuenama: '', valuediskon: 0 })
    navigation.goBack()
  }
  const renderitem = items => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 4 }}>
          <Text style={{ color: '#000' }}>{items.nama_produk}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: '#000' }}>{items.qty}x </Text>
            <Text style={{ color: '#000' }}>Rp.{currency.format(items.harga)}</Text>
          </View>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={{ color: '#000' }}>Rp.{currency.format(items.subtotal)}</Text>
        </View>

      </View>
    );
  };
  const get = async () => {
    navigation.addListener('beforeRemove', (e) => {
      dispatch({ type: 'REMOVEALL' })
      dispatch({ type: 'NOMINAL', value: null })
      dispatch({ type: 'RMIDPRODUK', value: null })
      dispatch({ type: 'DISKON', valuenama: '', valuediskon: 0 })
    })
    const subtotal = CartReducer.cartitem.reduce((result, item) => item.count * item.subTotal + result, 0,)
    const diskon = DiskonReducer.diskon
    let total
    if (diskon == 0) {
      total = subtotal - (diskon)
    }
    else {
      if (diskon.split('-').length <= 1) {
        total = subtotal - (diskon.split('-')[0])
      }
      else {
        total = subtotal - (subtotal * diskon.split('-')[0] / 100)
      }
    }


    const tunai = TunaiReducer.nominal
    const kembalian = tunai - total
    setCurrencystate({
      subtotal: subtotal,
      diskon: diskon,
      total: total,
      tunai: tunai,
      kembalian: kembalian,
    })
  }
  useEffect(() => {
    get()
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#000', fontSize: 28, marginVertical: 22, fontFamily: 'InknutAntiqua-Regular' }}>BERHASIL</Text>
          {params.data.toko.img != null ? <Image source={{ uri: `data:${params.data.toko.mime};base64,${params.data.toko.img}` }} style={{ width: 100, height: 100 }} /> : null}

        </View>

        <View style={{ backgroundColor: '#fff', marginHorizontal: 25, marginTop: 12, borderRadius: 8, elevation: 6 }}>
          <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                {params.data.id_transaksi}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                {moment(params.data.created_at).format('DD MMM yyyy HH:mm:ss')}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Jenis Pembayaran : {params.data.jenis_pembayaran}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Icon name="whatsapp" size={20} color="#25D366" style={{ marginRight: 8 }} />
              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                : {params.data.toko.whatsapp}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Icon name="instagram" size={20} color="#E4405F" style={{ marginRight: 8 }} />
              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold', }}>
                : {params.data.toko.instagram}
              </Text>
            </View>

            <View style={{ borderBottomWidth: 1, marginVertical: 6 }}></View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Produk</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>Harga</Text>
            </View>
            {params.data.items.map((items, index) => {
              return <View style={{ paddingVertical: 12 }} key={index}>
                {renderitem(items)}
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, marginTop: 6 }}></View>
              </View>;
            })}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Subtotal</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Rp.{currency.format(params.data.subtotal)}
              </Text>
            </View>
            {params.data.ppn != "" && params.data.ppn != 0 && params.data.ppn != null ? <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Tarif PPN</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                {params.data.ppn}%
              </Text>
            </View> : null}
            {params.data.ppn != "" && params.data.ppn != 0 && params.data.ppn != null ? <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>PPN</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Rp.{currency.format(params.data.bulatppn)}
              </Text>
            </View> : null}

            <View style={{ borderBottomWidth: 1, marginVertical: 6 }}></View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Total</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Rp.{currency.format(params.data.totalharga)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Bayar</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Rp.{currency.format(params.data.pembayaran)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000', flex: 4, fontFamily: 'TitilliumWeb-Bold' }}>Kembalian</Text>

              <Text style={{ color: '#000', flex: 2, fontFamily: 'TitilliumWeb-Bold' }}>
                Rp.
                {currency.format(params.data.kembalian)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#034687',
              width: 50,
              height: 50,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setup()}>
            <Iprinter />
          </TouchableOpacity>
        </View>
      </ScrollView>



      <TouchableOpacity style={{
        backgroundColor: '#034687', padding: 16, alignItems: 'center',
        justifyContent: 'center', borderTopEndRadius: 24, borderTopLeftRadius: 24
      }} onPress={() => Submit()}>
        <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'TitilliumWeb-Bold' }}>OK</Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisibleLoading}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}>
          <ActivityIndicator size={100} color={'#3498db'} />
        </View>
      </Modal>
    </View>
  );
};

export default FinalPage;

const styles = StyleSheet.create({});
