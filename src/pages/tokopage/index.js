import { TouchableOpacity, StyleSheet, Text, View, Dimensions, Image, Animated, TouchableWithoutFeedback, Modal, ActivityIndicator } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';
import NetInfo from "@react-native-community/netinfo";
import db from '../../service/db';

const TokoPage = ({ route }) => {
  const currency = new Intl.NumberFormat('id-ID');
  const data = route.params
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded1, setIsExpanded1] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedHeight1 = useRef(new Animated.Value(0)).current;
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [Isonline, setIsonline] = useState(null);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);

    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 0 : 130, // Sesuaikan tinggi sesuai konten
      duration: 300, // Durasi animasi (lebih cepat atau lambat)
      useNativeDriver: false,
    }).start();
  };
  const toggleDropdown1 = () => {
    setIsExpanded1(!isExpanded1);

    Animated.timing(animatedHeight1, {
      toValue: isExpanded1 ? 0 : 130, // Sesuaikan tinggi sesuai konten
      duration: 300, // Durasi animasi (lebih cepat atau lambat)
      useNativeDriver: false,
    }).start();
  };
  const get = async () => {
    setModalVisibleLoading(true)

    const datasession = await AsyncStorage.getItem('datasession');
    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      const res = await axios.get(`${BASE_URL}/dashboardtoko/${data.data.id_toko}}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDashboardData(res.data.data);
    } catch (error) {
      setModalVisibleLoading(false)
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        alert(error.message);
        // setRefreshing(false);
      } else if (error.request) {
        console.log(error.request);
        alert(error.message);
        // setRefreshing(false);
      } else {
        console.log('Error', error.message);
        alert(error.message);
        // setRefreshing(false);
      }
    };
    setModalVisibleLoading(false)


  };
  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );
  const onPressPrdouk = () => {
    navigation.navigate('listkatalog', data)
  }
  const onPressPekerja = () => {
    navigation.navigate('listpekerja', data)
  }
  const onPressTransaksi = () => {
    navigation.navigate('transaksi', data)
  }
  const onPressTransaksipembelian = () => {
    navigation.navigate('transaksipembelian', data)
  }
  const onPressOpname = () => {
    navigation.navigate('opnamepage', data)
  }
  const onPressKartustok = () => {
    navigation.navigate('kartustok', data)
  }
  const onPressRiwayatTransaksi = () => {
    navigation.navigate('historypage', data)
  }
  const onPressRiwayatTransaksiPembelian = () => {
    navigation.navigate('historypembelianpage', data)
  }

  const onPressKategori = () => {
    navigation.navigate('kategoripage', data)
  }
  const onPressDiskon = () => {
    navigation.navigate('diskon', data)
  }
  let count = 1; // Menyimpan urutan valid
  let count1 = 1; // Menyimpan urutan valid

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

        {dashboardData && (
          <>
            <View style={[styles.card, { marginTop: 12 }]}>
              <View style={styles.row}>
                {dashboardData.toko.url_img == undefined ? (
                  dashboardData.toko.nama_toko.split(' ').length <= 1 ? (
                    <View
                      style={{
                        borderRadius: 6,
                        backgroundColor: '#626262',
                        height: 80,
                        width: 80,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                        {dashboardData.toko.nama_toko.slice(0, 1).toUpperCase() +
                          dashboardData.toko.nama_toko.slice(1, 2).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: '#626262',
                        borderRadius: 6,
                        height: 80,
                        width: 80,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                        {dashboardData.toko.nama_toko.split(' ')[0].slice(0, 1).toUpperCase() +
                          dashboardData.toko.nama_toko.split(' ')[1].slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  )
                ) : (
                  <Image source={{ uri: dashboardData.toko.url_img }} style={styles.image}></Image>
                )}

                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.cardValue}>{dashboardData.toko.nama_toko}</Text>
                  <Text style={styles.cardTitle}>{dashboardData.toko.alamat_toko}</Text>
                </View>
              </View>
              {dashboardData.toko.instagram != "" && dashboardData.toko.whatsapp != null ? <Text style={[styles.cardTitle, { marginTop: 6 }]}>{dashboardData.toko.whatsapp}</Text> : null}

              {dashboardData.toko.instagram != "" && dashboardData.toko.instagram != null ? <Text style={[styles.cardTitle]}>{dashboardData.toko.instagram}</Text> : null}

            </View>


            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <View style={[styles.card, { marginRight: 4, flex: 1 }]}>
                <Text style={styles.cardTitle}>Total Produk</Text>
                <Text style={styles.cardValue}>{dashboardData.produk_count}</Text>
              </View>
              <View style={[styles.card, { marginLeft: 4, flex: 1 }]}>
                <Text style={styles.cardTitle}>Total Transaksi Hari Ini</Text>
                <Text style={styles.cardValue}>{dashboardData.transaksi_count}</Text>
              </View>
            </View>
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <View style={[styles.card, { marginLeft: 4, flex: 1 }]}>
                <Text style={styles.cardTitle}>Total Pendapatan Hari Ini</Text>
                <Text style={styles.cardValue}>Rp {currency.format(dashboardData.total_pendapatan_harian)}</Text>
              </View>
              <View style={[styles.card, { marginLeft: 4, flex: 1 }]}>
                <Text style={styles.cardTitle}>Total Pendapatan Bulan Ini</Text>
                <Text style={styles.cardValue}>Rp {currency.format(dashboardData.total_pendapatan_bulanan)}</Text>
              </View>
            </View>
            <View style={[styles.card, { marginLeft: 4, flex: 1 }]}>
              <TouchableWithoutFeedback onPress={toggleDropdown} >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardValue}>
                    Produk Terlaris Toko
                  </Text>
                  <Text>{isExpanded ? "▲" : "▼"}</Text>
                </View>

              </TouchableWithoutFeedback>

              <Animated.View style={{ maxHeight: animatedHeight, overflow: "hidden" }}>

                {dashboardData.top_produk_all.map((item, index) =>
                  item.total_qty != 0 ? (
                    <View style={{ flexDirection: "row" }} key={index}>
                      <Text style={[styles.cardTitle, { marginRight: 8 }]}>
                        #{count++} {/* Menampilkan urutan yang benar */}
                      </Text>
                      <Text style={styles.cardTitle}>{item.nama_produk} | Qty : {item.total_qty} </Text>
                    </View>
                  ) : null
                )}
              </Animated.View>
            </View>
            <View style={[styles.card, { marginLeft: 4, flex: 1 }]}>
              <TouchableWithoutFeedback onPress={toggleDropdown1} >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardValue}>
                    Produk Terlaris Bulanan
                  </Text>
                  <Text>{isExpanded1 ? "▲" : "▼"}</Text>
                </View>

              </TouchableWithoutFeedback>

              <Animated.View style={{ maxHeight: animatedHeight1, overflow: "hidden" }}>

                {dashboardData.top_produk_bulanan.map((item, index) =>
                  item.total_qty != 0 ? (
                    <View style={{ flexDirection: "row" }} key={index}>
                      <Text style={[styles.cardTitle, { marginRight: 8 }]}>
                        #{count1++} {/* Menampilkan urutan yang benar */}
                      </Text>
                      <Text style={styles.cardTitle}>{item.nama_produk} | Qty : {item.total_qty} </Text>
                    </View>
                  ) : null
                )}
              </Animated.View>
            </View>
          </>
        )}


        <View style={styles.wrap}>

          <TouchableOpacity style={styles.card2} onPress={() => { onPressPekerja() }}>
            <Icon name="person" size={24} color="#3498db" />
            <Text style={styles.cardText}>Pekerja</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressKategori() }}>
            <Icon name="category" size={24} color="#3498db" />
            <Text style={styles.cardText}>Kategori Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressPrdouk() }}>
            <Icon name="shopping-bag" size={24} color="#3498db" />
            <Text style={styles.cardText}>Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressTransaksipembelian() }}>
            <Icon name="shopping-cart" size={24} color="#3498db" />
            <Text style={styles.cardText}>Pembelian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressOpname() }}>
            <Icon name="inventory" size={24} color="#3498db" />
            <Text style={styles.cardText}>Stok Opname</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressTransaksi() }}>
            <Icon name="sell" size={24} color="#3498db" />
            <Text style={styles.cardText}>Penjualan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressRiwayatTransaksiPembelian() }}>
            <Icon name="receipt-long" size={24} color="#3498db" />
            <Text style={styles.cardText}>Riwayat Pembelian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressKartustok() }}>
            <Icon name="card-giftcard" size={24} color="#3498db" />
            <Text style={styles.cardText}>Kartu Stok</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressRiwayatTransaksi() }}>
            <Icon name="history" size={24} color="#3498db" />
            <Text style={styles.cardText}>Riwayat Penjualan</Text>
          </TouchableOpacity>

          


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
          <ActivityIndicator size={100} color={'#3498db'} />
        </View>
      </Modal>
    </View>
  );

};
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  image: {
    borderRadius: 6,
    height: 80,
    // width: 80,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: '',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,

  },
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  card2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    // width: Dwidth * 0.285,
    width: Dwidth * 0.29,
    height: Dwidth * 0.25,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  card: {
    // flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#000"
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',

    color: "#000"
  }
});


export default TokoPage
