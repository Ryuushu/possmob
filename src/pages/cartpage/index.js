import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Button,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import CardItem from '../../component/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { emptycart } from '../../assets/image';
import BASE_URL from '../../../config';


const Cartpage = ({ route }) => {
  const params = route.params
  const currency = new Intl.NumberFormat('id-ID');
  const navigation = useNavigation();
  const CartReducer = useSelector(state => state.CartReducer);
  // const TRXReducer = useSelector(state => state.TRXReducer);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDiskonVisible, setModalDiskonVisible] = useState(false);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [nominal, setNominal] = useState("");
  const [DataDiskon, setDataDiskon] = useState([]);
  const [jenis_pembayaran, setJenispembayaran] = useState('');
  const [ppn, setPpn] = useState(0);


  const dispatch = useDispatch();

  const renderCartItem = item => {
    return <CardItem item={item} />;
  };

  const input = ({ sheetid, token, data, indexs, listcount, stoksisa }) => {

  };
  const checkout = async Total => {
    const token = await AsyncStorage.getItem('tokenAccess');
    const user = JSON.parse(await AsyncStorage.getItem('datasession'));
    const id_toko = params.data.id_toko;
    const id_user = user.id_user

    const data = [];
    const items = [];
    let indexs = [];
    let bayar
    let numericValue;

    if (isNaN(Total)) {
      // If Total is not a number, replace non-numeric characters
      numericValue = Total.replace(/[^0-9]/g, '');

      bayar = parseInt(numericValue, 10);


    } else {
      // If Total is already a number, just assign it directly
      bayar = parseInt(Total, 10);
    }
    // dispatch({ type: 'NOMINAL', value: Total });
    let totalHarga = CartReducer.cartitem.reduce(
      (result, item) => item.count * item.subTotal + result,
      0,
    );

    // Validasi apakah uang yang dibayar cukup
    if (bayar < totalHarga) {
      alert('Uang yang dibayar tidak cukup untuk transaksi ini');
      return;
    }

    for (let i = 0; i < CartReducer.cartitem.length; i++) {
      const qty = CartReducer.cartitem[i].count;
      const kode_produk = CartReducer.cartitem[i].item.kode_produk;

      items.push({ kode_produk, qty });
    }
    data.push({ id_user, id_toko, items, bayar, jenis_pembayaran,ppn })

    try {
      const response = await axios.post(`${BASE_URL}/transaksi`, data[0], {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log('Transaksi berhasil:', response.data);
      navigation.replace('finalpage', { data: response.data })
    } catch (error) {
      alert(error.response.data.message);
      console.error('Terjadi kesalahan saat mengirim transaksi:', error.response || error.message);
    }
  };
  const onPressTunai = type => {
    // setModalVisibleLoading(true);
    if (type === 'PAS') {
      let total;
      total =
        CartReducer.cartitem.reduce(
          (result, item) => item.count * item.subTotal + result,
          0,
        )
      checkout(total);
    } else {
      if (
        nominal == null ||
        nominal == '' ||
        nominal.replace(/^\s+/, '').replace(/\s+$/, '') == ''
      ) {
        alert('Tidak Boleh Kosong');
      } else if (nominal == 0) {
        alert('Angka Awal tidak Boleh Nol');
      } else {
        checkout(nominal.split('.').join(''));
      }
    }
  };
  const onPressModalDiskon = async () => {
    const sheetid = await AsyncStorage.getItem('TokenSheet');
    const token = await AsyncStorage.getItem('tokenAccess');
    await axios
      .get(
        'https://sheets.googleapis.com/v4/spreadsheets/' +
        sheetid +
        '/values/Diskon',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(res => {
        if (res.data.values == undefined) {
          setItems([]);
        } else {
          setDataDiskon(res.data.values);
        }
      }).catch(error => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          alert(error.message);
          setRefreshing(false);

        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
          alert(error.message);
          setRefreshing(false);

        } else {
          console.log('Error', error.message);
          alert(error.message);
          setRefreshing(false);

        }
      });
    setModalDiskonVisible(true);
  };
  const onPressDiskon = (nama, diskon) => {
    setNamaDiskon(nama.replace(/\s+/g, '-'));
    setDiskon(diskon);
    dispatch({ type: 'DISKON', valuenama: nama, valuediskon: diskon });
    setModalDiskonVisible(!modalDiskonVisible);
  };
  const onLongPressDiskon = () => {
    setDiskon(0);
  };
  const formatCurrency = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue === '') return '';
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${formattedValue}`;
  };
  const handleTextChange = (value) => {
    const formattedValue = formatCurrency(value);
    setNominal(formattedValue);
  };
  const handleTextChangeppn = (value) => {
    // Ensure the value is a valid number and store as a percentage

      setPpn(value.toString());
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.box1}>
        <StatusBar backgroundColor={'#151B25'} barStyle="light-content" />
        <FlatList
          key={'flatlist'}
          data={CartReducer.cartitem}
          renderItem={({ item }) => renderCartItem(item)}
          keyExtractor={item => item.id}
          contentInset={{ bottom: 150 }}
          contentContainerStyle={{
            paddingBottom:
              CartReducer.cartitem.length > 0
                ? Dimensions.get('screen').height / 3.5
                : 0,
          }}
        />
      </View>

      {CartReducer.cartitem.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              elevation: 2.5,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              Total
            </Text>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              Rp.
              {currency.format(
                CartReducer.cartitem.reduce(
                  (result, item) => item.count * item.subTotal + result,
                  0,
                ),
              )}
            </Text>
          </View>
          <View style={styles.box2}>
            <View style={{ width: '100%' }}>
              <TouchableOpacity
                style={styles.checkout_container}
                onPress={() => {
                  setNominal("")
                  setModalVisible(true)
                }}>
                <Text style={styles.checkout}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={styles.imgwarpStyle}>
            <Image style={styles.imageStyle} source={emptycart} />
          </View>

          <Text style={styles.title}>Keranjang Kosong</Text>
          <Button
            color={'#695bd1'}
            title="Shop Now"
            onPress={() => {
              navigation.replace('Routestack');
            }}
          />
        </View>
      )}
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('close');
          setModalVisible(!modalVisible);
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setModalVisible(!modalVisible)}
          activeOpacity={1}>
          <Pressable style={styles.modalView}>
            <View style={{ marginHorizontal: 14 }}>
              <TextInput
                placeholder="Masukan Nilai Tunai"
                placeholderTextColor={'#000'}
                multiline={true}
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  color: '#000',
                  marginTop: 24,
                  borderRadius: 12,
                  fontFamily: 'TitilliumWeb-Regular',
                }}
                onChangeText={value => handleTextChange(value)}
                value={nominal}
                keyboardType={'number-pad'}
              />
              <TouchableOpacity
                style={styles.formGroup}
                onPress={() => setModalVisibleCategory(true)}
              >
                <Text style={{ color: '#000', padding: 8 }}>
                  {jenis_pembayaran || "Pilih Jenis Pembayaran"}
                </Text>
              </TouchableOpacity>
              <TextInput
                placeholder="Masukkan PPN (%)"
                placeholderTextColor={'#000'}
                multiline={false} // Since it's for numeric input
                numberOfLines={1}
                style={{
                  borderWidth: 1,
                  color: '#000',
                  marginBottom: 24,
                  borderRadius: 12,
                  fontFamily: 'TitilliumWeb-Regular',
                }}
                onChangeText={value => handleTextChangeppn(value)}
                value={ppn}
                keyboardType={'decimal-pad'}
                maxLength={5} // Optional: limit to two decimal places (adjust as needed)
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#034687',
                    padding: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    width: '48%',
                  }}
                  onPress={() => onPressTunai('PAS')}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 24,
                      fontFamily: 'TitilliumWeb-Bold',
                    }}>
                    Uang Pas
                  </Text>
                </TouchableOpacity>
                {nominal == null ||
                  nominal == '' ||
                  nominal.replace(/^\s+/, '').replace(/\s+$/, '') == '' ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(3, 70, 135, 0.5)',
                      width: '50%',
                      padding: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 24,
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      OK
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#034687',
                      padding: 6,
                      width: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                    }}
                    onPress={() => onPressTunai('nopas')}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 24,
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      OK
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Pressable>
        </TouchableOpacity>
      </Modal>
      <Modal transparent={true} visible={modalVisibleCategory}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisibleCategory(false)}
        >
          <Pressable onPress={() => { }} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Jenis Pembayaran</Text>
            <ScrollView style={{ flex: 1, marginBottom: 12 }}>

              <TouchableOpacity

                style={styles.btnitemcategory}
                onPress={() => {
                  setJenispembayaran("Tunai")
                  setModalVisibleCategory(!modalVisibleCategory)
                }}
              >
                <Text style={{ color: '#000', textAlign: 'center' }}>Tunai</Text>
              </TouchableOpacity>
              <TouchableOpacity

                style={styles.btnitemcategory}
                onPress={() => {
                  setJenispembayaran("Non-Tunai")
                  setModalVisibleCategory(!modalVisibleCategory)
                }}
              >
                <Text style={{ color: '#000', textAlign: 'center' }}>Non-Tunai</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Cartpage;
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  modalView: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  box1: {
    display: 'flex',
    flexDirection: 'column',
  },
  box2: {
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    flexDirection: 'row',
    display: 'flex',
    flex: 1,
  },
  total_price: {
    height: 50,
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'TitilliumWeb-Bold',
    backgroundColor: '#fff',
    color: '#034687',
  },
  checkout_container: {
    textAlign: 'center',
    height: 50,
    backgroundColor: '#034687',
    color: '#fff',
  },
  checkout: {
    width: '100%',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'TitilliumWeb-Bold',
    color: '#fff',
  },
  imgContainerStyle: {
    height: 150,
    width: 250,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    resizeMode: 'center',
  },
  title: {
    color: '#000',
    fontFamily: 'arial',
    fontSize: 20,
    marginBottom: 20,
  },
  btnStyle: {
    padding: 10,
    backgroundColor: '#034687',
    borderRadius: 20,
    margin: 20,
    fontSize: 16,
  },

  imgwarpStyle: {
    marginHorizontal: Dwidth * 0.06,
    height: Dheight / 2.5,
    width: "100%",
  },
  formGroup: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 8,
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: Dwidth / 1.2,
    height: Dheight / 2,
    borderRadius: 12,
  },
  modalTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 12,
  },
  btnitemcategory: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },

});
