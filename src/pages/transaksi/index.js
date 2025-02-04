import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  BackHandler,
  Alert,
  useWindowDimensions
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Cardcatalog from '../../component/CardCatalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { emptyproduct } from '../../assets/image';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import { MasonryFlashList } from '@shopify/flash-list';
import { Ifilter } from '../../assets/icon';
import BASE_URL from '../../../config';

const TransaksiPage = ({ route }) => {
  const params = route.params
  const [refreshing, setRefreshing] = useState(false);
  const [item, setItems] = useState([]);
  const [Datakateogri, setDatakateogri] = useState([]);
  const [DumyData, setDumyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [LengthData, setLengthData] = useState(100);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const CartReducer = useSelector(state => state.CartReducer);
  const currency = new Intl.NumberFormat('id-ID');
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);

  const isPortrait = () => {
    const dim = Dimensions.get('screen');
    const { width } = useWindowDimensions();
    return dim.height >= dim.width;
  };
  const [Oriented, setOriented] = useState(
    isPortrait() ? 'portrait' : 'landscape',
  );
  const numColumns = Dwidth >= 600 ? 3 : 2;

  Dimensions.addEventListener('change', () => {
    setOriented(isPortrait() ? 'portrait' : 'landscape');
  });

  const get = async () => {
    try {
      setModalVisibleLoading(true);
      const token = await AsyncStorage.getItem('tokenAccess');
      const [res1, res2] = await Promise.all([
        axios.get(`${BASE_URL}/produk/${params.data.id_toko}/false`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/kategori?id_toko=${params.data.id_toko}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      setItems(res1.data.data);
      setDatakateogri(res2.data.data)
      setDumyData(res1.data.data)
      setLengthData(res1.data.data.length)
      setRefreshing(false);
      setModalVisibleLoading(false);
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
        // setRefreshing(false);r
      } else {
        console.log('Error', error.message);
        alert(error.message);
        setRefreshing(false);
      }
      setModalVisibleLoading(false);

    };
  };

  const onlongpress = () => {
    dispatch({ type: 'REMOVEALL' });
  };
  const Filter = (textinput, category) => {
    if (category !== null) {
      setSelectedCategory(category.toLowerCase()); // Simpan kategori yang dipilih
      if (category.toLowerCase() === "all") {
        setItems(DumyData);
        setModalVisibleCategory(!modalVisibleCategory);
      } else {
        const filteredData = DumyData.filter((fill) =>
          fill.kategori.nama_kategori
            ? fill.kategori.nama_kategori.toLowerCase() === category.toLowerCase()
            : null
        );
        setItems(filteredData);
        setModalVisibleCategory(!modalVisibleCategory);
      }
    } else {
      const input = textinput.toLowerCase();
      if (input === " " || input === null) {
        setItems(DumyData);
      } else {
        const results = DumyData.filter((product) => {
          const productName = product.nama_produk.toLowerCase();
          return productName.includes(input);
        });
        setItems(results);
      }
    }
  };

  const renderitem = (item) => {
    return (
      <View>
        <Cardcatalog item={item} oriented={Oriented} />
      </View>
    );
  };
  const onRefresh = async () => {
    setRefreshing(true);
    get();
  };
  const handleBackButtonClick = () => {
    if (navigation.canGoBack()) {
      // Kembali ke screen sebelumnya
      navigation.goBack();
    } else {
      // Jika tidak ada screen untuk kembali, keluar dari aplikasi
      Alert.alert(
        "Konfirmasi",
        "Apakah Anda yakin ingin keluar dari aplikasi?",
        [
          { text: "Batal", onPress: () => null, style: "cancel" },
          { text: "Keluar", onPress: () => BackHandler.exitApp() }
        ]
      );
    }
    dispatch({ type: 'REMOVEALL' });
    return true;
  };
  useFocusEffect(
    useCallback(() => {
    dispatch({ type: 'REMOVEALL' });
      get()
    }, [])
  );

  return (
    <View style={styles.wrap}>
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
      <View style={styles.CardKatalog}>
        {item == 0 ? (
          <View style={styles.imgContainerStyle}>
            <View style={styles.imgwarpStyle}>
              <Image style={styles.imageStyle} source={emptyproduct} />
            </View>
          </View>
        ) : (
          <MasonryFlashList
            data={item}
            numColumns={numColumns}
            renderItem={(item) => renderitem(item.item)}
            estimatedItemSize={LengthData}
            refreshing={refreshing} onRefresh={onRefresh}
          />
        )}
      </View>
      {CartReducer.cartitem.reduce((result, item) => item.count + result, 0) ? (
        <TouchableOpacity
          style={styles.buttonChart}
          onLongPress={() => onlongpress()}
          onPress={() => navigation.navigate('cartpage', params)}>
          <View style={styles.wrapChart}>
            <View style={styles.row}>
              <Text style={styles.textButtonChart}>
                {currency.format(
                  CartReducer.cartitem.reduce(
                    (result, item) => item.count + result,
                    0,
                  ),
                )}{' '}
                items
              </Text>
            </View>
            <View>
              <Text style={styles.textButtonChart}>
                Bayar Rp.
                {currency.format(
                  CartReducer.cartitem.reduce(
                    (result, item) => item.count * item.subTotal + result,
                    0,
                  ),
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      <Modal transparent={true} visible={modalVisibleLoading}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}>
          <ActivityIndicator size={100} color={'#9B5EFF'} />
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
              height: Dheight / 2.5,
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
              <ScrollView style={{ flex: 1, marginBottom: 42 }}>
                <TouchableOpacity
                  style={styles.btnitemcategory}
                  onPress={() => Filter(null, "all")}>
                  <Text style={{ color: '#000', textAlign: 'center' }}>
                    all
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

export default TransaksiPage;
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  selectedCategory: {
    backgroundColor: '#151B25', // Warna highlight
  },
  wrap: {
    justifyContent: 'space-between',
    flex: 1,
  },
  wrapheader: {
    backgroundColor: '#fff',
    width: '100%',
    height: 70,
    alignItems: 'center'

  },
  kontenheader: {
    flexDirection: 'row',
    paddingVertical: 9,
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
    justifyContent: 'center'
  },
  wrapCard: {
    marginHorizontal: 4.2,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#8C8C8C',
  },
  wrapImg: {
    width: Dwidth * 0.27,
    height: Dheight * 0.2,
    backgroundColor: '#A19A9A',
  },
  wrapContentCard: {
    marginHorizontal: 8,
  },
  wrapChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CardKatalog: {
    // flexWrap: 'wrap',
    // flexDirection: 'row',
    // flexBasis: '50%',

    
    flex: 1,
  },
  ScrollView: {
    paddingTop: 10,
  },

  textinputSearch: {
    marginRight: 2,
    paddingVertical: 2,
    paddingLeft: 14,
    flex: 1,
    borderWidth: 1.5,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontSize: 14,
  },
  buttonOutline: {
    marginTop: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonChart: {
    // position: 'absolute',
    // bottom: 0,
    marginTop: 8,
    width: '100%',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#034687',
    borderRadius: 15,
  },
  wrapTextTra: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  rowform: {
    flexDirection: 'row',
    flex: 1,
  },
  semiHeader: {
    marginVertical: 10,
    flexDirection: 'row',
  },
  iconSearch: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  iconMenu: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconMoney: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  padding: {
    padding: 4,
  },

  fontHeader: {
    color: '#000',
    fontSize: 24,
    fontFamily: 'TitilliumWeb-Regular',
  },
  textButton: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'TitilliumWeb-Regular',
  },
  textButtonChart: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'TitilliumWeb-Bold',
  },
  textTitle: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'TitilliumWeb-Regular',
  },
  textTgl: {
    color: '#000',
    fontSize: 13,

    fontFamily: 'TitilliumWeb-Regular',
  },
  textMD: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'TitilliumWeb-Regular',
    textAlign: 'right',
  },
  textGeneral: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'TitilliumWeb-Regular',
  },

  color: {
    color: '#000',
  },
  color2nd: {
    color: '#18AECF',
  },
  hairline: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  imgContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgwarpStyle: {
    marginHorizontal: Dwidth * 0.06,
   height: Dheight /2,
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
});
