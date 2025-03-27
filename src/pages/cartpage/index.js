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
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CardItem from '../../component/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { emptycart } from '../../assets/image';
import BASE_URL from '../../../config';
import NetInfo from "@react-native-community/netinfo";
import db from '../../service/db';

const Cartpage = ({ route }) => {
  const params = route.params
  const currency = new Intl.NumberFormat('id-ID');
  const navigation = useNavigation();
  const CartReducer = useSelector(state => state.CartReducer);
  // const TRXReducer = useSelector(state => state.TRXReducer);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [modalVisibleDiskon, setModalVisibleDiskon] = useState(false);
  const [modalVisiblePpn, setModalVisiblePpn] = useState(false);
  const [nominal, setNominal] = useState("");
  const [jenis_pembayaran, setJenispembayaran] = useState('');
  const [ppn, setPpn] = useState(0);
  const [totalAkhir, setTotalAkhir] = useState(0);
  const [ppnAmount, setPpnAmount] = useState(0);
  const [isEnabled, setIsEnabled] = useState();
  const [valuediskon, setEditDiskon] = useState(0);
  // const [valuediskon, setValuediskon] = useState(0);

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
    setEditDiskon('');
  };

  const renderCartItem = item => {
    return <CardItem item={item} />;
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
        checkout(nominal.replace(/[^\d]/g, ''));
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
      (result, item) => result + (item.count * item.subTotal), 0
    );
    let ppnValue = parseFloat(ppn) || 0;
    let diskonValue = parseFloat(valuediskon) || 0;
    let calculatedPpnAmount = Math.round((ppnValue / 100) * totalHarga);
    let totalSetelahPPN = totalHarga + calculatedPpnAmount;
    let calculatedDiskonAmount = isEnabled
      ? diskonValue
      : Math.round((diskonValue / 100) * totalSetelahPPN);
    let calculatedTotalAkhir = totalSetelahPPN - calculatedDiskonAmount;
    setPpnAmount(calculatedPpnAmount);
    setTotalAkhir(calculatedTotalAkhir);
  };

  const checkout = async (Total) => {
    try {
      setModalVisibleLoading(true);

      const token = await AsyncStorage.getItem('tokenAccess');
      const userSession = await AsyncStorage.getItem('datasession');

      if (!token || !userSession) {
        alert('Token atau sesi tidak ditemukan. Silakan login kembali.');
        setModalVisibleLoading(false);
        return;
      }

      const user = JSON.parse(userSession);
      const id_toko = params?.data?.id_toko;
      const id_user = user?.id_user;

      if (!CartReducer.cartitem || CartReducer.cartitem.length === 0) {
        alert('Keranjang belanja kosong. Silakan tambahkan item.');
        setModalVisibleLoading(false);
        return;
      }

      let bayar = parseInt(Total, 10);
      console.log(bayar)
      if (isNaN(bayar) || bayar <= 0) {
        alert('Nominal pembayaran harus lebih dari 0.');
        setModalVisibleLoading(false);
        return;
      }

      if (bayar < totalAkhir) {
        alert('Uang yang dibayar tidak cukup untuk transaksi ini.');
        setModalVisibleLoading(false);
        return;
      }

      if (!jenis_pembayaran) {
        alert('Jenis pembayaran.');
        setModalVisibleLoading(false);
        return;
      }

      const items = CartReducer.cartitem
        .map(item => ({
          kode_produk: item?.item?.kode_produk,
          qty: item?.count
        }))
        .filter(item => item.kode_produk && item.qty > 0);

      if (items.length === 0) {
        alert('Data item tidak valid.');
        setModalVisibleLoading(false);
        return;
      }
      const bulatppn = ppnAmount.toFixed(0);
      const tipediskon = isEnabled ? "nominal" : "persen";
      const data = { id_user, id_toko, items, bayar, jenis_pembayaran, ppn, bulatppn, valuediskon, tipediskon };
      const response = await axios.post(`${BASE_URL}/transaksi`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log(response.data)
      setModalVisibleLoading(false);
      navigation.replace('finalpage', { data: response.data });
    } catch (error) {
      setModalVisibleLoading(false);

      if (error.response) {
        console.log(error.response);
        alert(error.response.data.message || 'Terjadi kesalahan pada server.');
      } else if (error.request) {
        alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert('Terjadi kesalahan: ' + error.message);
      }

      console.error('Kesalahan saat mengirim transaksi:', error);
    }
  };
  useEffect(() => {
    calculateTotalWithPPN();
  }, [ppn, valuediskon, CartReducer.cartitem]);
  // Dipanggil setiap kali PPN atau item di keranjang berubah

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
              borderColor: "#ededed",
              borderBottomWidth: 1,
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
              borderColor: "#ededed",
              borderBottomWidth: 1,
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
          <TouchableOpacity
            onPress={() => setModalVisiblePpn(true)}
            style={{
              backgroundColor: '#fff',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              elevation: 2.5,
              borderColor: "#ededed",
              borderBottomWidth: 1,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              Ppn
            </Text>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              {ppn}%{` >`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisibleDiskon(true)}
            style={{
              backgroundColor: '#fff',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              elevation: 2.5,
              borderColor: "#ededed",
              borderBottomWidth: 1,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              Diskon
            </Text>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                fontFamily: 'TitilliumWeb-Bold',
                paddingVertical: 8,
              }}>
              {isEnabled ? `Rp. ${valuediskon}` : `${valuediskon}%`}{` >`}
            </Text>
          </TouchableOpacity>
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
      <Modal
        transparent={true}
        visible={modalVisibleLoading}>
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
              <TouchableOpacity
                style={[styles.formGroup]}
                onPress={() => setModalVisibleCategory(true)}>
                <View style={{ flexDirection: "row",justifyContent:'space-between' }}>
                  <Text style={{ color: '#000', padding: 8 }}>
                    {jenis_pembayaran || "Pilih Jenis Pembayaran"}
                  </Text>
                  <Text style={{ color: '#000', padding: 8 }}>
                    {`˅`}
                  </Text>
                </View>
              </TouchableOpacity>

              <TextInput
                placeholder="Masukan Nilai Tunai"
                placeholderTextColor={'#000'}
                multiline={true}
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  color: '#000',
                  marginVertical: 12,
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
                  
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#007bff',
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
                      fontSize: 18,
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
                        fontSize: 18,
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      OK
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007bff',
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
            <ScrollView style={{ }}>
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
      <Modal transparent={true} visible={modalVisibleDiskon}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisibleDiskon(false)
            setEditDiskon(0)
          }}
        >
          <Pressable onPress={() => { }} style={styles.modalContent1}>
            <Text style={styles.modalTitle}>Diskon</Text>
            <ScrollView style={{ padding: 12 }}>
              <View style={{ flex: 1 }}>
                {isEnabled ?
                  <View style={{ paddingHorizontal: 12, borderColor: '#18AECF', borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#000' }}>Rp.</Text>
                    <TextInput
                      keyboardType='number-pad'
                      placeholder={'Diskon'}
                      value={valuediskon}
                      style={{
                        color: '#000',
                        fontSize: 16,
                        flex: 1
                      }}
                      placeholderTextColor={'#000'}
                      onChangeText={value => setEditDiskon(value)}
                    />

                  </View>
                  : <View style={{ borderColor: '#1B99D4', borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TextInput
                      keyboardType='number-pad'
                      placeholder={'Diskon'}
                      value={valuediskon}
                      style={{
                        color: '#000',
                        fontSize: 16,
                        paddingLeft: 12,
                        flex: 1
                      }}
                      placeholderTextColor={'#000'}
                      onChangeText={value => setEditDiskon(value)}
                    />
                    <Text style={{ color: '#000', marginRight: 12 }}>%</Text>
                  </View>
                }
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#000',
                    fontSize: 14,
                    marginVertical: 12,
                  }}>
                  Ganti Format
                </Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isEnabled ? '#007bff' : '#DBE8E1'}
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                {isEnabled ? <Text style={{ color: '#000' }}>Rp.</Text> : <Text style={{ color: '#000' }}>%</Text>}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: '#007bff',
                  padding: 6,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                }}
                onPress={() => setModalVisibleDiskon(false)}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 24,
                    fontFamily: 'TitilliumWeb-Bold',
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>
      <Modal transparent={true} visible={modalVisiblePpn}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisiblePpn(false)
            setPpn(0)
          }}
        >
          <Pressable onPress={() => { }} style={styles.modalContent1}>
            <Text style={styles.modalTitle}>PPN</Text>
            <ScrollView style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', borderRadius: 12, alignItems: 'center', alignItems: 'center', borderWidth: 1, marginVertical: 12, }}>
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
                style={{
                  backgroundColor: '#007bff',
                  padding: 6,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                }}
                onPress={() => setModalVisiblePpn(false)}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 24,
                    fontFamily: 'TitilliumWeb-Bold',
                  }}>
                  OK
                </Text>
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
    paddingVertical:16,
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
    color: '#007bff',
  },
  checkout_container: {
    textAlign: 'center',
    height: 50,
    backgroundColor: '#007bff',
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
    backgroundColor: '#007bff',
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
    borderRadius: 12,
  },
  modalContent1: {
    backgroundColor: '#fff',
    width: Dwidth / 1.2,
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
