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
import React, { useEffect, useState } from 'react';
import CardItem from '../../component/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  useSelector } from 'react-redux';
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
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [nominal, setNominal] = useState("");
  const [jenis_pembayaran, setJenispembayaran] = useState('');
  const [ppn, setPpn] = useState("");
  const [totalAkhir, setTotalAkhir] = useState(0);
  const [ppnAmount, setPpnAmount] = useState(0);
  const renderCartItem = item => {
    return <CardItem item={item} />;
  };

  const checkout = async (Total) => {
    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      const userSession = await AsyncStorage.getItem('datasession');

      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      if (!userSession) {
        alert('Data sesi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const user = JSON.parse(userSession);
      const id_toko = params?.data?.id_toko;
      const id_user = user?.id_user;
      const items = [];
      const data = [];
      let bayar;
      let numericValue;

      if (!Total || Total <= 0) {
        alert('Nominal pembayaran harus lebih dari 0.');
        return;
      }
      if (isNaN(Total)) {
        numericValue = Total.replace(/[^0-9]/g, '');
        bayar = parseInt(numericValue, 10);
      } else {
        bayar = parseInt(Total, 10);
      }
      console.log(bayar)
      if (!CartReducer.cartitem || CartReducer.cartitem.length === 0) {
        alert('Keranjang belanja kosong. Silakan tambahkan item.');
        return;
      }
      // let totalHarga = CartReducer.cartitem.reduce(
      //   (result, item) => item.count * item.subTotal + result,
      //   0
      // );
      if (bayar < totalAkhir) {
        alert('Uang yang dibayar tidak cukup untuk transaksi ini.');
        return;
      }
      for (let i = 0; i < CartReducer.cartitem.length; i++) {
        const qty = CartReducer.cartitem[i]?.count;
        const kode_produk = CartReducer.cartitem[i]?.item?.kode_produk;

        if (!kode_produk || qty <= 0) {
          alert('Data item tidak valid.');
          return;
        }

        items.push({ kode_produk, qty });
      }
      if (typeof jenis_pembayaran === 'undefined' || typeof ppn === 'undefined') {
        alert('Jenis pembayaran dan PPN harus diisi.');
        return;
      }
      data.push({ id_user, id_toko, items, bayar, jenis_pembayaran, ppn });

      const response = await axios.post(`${BASE_URL}/transaksi`, data[0], {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      navigation.replace('finalpage', { data: response.data });

    } catch (error) {
      if (error.response) {
        console.log(error.response)
        alert(error.response.data.message || 'Terjadi kesalahan pada server.');
      } else if (error.request) {
        alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert('Terjadi kesalahan: ' + error.message);
      }
      console.error('Kesalahan saat mengirim transaksi:', error);
    }
  };

  const onPressTunai = type => {
    // setModalVisibleLoading(true);
    if (type === 'PAS') {
      checkout(totalAkhir);
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
      setPpn(value.toString());
  };
  const calculateTotalWithPPN = () => {
    let totalHarga = CartReducer.cartitem.reduce(
      (result, item) => item.count * item.subTotal + result, 0
    );

    let ppnValue = parseFloat(ppn); // Ambil nilai PPN sebagai angka

    if (isNaN(ppnValue) || ppn === "" || ppnValue < 1 || ppnValue > 100) {
      setPpnAmount(0);
      setTotalAkhir(totalHarga);
      return;
    }

    let calculatedPpnAmount = (ppnValue / 100) * totalHarga;
    let calculatedTotalAkhir = totalHarga + calculatedPpnAmount;

    setPpnAmount(calculatedPpnAmount);
    setTotalAkhir(calculatedTotalAkhir);
  };


  useEffect(() => {
    calculateTotalWithPPN();
  }, [ppn, CartReducer.cartitem]); // Dipanggil setiap kali PPN atau item di keranjang berubah

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
              borderColor:"#ededed",
              borderBottomWidth:1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              elevation: 2,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              Subtotal
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
          <View
            style={{
              backgroundColor: '#fff',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              elevation: 2.5,
              borderColor:"#ededed",
              borderBottomWidth:1,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              PPN ({ppn}%)
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
              {currency.format(ppnAmount.toFixed(0))}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#fff',
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
              Total Harga
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
                totalAkhir.toFixed(0)
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
            <View style={{ flexDirection: 'row', borderRadius: 12, alignItems: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12, }}>
                <TextInput
                  placeholder="Masukkan PPN (%)"
                  placeholderTextColor={'#000'}
                  multiline={false}
                  numberOfLines={1}
                  style={{
                    color: '#000',
                    fontFamily: 'TitilliumWeb-Regular',
                    paddingHorizontal: 10,
                    flex: 1, // Agar input field menyesuaikan lebar yang tersedia
                  }}
                  onChangeText={value => {
                    // Hanya izinkan angka, hapus karakter selain digit
                    let newValue = value.replace(/[^0-9]/g, '');

                    // Pastikan nilai berada dalam rentang 0-100
                    if (newValue === '' || (parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 100)) {
                      handleTextChangeppn(newValue);
                    }
                  }}
                  value={ppn}
                  keyboardType="numeric"
                  maxLength={3} // Batas maksimal 3 digit
                />

                <Text style={{ marginRight: 12, color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>%</Text>
              </View>
              <TouchableOpacity
                style={[styles.formGroup, { marginTop: 6 }]}
                onPress={() => setModalVisibleCategory(true)}
              >
                <Text style={{ color: '#000', padding: 8 }}>
                  {jenis_pembayaran || "Pilih Jenis Pembayaran"}
                </Text>
              </TouchableOpacity>
             
              <TextInput
                placeholder="Masukan Nilai Tunai"
                placeholderTextColor={'#000'}
                multiline={true}
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  color: '#000',
                  marginBottom: 12,
                  borderRadius: 12,
                  fontFamily: 'TitilliumWeb-Regular',
                }}
                onChangeText={value => handleTextChange(value)}
                value={nominal}
                keyboardType={'number-pad'}
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
            <ScrollView style={{ flex: 1 }}>

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
    height: Dheight / 5.8,
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
