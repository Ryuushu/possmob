import { TextInput, TouchableOpacity, StyleSheet, Text, View, Dimensions, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config';
import { Ilist } from '../../assets/icon';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';
const TokoPage = ({ route }) => {
  const currency = new Intl.NumberFormat('id-ID');
  const data = route.params
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const get = async () => {
    const datasession = await AsyncStorage.getItem('datasession');
    try {
      // setModalVisibleLoading(true);
      const token = await AsyncStorage.getItem('tokenAccess');
      const res = await axios.get(`${BASE_URL}/dashboardtoko/${data.data.id_toko}}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDashboardData(res.data.data);
      // setModalVisibleLoading(false);
    } catch (error) {
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
  const onPressKategori = () => {
    navigation.navigate('kategoripage', data)
  }
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.card, {}]}>
          <View style={styles.row}>
            {data.data.url_img == undefined ? (
              data.data.nama_toko.split(' ').length <= 1 ? (
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
                    {data.data.nama_toko.slice(0, 1).toUpperCase() +
                      data.data.nama_toko.slice(1, 2).toUpperCase()}
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
                    {data.data.nama_toko.split(' ')[0].slice(0, 1).toUpperCase() +
                      data.data.nama_toko.split(' ')[1].slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )
            ) : (
              <Image source={{ uri: data.data.url_img }} style={styles.image}></Image>
            )}

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardValue}>{data.data.nama_toko}</Text>
              <Text style={styles.cardTitle}>{data.data.alamat_toko}</Text>
            </View>
          </View>
          {data.data.instagram != "" && data.data.whatsapp != null ? <Text style={styles.cardTitle}>{data.data.whatsapp}</Text> : null}

          {data.data.instagram != "" && data.data.instagram != null ? <Text style={styles.cardTitle}>{data.data.instagram}</Text> : null}

        </View>
        {dashboardData && (
          <>
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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Pendapatan Hari Ini</Text>
              <Text style={styles.cardValue}>Rp {currency.format(dashboardData.total_pendapatan)}</Text>
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
            <Icon name="store" size={24} color="#3498db" />
            <Text style={styles.cardText}>Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressTransaksipembelian() }}>
            <Icon name="payment" size={24} color="#3498db" />
            <Text style={styles.cardText}>Transaksi Pembelian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressTransaksi() }}>
            <Icon name="payment" size={24} color="#3498db" />
            <Text style={styles.cardText}>Transaksi Penjualan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressOpname() }}>
            <Icon name="inventory" size={24} color="#3498db" />
            <Text style={styles.cardText}>Stok Opname</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => { onPressRiwayatTransaksi() }}>
            <Icon name="history" size={24} color="#3498db" />
            <Text style={styles.cardText}>Riwayat Transaksi Pembelian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2} onPress={() => { onPressRiwayatTransaksi() }}>
            <Icon name="history" size={24} color="#3498db" />
            <Text style={styles.cardText}>Riwayat Transaksi Penjualan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => { onPressKartustok() }}>
            <Icon name="card-giftcard" size={24} color="#3498db" />
            <Text style={styles.cardText}>Kartu Stok</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
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
    marginBottom: 6,
    backgroundColor: '#fff',

    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },

    elevation: 2,

    width: Dwidth * 0.285,
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
