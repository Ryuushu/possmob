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
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import CardItem from '../../component/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { emptycart, emptyproduct } from '../../assets/image';
import moment from 'moment';
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
  const [modalVisibleNote, setModalVisibleNote] = useState(false);
  const [nominal, setNominal] = useState("");
  const [DataDiskon, setDataDiskon] = useState([]);
  const [Diskon, setDiskon] = useState(0);
  const [NamaDiskon, setNamaDiskon] = useState(' ');
  const [Note, setNote] = useState('');

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
    let id_user = user.user.id_user
    const data = [];
    const items = [];
    let indexs = [];

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
    data.push({ id_user, id_toko, items, bayar })

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
    // input({ sheetid, token, data, indexs, });


    // Alert.alert(
    //   'STOK HABIS',
    //   'Ada Stok Yang Lagi Kosong, Silahkan Tambah Terlebih Dahulu LaLu Lanjutkan Transaksi',
    //   [{ text: 'OK', onPress: () => navigation.replace('listkatalog') }],
    //   { cancelable: false },
    // );

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

            {/* <FlatList
              key={'flatlist'}
              data={CartReducer.cartitem}
              renderItem={({item, index}) => renderSubTotal(item, index)}
              keyExtractor={item => item.id}
              contentInset={{bottom: 150}}
            /> */}
          </View>

          {/* <View style={{ backgroundColor: '#fff' }}>
            <TouchableOpacity
              style={{
                textAlign: 'center',
                borderColor: '#034687',
                borderTopWidth: 1,
                backgroundColor: '#fff',
                color: '#fff',
              }}
              onLongPress={() => onLongPressDiskon()}
              onPress={() => onPressModalDiskon()}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      fontFamily: 'TitilliumWeb-Bold',
                    }}>
                    Diskon
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  {Diskon == 0 ? (
                    <Text
                      style={{
                        fontSize: 16,
                        paddingRight: 8,
                        color: '#000',
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      Rp.{Diskon}
                    </Text>
                  ) : Diskon.split('-').length <= 1 ? (
                    <Text
                      style={{
                        fontSize: 16,
                        paddingRight: 8,
                        color: '#000',
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      Rp.{Diskon.split('-')[0]}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        paddingRight: 8,
                        color: '#000',
                        fontFamily: 'TitilliumWeb-Bold',
                      }}>
                      {Diskon.split('-')[0]}%
                    </Text>
                  )}

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#000',
                    }}>
                    &#62;
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View> */}
          {/* <View style={{ backgroundColor: '#fff' }}>
            <TouchableOpacity
              style={{
                textAlign: 'center',
                borderColor: '#034687',
                borderTopWidth: 1,
                backgroundColor: '#fff',
                color: '#fff',
              }}
              onPress={() => setModalVisibleNote(true)}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      fontFamily: 'TitilliumWeb-Bold',
                    }}>
                    Catatan
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      paddingRight: 8,
                      color: '#000',
                      fontFamily: 'TitilliumWeb-Bold',
                    }}></Text>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#000',
                    }}>
                    &#62;
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View> */}
          <View style={styles.box2}>
            {/* <View style={{ width: '50%' }}>
              <Text style={styles.total_price}>
                Total: Rp.
                {currency.format(
                  Diskon == 0
                    ? CartReducer.cartitem.reduce(
                      (result, item) => item.count * item.subTotal + result,
                      0,
                    ) - 0
                    : Diskon.split('-').length <= 1
                      ? CartReducer.cartitem.reduce(
                        (result, item) => item.count * item.subTotal + result,
                        0,
                      ) - Diskon.split('-')[0]
                      : CartReducer.cartitem.reduce(
                        (result, item) => item.count * item.subTotal + result,
                        0,
                      ) -
                      (CartReducer.cartitem.reduce(
                        (result, item) => item.count * item.subTotal + result,
                        0,
                      ) *
                        Diskon.split('-')[0]) /
                      100,
                )}
              </Text>
            </View> */}
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
        visible={modalDiskonVisible}
        onRequestClose={() => {
          console.log('close');
          setModalDiskonVisible(!modalDiskonVisible);
        }}>
        <View style={{ flex: 1, backgroundColor: '#ededed' }}>
          <View
            style={{
              width: '100%',
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 6,
            }}>
            <TouchableOpacity
              onPress={() => setModalDiskonVisible(!modalDiskonVisible)}
              style={{ padding: 12 }}>
              <Text style={{ color: '#000', fontSize: 18, fontWeight: '500' }}>
                Back
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                marginLeft: 12,
              }}>
              Diskon
            </Text>
          </View>

          <ScrollView style={{ marginTop: 12 }}>
            {DataDiskon == null ? (
              <View style={styles.imgContainerStyle}>
                <View style={styles.imgwarpStyle}>
                  <Image style={styles.imageStyle} source={emptyproduct} />
                </View>
              </View>
            ) : (
              DataDiskon.map((item, i) => {
                return (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginHorizontal: 16,
                      backgroundColor: '#FFF',
                      padding: 12,
                      marginBottom: 12,
                      borderRadius: 12,
                      elevation: 4,
                    }}
                    key={i}
                    onPress={() => onPressDiskon(item[1], item[2])}>
                    <Text
                      style={{ color: '#000', fontSize: 18, fontWeight: '500' }}>
                      {item[1]}
                    </Text>
                    {item[2].split('-').length <= 1 ? (
                      <Text
                        style={{
                          color: '#000',
                          fontSize: 18,
                          fontWeight: '500',
                        }}>
                        Rp.{item[2].split('-')[0]}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: '#000',
                          fontSize: 18,
                          fontWeight: '500',
                        }}>
                        {item[2].split('-')[0]}%
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        visible={modalVisibleNote}
        onRequestClose={() => {
          setModalVisibleNote(!modalVisibleNote);
          setNote('');
        }}>
        <View style={{ flex: 1, backgroundColor: '#ededed' }}>
          <View
            style={{
              width: '100%',
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 6,
            }}>
            <TouchableOpacity
              onPress={() => {
                setModalVisibleNote(!modalVisibleNote);
                setNote('');
              }}
              style={{ padding: 12 }}>
              <Text style={{ color: '#000', fontSize: 18, fontWeight: '500' }}>
                Back
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '500',
                marginLeft: 12,
              }}>
              Tambah Catatan
            </Text>
          </View>
          <Text
            style={{
              textAlign: 'center',
              alignItems: 'center',
              fontSize: 24,
              marginVertical: 16,
              color: '#000',
              fontFamily: 'TitilliumWeb-Bold',
            }}>
            Catatan
          </Text>
          <View style={{ justifyContent: 'space-between', flex: 1 }}>
            <TextInput
              placeholderTextColor={'#000'}
              multiline={true}
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: '#000',
                marginHorizontal: 14,
                maxHeight: 150,
                borderRadius: 12,
                textAlignVertical: 'top',
                fontSize: 18,
                paddingHorizontal: 12,
                color: '#000',
                fontFamily: 'TitilliumWeb-Regular',
              }}
              placeholder={'SIlahkan Ketik Catatan'}
              onChangeText={value => setNote(value)}
              value={Note}
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#9B5EFF',
                padding: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setModalVisibleNote(!modalVisibleNote)}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'TitilliumWeb-Bold',
                  fontSize: 24,
                }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.modalView}>
            <View style={{ marginHorizontal: 14 }}>
              <TextInput
                placeholder="Masukan Nilai Tunai"
                placeholderTextColor={'#000'}
                multiline={true}
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  color: '#000',
                  marginVertical: 24,
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
          </View>
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

});
