import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import ItemKatalog from '../../component/itemkatalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { emptyproduct } from '../../assets/image';
import { FlashList } from '@shopify/flash-list';
import { TextInput } from 'react-native-gesture-handler';
import { Ifilter } from '../../assets/icon';
import BASE_URL from '../../../config';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useFocusEffect } from '@react-navigation/native';

const ListKatalog = ({ route, navigation }) => {
  const params = route.params
  const [Data, setData] = useState([]);
  const [DumyData, setDumyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [Datakateogri, setDatakateogri] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const renderitem = (item) => {
    return (
      <View style={{ marginTop: 18, paddingBottom: 2 }}>
        <ItemKatalog
          item={item.item}
          onPress={() =>
            navigation.navigate('formedit', { id: params.data.id_toko, data: item.item })
          }
          onLongPress={() => onPressdelete(item.item)}
        />
      </View>
    );
  };
  const onPressdelete = (item) => {
    Alert.alert(
      'Konfirmasi Hapus Data',
      'Apakah Anda yakin ingin melanjutkan?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('tokenAccess');
              await axios.delete(`${BASE_URL}/produk/${item.kode_produk}`,
                {
                  headers: {
                    Authorization: 'Bearer ' + token,
                  },
                },
              )
              get()
            } catch (error) {
              const errorData = error.response?.data;
              const errorMessage = errorData?.errors || errorData?.message || "Terjadi kesalahan.";

              if (errorMessage.includes("Integrity constraint violation: 1451")) {
                Alert.alert("Gagal", "Produk ini masih digunakan dalam transaksi dan tidak bisa dihapus.");
              } else {
                Alert.alert("Error", errorMessage);
              }
              console.log(error.response)
            }
          },
        },
      ],
      { cancelable: false }
    );

  }
  const get = async () => {

    try {
      setModalVisibleLoading(true)
      // setModalVisibleLoading(true);
      const token = await AsyncStorage.getItem('tokenAccess');
      const [res1, res2] = await Promise.all([
        axios.get(`${BASE_URL}/produk/${params.data.id_toko}/false`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/kategori?id_toko=${params.data.id_toko}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]).finally(() => {
        setModalVisibleLoading(false)
        setRefreshing(false)
      });
      setData(res1.data.data);
      setDatakateogri(res2.data.data)
      setDumyData(res1.data.data)
    } catch (error) {
      console.log(error.response)
      setModalVisibleLoading(false)
      setRefreshing(false)
    };
  };
  const Filter = (textinput, category) => {
    if (category !== null) {
      setSelectedCategory(category.toLowerCase()); // Simpan kategori yang dipilih
      if (category.toLowerCase() === "all") {
        setData(DumyData);
        setModalVisibleCategory(!modalVisibleCategory);
      } else {
        const filteredData = DumyData.filter((fill) =>
          fill.kategori.nama_kategori
            ? fill.kategori.nama_kategori.toLowerCase() === category.toLowerCase()
            : null
        );
        setData(filteredData);
        setModalVisibleCategory(!modalVisibleCategory);
      }
    } else {
      const input = textinput.toLowerCase();
      if (input === " " || input === null) {
        setData(DumyData);
      } else {
        const results = DumyData.filter((product) => {
          const productName = product.nama_produk.toLowerCase();
          return productName.includes(input);
        });
        setData(results);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    get();
  };

  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.wrapheader}>
        <View style={styles.kontenheader}>
          <TextInput
            placeholderTextColor={'#000'}
            placeholder="Search"
            style={styles.search}
            editable={true}
            onChangeText={(value) => Filter(value, null)}
          />
          <TouchableOpacity
            style={styles.filter}
            onPress={() => {
              setModalVisibleCategory(true);
            }}>
            <Ifilter />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 8 }}>
        {Data == 0 ? (
          <View style={styles.imgContainerStyle}>
            <View style={styles.imgwarpStyle}>
              <Image style={styles.imageStyle} source={emptyproduct} />
            </View>
          </View>
        ) : (
          <FlashList
            data={Data}
            renderItem={(item) => renderitem(item)}
            estimatedItemSize={100}
            refreshing={refreshing}
            onRefresh={onRefresh} />
        )}
      </View>


      <TouchableOpacity
        style={{ backgroundColor: '#007bff', padding: 18, alignItems: 'center' }}
        onPress={() => navigation.navigate('formkasir', { data: params.data })}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
          Tambah Katalog
        </Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisibleLoading}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}>
          <ActivityIndicator size={100} color={'#007bff'} />
        </View>
      </Modal>
      <Modal transparent={true} visible={modalVisibleCategory}>
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}
          onPress={() => setModalVisibleCategory(!modalVisibleCategory)}>
          <View
            style={{
              backgroundColor: '#fff',
              width: Dwidth / 1.2,
              height: Dheight / 2,
              borderRadius: 12,
            }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 20,
                  fontWeight: '500',
                  textAlign: 'center',
                  marginVertical: 12,
                }}>
                Kategori
              </Text>
              <ScrollView style={{ flex: 1, marginBottom: 12 }}>
                <TouchableOpacity
                  style={styles.btnitemcategory}
                  onPress={() => Filter(null, "all")}>
                  <Text style={{ color: '#000', textAlign: 'center' }}>
                    All
                  </Text>
                </TouchableOpacity>
                {Datakateogri.map((item, i) => {
                  const isSelected = selectedCategory === item.nama_kategori.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.btnitemcategory,
                        isSelected && styles.selectedCategory, // Tambahkan gaya jika dipilih
                      ]}
                      onPress={() => Filter(null, item.nama_kategori)}
                    >
                      <Text style={{ color: isSelected ? '#fff' : '#000', textAlign: 'center' }}>
                        {item.nama_kategori}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ListKatalog;
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  selectedCategory: {
    backgroundColor: '#151B25', // Warna highlight
  },
  wrapheader: {
    backgroundColor: '#fff',
    width: '100%',
    height: 70,
  },
  kontenheader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  search: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    paddingLeft: 14,
    marginRight: 12,
    color: '#000',
  },
  filter: {
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgwarpStyle: {
    marginHorizontal: Dwidth * 0.06,
    height: Dheight / 2,
    width: Dwidth / 2,
    aspectRatio: 1,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  btnitemcategory: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
});
