import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, Modal, ScrollView } from 'react-native';
import BASE_URL from '../../../config';
import axios from 'axios';
import { emptyproduct } from '../../assets';
import { Ifilter } from '../../assets/icon';
import ItemKatalog from '../../component/itemkatalog';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';

const OpnamePage = ({ route, navigation }) => {
  const params = route.params
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [DumyData, setDumyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [Datakateogri, setDatakateogri] = useState([]);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const Filter = (textinput, category) => {
    if (category !== null) {
      setSelectedCategory(category.toLowerCase()); // Simpan kategori yang dipilih
      if (category.toLowerCase() === "all") {
        setFilteredData(DumyData);
        setModalVisibleCategory(!modalVisibleCategory);
      } else {
        const filteredDatas = DumyData.filter((fill) =>
          fill.kategori.nama_kategori
            ? fill.kategori.nama_kategori.toLowerCase() === category.toLowerCase()
            : null
        );
        setFilteredData(filteredDatas);
        setModalVisibleCategory(!modalVisibleCategory);
      }
    } else {
      const input = textinput.toLowerCase();
      if (input === " " || input === null) {
        setFilteredData(DumyData);
      } else {
        const results = DumyData.filter((product) => {
          const productName = product.nama_produk.toLowerCase();
          return productName.includes(input);
        });
        setFilteredData(results);
      }
    }
  };
  // Inisialissi data saat komponen pertama kali dimuat
  const get = async () => {
    try {
      // setRefreshing(true);
      const token = await AsyncStorage.getItem('tokenAccess');
      const [res1, res2] = await Promise.all([
        axios.get(`${BASE_URL}/produk/${params.data.id_toko}/true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/kategori?id_toko=${params.data.id_toko}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFilteredData(res1.data.data);
      setDatakateogri(res2.data.data)
      setDumyData(res1.data.data);

    } catch (error) {
      console.error(error.response);
      console.error('Error fetching data:', error.message);
      alert('Failed to fetch data. Please try again.');

    }
  }
  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );

  

  // Mengatur header berdasarkan mode seleksi
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isSelectionMode
        ? `${selectedItems.length} Selected`
        : 'Stok Opname',
      headerRight: () =>
        isSelectionMode && (
          <View style={{ flexDirection: 'row', marginRight: 10 }}>
            <TouchableOpacity
              onPress={selectAll}
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: 'blue', fontSize: 16 }}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelSelection}
            >
              <Text style={{ color: 'red', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ),
    });
  }, [navigation, isSelectionMode, selectedItems]);
  const selectAll = () => {
    const allIds = filteredData.map(item => item.kode_produk);
    setSelectedItems(allIds);
  };

  const handleLongPress = (id) => {
    setIsSelectionMode(true);
    handleSelect(id);
  };

  const handleSelect = (id) => {

    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((item) => item !== id)
        : [...prevSelectedItems, id];

      if (newSelectedItems.length === 0) {
        setIsSelectionMode(false);
      }

      return newSelectedItems;
    });
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedItems([]);
  };

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
      <View style={{ flex: 1, marginHorizontal: 8 }}>
        {filteredData.length === 0 ? (
          <View style={styles.imgContainerStyle}>
            <View style={styles.imgwarpStyle}>
              <Image style={styles.imageStyle} source={emptyproduct} />
            </View>
          </View>
        ) : (
          <FlatList
            estimatedItemSize={100}
            extraData={isSelectionMode}
            data={filteredData}
            keyExtractor={(item) => item.kode_produk}
            renderItem={({ item }) => {
              const isSelected = selectedItems.includes(item.kode_produk);
              return (
                <View style={{ marginTop: 18, paddingBottom: 2 }}>
                  <ItemKatalog
                    item={item}
                    type={isSelected}
                    onLongPress={() => handleLongPress(item.kode_produk)}
                    delayLongPress={200}
                    onPress={() => {
                      if (isSelectionMode) {
                        handleSelect(item.kode_produk)
                      }
                      else {
                        navigation.navigate('detailopname', { selectedItems: [item.kode_produk], id_toko: params.data.id_toko })
                      }
                    }}
                  />
                </View>
              );
            }}
          />
        )}
      </View>
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
      {isSelectionMode ? (<TouchableOpacity style={styles.buttonChart} onPress={() => navigation.navigate('detailopname', { selectedItems, id_toko: params.data.id_toko })}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ok</Text>
      </TouchableOpacity>) : null
      }


    </View>

  );
};
export default OpnamePage;
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;
const styles = StyleSheet.create({
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
  buttonChart: {
    // position: 'absolute',
    // bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 12,
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#007bff',
    borderRadius: 15,
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
    padding: 18,
    backgroundColor: '#ededed',
  },

  selectedItem: {
    backgroundColor: '#007bff', // Warna latar belakang ketika dipilih
  },
  text: {
    fontSize: 16,
  },
  selectedText: {
    color: '#fff', // Warna teks ketika dipilih
  },
  selectedItemsText: {
    marginTop: 20,
    fontSize: 16,
  },
});