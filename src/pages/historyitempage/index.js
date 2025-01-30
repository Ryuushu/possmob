import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { chillLogo } from '../../assets/image/logo';


moment.suppressDeprecationWarnings = true;
const HistoryItemPage = ({ route, navigation }) => {
  let fakturContainer = null;
  const [Data, setData] = useState([]);
  const [DataTotal, setDataTotal] = useState([]);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);

  const [dataDate, setdataDate] = useState([]);
  const [Tunai, setTunai] = useState();
  const [IdTrx, setIdTrx] = useState();
  const [Owner, setOwner] = useState();
  const [Pesan, setPesan] = useState();
  const [Status, setStatus] = useState();

  const [ValueDiskon, setValueDiskon] = useState(0);

  const [SubTotal, setSubTotal] = useState(0);
  const [Total, setTotal] = useState(0);

  const currency = new Intl.NumberFormat('id-ID');
  const isFocused = useIsFocused();
  const item = route.params;
  const onPressprint = async () => {
    try {
      await BluetoothEscposPrinter.printText('\r\n\r\n', {});
      await BluetoothEscposPrinter.printPic64(chillLogo, { width: 200, height: 150 });
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      );
      await BluetoothEscposPrinter.setBlob(3);
      // await BluetoothEscposPrinter.printText('\r\n', {});
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['\x1B\x61\x01Jl. KIS Mangunsarkoro, Kali Nangkaan,Dabasah,Kec.Bondowoso, Kabupaten Bondowoso,Jawa Timur 68216'],
        {},
      );
      await BluetoothEscposPrinter.setBlob(0);

      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [10, 22],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Transaksi', IdTrx],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [dataDate[0], dataDate[1]],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Kasir', Owner],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Whatsapp', '085604745727'],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Instagram', 'wijayavape22'],
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

      for (const element of Data) {
        const product = element.produk;
        const quantity = element.data[0][2];
        const pricePerUnit = element.data[0][3];

        const subtotal = quantity * pricePerUnit;
        const formattedSubtotal = 'Rp.' + currency.format(subtotal);

        await BluetoothEscposPrinter.printColumn(
          [32],
          [BluetoothEscposPrinter.ALIGN.LEFT],
          [product],
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
        ['Subtotal', 'Rp.' + currency.format(SubTotal).toString()],
        {},
      );
      if (ValueDiskon == 0) {
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ['Diskon', 'Rp.' + ValueDiskon],
          {},
        );
      }
      else if (ValueDiskon.length == 1) {
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ['Diskon', '-Rp.' + ValueDiskon],
          {},
        );
      }
      else {
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ['Diskon', ValueDiskon + '%'],
          {},
        );
      }

      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Total', 'Rp.' + currency.format(Total).toString()],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Tunai', 'Rp.' + currency.format(Tunai).toString()],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Kembalian', 'Rp.' + currency.format(Tunai - Total).toString()],
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
    } catch (e) {
      alert(e.message || 'ERROR');
    }
  };
  const onPressKirim = async () => {
    if (fakturContainer) {
      try {
        const uri = await captureRef(fakturContainer, {
          format: "png",
          quality: 0.9,
          result: 'data-uri'
        });
        shareImageViaWhatsApp(uri);
      } catch (error) {
        console.log("Gagal mengambil tangkapan layar faktur:", error);
      }
    }
  };
  const shareImageViaWhatsApp = async (base64Data) => {
    const shareOptions = {
      // url: `data:image/png;base64,${base64Data}`,
      url: base64Data,
      failOnCancel: false,
      social: Share.Social.WHATSAPP,
    };

    try {
      await Share.shareSingle(shareOptions);
    } catch (error) {
      console.log("Gagal membagikan gambar:", error);
    }
  }
  const onPressrefund = async () => {
    try {
      const sheetid = await AsyncStorage.getItem('TokenSheet');
      const token = await AsyncStorage.getItem('tokenAccess');
      indexs.map(e => {
        axios.post('https://sheets.googleapis.com/v4/spreadsheets/' + sheetid + '/values:batchUpdate', JSON.stringify({
          data: {
            values: [['Refund']],
            range: 'k' + e
          },
          valueInputOption: 'USER_ENTERED'
        }),
          {
            headers: {
              'Content-type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
          },)
      })
      // https://sheets.googleapis.com/v4/spreadsheets/193U-hvY1-HbXF44_dbHUxwFeUimLXgr4Pmlc4GZpZog/values/k1:append

      navigation.navigate('historypage')
    } catch (e) {
      console.log(e)
    }
  }

  const get = async () => {
    console.log(item.item.item.detail_transaksi)
    const sheetid = await AsyncStorage.getItem('TokenSheet');
    const token = await AsyncStorage.getItem('tokenAccess');
    // setModalVisibleLoading(true);
    // await axios
    //   .get(
    //     'https://sheets.googleapis.com/v4/spreadsheets/' +
    //     sheetid +
    //     '/values/Transaksi',
    //     {
    //       headers: {
    //         Authorization: 'Bearer ' + token,
    //       },
    //     },
    //   )
    //   .then(res => {
    //     const j = res.data.values.filter(fill => fill[0] == idtrx);
    //     setDataTotal(j);
    //     const srawdate = j[0][5].split(' ');
    //     const [day, month, year] = srawdate[0].split('-');

    //     const rawdate = moment(year + '-' + month + '-' + day)
    //       .format('DD MMM yyyy')
    //       .concat('T' + srawdate[1]);
    //     setdataDate(rawdate.split('T'));
    //     setTunai(j[0][4]);
    //     setIdTrx(j[0][0]);
    //     setOwner(j[0][9]);
    //     setPesan(j[0][8]);
    //     setStatus(j[0][10]);
    //     const rawdiskon = j[0][7].split(' ');
    //     let Total;
    //     const subtotal = j.reduce(
    //       (result, item) => parseInt(item[3]) * parseInt(item[2]) + result,
    //       0,
    //     );
    //     if (rawdiskon.length == 1) {
    //       setValueDiskon(rawdiskon[0]);
    //       Total = (subtotal - rawdiskon[0]);
    //     } else {
    //       if (rawdiskon[1].split('-').length <= 1) {
    //         setValueDiskon(rawdiskon[1].split('-'));
    //         Total = (subtotal - rawdiskon[1].split('-')[0])
    //       } else {

    //         setValueDiskon(rawdiskon[1].split('-'));
    //         Total = subtotal - (subtotal * rawdiskon[1].split('-')[0]) / 100;
    //       }

    //     }


    //     setSubTotal(subtotal);
    //     setTotal(Total);

    //     let result = [];
    //     j.forEach(
    //       (indices => v => {
    //         if (v in indices) result[indices[v]]++;
    //         else indices[v] = result.push(1) - 1;
    //       })({}),
    //     );
    //     const groups = j.reduce((groups, data) => {
    //       const produk = data[1];
    //       if (!groups[produk]) {
    //         groups[produk] = [];
    //       }
    //       groups[produk].push(data);
    //       return groups;
    //     }, {});
    //     const groupArrays = Object.keys(groups).map(produk => {
    //       return {
    //         produk,
    //         data: groups[produk],
    //       };
    //     });
    //     setData(groupArrays);
    //     setModalVisibleLoading(false);
    //   })
    //   .catch(error => {
    //     if (error.response) {
    //       // The request was made and the server responded with a status code
    //       // that falls out of the range of 2xx
    //       console.log(error.response.data);
    //       console.log(error.response.status);
    //       console.log(error.response.headers);
    //     } else if (error.request) {
    //       // The request was made but no response was received
    //       // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //       // http.ClientRequest in node.js
    //       console.log(error.request);
    //       alert(error.message);
    //     } else {
    //       // Something happened in setting up the request that triggered an Error
    //       console.log('Error', error.message);
    //     }
    //   });
  };
  useEffect(() => {
    get();
  }, [isFocused]);
  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <ScrollView>
        <View style={{ marginHorizontal: 14 }}>
          <ViewShot ref={(ref) => (fakturContainer = ref)}>
            <View style={{ backgroundColor: '#fff' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                }}>
                <View>
                  <Text style={{ color: '#000', fontFamily: 'InknutAntiqua-Regular' }}>
                    {item.item.item.id_transaksi}
                  </Text>
                  <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Light' }}>
           
                    {moment(item.item.item.created_at).format('DD MMM yyyy HH:mm:ss')}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: '#000', fontFamily: 'InknutAntiqua-Regular' }}>
                    Rp.
                    {currency.format(item.item.item.totalharga)}
                  </Text>
                  <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Light' }}>
                    {Owner}
                  </Text>
                </View>
              </View>
              {/* <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold', paddingTop: 6, fontSize: 16 }}>Catatan :</Text>
              <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular', paddingTop: 4, paddingBottom: 16, fontSize: 14 }}>{Pesan}</Text> */}


              <View
                style={{
                  marginVertical:12,
                  borderStyle: 'dashed',
                  borderBottomWidth: 1,
                  borderColor: '#C3C3C3',
                }}></View>
              <View
                style={{
                  backgroundColor: '#EEFFFC',
           
                  paddingVertical: 16,
                  borderRadius: 8,
                }}>
                <View style={{ marginHorizontal: 14 }}>
                  {item.item.item.detail_transaksi.map((item, index) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 4,
                        }}
                        key={index}>
                        <View
                          style={{
                            flex: 1,
                            paddingVertical: 4,

                          }}>

                          <Text
                            style={{
                              color: '#000',
                              fontFamily: 'TitilliumWeb-Regular',
                            }}>

                            {item.produk.nama_produk}
                          </Text>
                          <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',


                          }}>
                            <View>
                              <Text
                                style={{
                                  color: '#000',
                                  fontFamily: 'TitilliumWeb-Regular',
                                }}>
                                {item.qty}x Rp.{currency.format(item.harga)}
                              </Text>
                            </View>
                            <View>
                              <Text
                                style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                                Rp.{currency.format(item.subtotal)}
                              </Text>
                            </View>
                          </View>


                        </View>


                      </View>
                    );
                  })}

                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: '#000',
                      marginVertical: 12,
                    }}></View>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                      Total
                    </Text>
                    <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                      Rp.
                      {currency.format(item.item.item.totalharga)}
                    </Text>
                  </View>
                  {/* <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                      Diskon
                    </Text>
                    {ValueDiskon == 0 ? <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                      Rp.{ValueDiskon}
                    </Text> :
                      ValueDiskon.length == 1 ? <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                        -Rp.{ValueDiskon}
                      </Text> : <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                        {ValueDiskon}
                      </Text>}

                  </View> */}
                </View>
              </View>
              {/* <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 24,
                  marginBottom: 12,
                  marginHorizontal: 14,
                }}>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Total
                </Text>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Rp.
                  {currency.format(Total)}
                </Text>
              </View> */}
              <View
                style={{
                  marginVertical:12,
                  borderStyle: 'dashed',
                  borderBottomWidth: 1,
                  borderColor: '#C3C3C3',
                }}></View>
              <View
                style={{
                  
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 14,
                }}>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Tunai
                </Text>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Rp.{currency.format(item.item.item.pembayaran)}
                </Text>
              </View>
              <View
                style={{
                  marginBottom: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 14,
                }}>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Kembalian
                </Text>
                <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                  Rp.{currency.format(item.item.item.kembalian)}
                </Text>
              </View>
            </View>
          </ViewShot>

          <View style={{ alignItems: 'center', flexDirection: Status == 'Refund' ? 'column' : 'row', marginBottom: 18, marginHorizontal: 26 }}>
            <TouchableOpacity
              onPress={() => onPressprint()}
              style={{
                flex: 1,
                borderWidth: 1,
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                marginRight: 12
              }}>
              <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                Cetak
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressKirim()}
              style={{
                flex: 1,
                borderWidth: 1,
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                marginLeft: 12
              }}>
              <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                Kirim
              </Text>
            </TouchableOpacity>
          </View>
          {/* {Status == 'Refund' ? null : <TouchableOpacity
            onPress={() => onPressrefund()}
            style={{
              marginHorizontal: 26,
              justifyContent: 'center',
              borderColor: '#CB0000',
              borderWidth: 1,
              alignItems: 'center',
              padding: 14,
              borderRadius: 12,
              // width: '40%',
            }}>
            <Text style={{ color: '#CB0000', fontFamily: 'TitilliumWeb-Bold' }}>
              Refund
            </Text>
          </TouchableOpacity>} */}

          {/* <TouchableOpacity onPress={() => onPressKirim()}>
          <Text style={{color: '#000'}}>Kirim</Text>
        </TouchableOpacity> */}
        </View>
      </ScrollView>


      <Modal transparent={true} visible={modalVisibleLoading}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}>
          <ActivityIndicator size={100} color={'#44dfff'} />
        </View>
      </Modal>
    </View>
  );
};

export default HistoryItemPage;

const styles = StyleSheet.create({});
