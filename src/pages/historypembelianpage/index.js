import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Button,
} from 'react-native';
import React, { useState, useCallback, useLayoutEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyproduct } from '../../assets';
import { useFocusEffect, useIsFocused, } from '@react-navigation/native';
import moment from 'moment';
import { Icash } from '../../assets/icon';
import { FlashList } from '@shopify/flash-list';
import BASE_URL from '../../../config';
import { DatePickerModal, YearPicker } from 'react-native-paper-dates';
import { downloadReport } from '../../service/downloadReport';
import DatePicker from 'react-native-daterange';
const HistoryPembelianPage = ({ route, navigation }) => {
  const params = route.params
  const [selectedRange, setSelectedRange] = useState({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') });
  const [selectedRange1, setSelectedRange1] = useState({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') });
  const [modalVisible, setModalVisible] = useState(false);
  const [Data, setData] = useState([]);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);

  const currency = new Intl.NumberFormat('id-ID');
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [opentgllaporan, setOpentgllaporan] = React.useState(false);
  const [selectedYear, setSelectedYear] = useState(parseInt(moment().format('yyyy')))
  const [selectingYear, setSelectingYear] = useState(false)
  useFocusEffect(
    useCallback(() => {
      get();
    }, [selectedRange])
  );
  const onConfirmlpr = React.useCallback(
    async ({ startDate, endDate }) => {
      try {
        downloadReport(`transaksi-pembelian-per-rentan/${params.data.id_toko}?tglmulai=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&&tglakhir=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, false)
        setOpentgllaporan(false);

      } catch (error) {
        console.log(error)

      }
    },
    [setOpentgllaporan, setSelectedRange1]
  );
  const onConfirmtahun = React.useCallback(
    async (tahun) => {
      try {
        downloadReport(`transaksi-pembelian-per-tahun/${params.data.id_toko}?tahun=${tahun}`, false)
        setOpentgllaporan(false);
      } catch (error) {
        console.log(error)
      }
    },
    [setSelectingYear, setSelectedYear]
  );

  const onDismisstahun = () => {
    setSelectingYear(false);
    setSelectedYear("2025")
  };

  const onDismisslpr = React.useCallback(() => {
    setSelectedRange1({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') })
    setOpentgllaporan(false);
  }, [setOpentgllaporan]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Text>Export</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  const onDismiss = React.useCallback(() => {
    setSelectedRange({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') })
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    async ({ startDate, endDate }) => {
      try {
        setSelectedRange({ startId: moment(startDate).format('yyyy-MM-DD'), endId: moment(endDate).format('yyyy-MM-DD') });
        const token = await AsyncStorage.getItem('tokenAccess');
        const res = await axios.get(`${BASE_URL}/riwayattransaksipembelian/${params.data.id_toko}?start_date=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&end_date=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = [];
        for (const [date, transactions] of Object.entries(res.data.data)) {
          const total = transactions.total;
          result.push({ type: 'header', date, total });
          transactions.data.forEach((transaction) =>
            result.push({ type: 'item', ...transaction })
          );
        }
        setData(result)
        setOpen(false);

      } catch (error) {
        console.log(error)

      }
    },
    [setOpen, setSelectedRange]
  );

  const renderItem = (Item) => {
    if (Item.item.type === 'header') {
      return (
        <View style={{ marginHorizontal: 12 }}>
          <View
            style={{
              marginTop: 16,
              borderBottomWidth: 1,
              borderColor: '#C3C3C3',
              borderStyle: 'dashed',
            }}></View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'TitilliumWeb-Bold',
                }}>
                {moment(Item.item.date).format('dddd') + ', '}
              </Text>
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'TitilliumWeb-Bold',
                }}>
                {moment(Item.item.date).format('DD MMM yyyy')}
              </Text>
            </View>

            <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
              Rp.
              {currency.format(Item.item.total)}
            </Text>

          </View>

        </View>


      );
    }
    const time = moment(Item.item.created_at).format('HH:mm:ss')
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: '#fff',
          marginVertical: 8,
          marginHorizontal: 12,
          padding: 12,
          elevation: 2,
          borderRadius: 12,
        }}
        onPress={() =>
          navigation.navigate('historypembelianitempage', { Item, selectedRange })
        }>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icash />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'TitilliumWeb-Bold',
                }}>
                {Item.item.id_transaksi_pembelian}

              </Text>
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'TitilliumWeb-Light',
                }}>
                {time}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {/* <Text style={{ color: '#000' }}>a</Text> */}
            <View
              style={{
                paddingVertical: 6,
                marginTop: 4,
                borderRadius: 4,
              }}>
              <Text style={{ color: '#000' }}>Rp.{currency.format(Item.item.totalharga)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

  };
  const get = async () => {
    const token = await AsyncStorage.getItem('tokenAccess');
    const res = await axios.get(`${BASE_URL}/riwayattransaksipembelian/${params.data.id_toko}?start_date=${selectedRange.startId}&end_date=${selectedRange.endId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = [];
    for (const [date, transactions] of Object.entries(res.data.data)) {
      const total = transactions.total;
      result.push({ type: 'header', date, total });
      transactions.data.forEach((transaction) =>
        result.push({ type: 'item', ...transaction })
      );
    }
    setData(result)
  };
  const onRefresh = () => {
    setRefreshing(true);
    get();
  };



  return (
    <View style={{ flex: 1 }}>
      <View style={{ elevation: 6, backgroundColor: '#fff' }}>
        <DatePicker
          style={{
            borderWidth: 1, borderColor: "#000", margin: 12,
          }}
          customStyles={{
            placeholderText: { fontSize: 20, color: "#000" },// placeHolder style
            headerStyle: {},			// title container style
            headerMarkTitle: {}, // title mark style
            headerDateTitle: {}, // title Date style
            contentInput: {}, //content text container style
            contentText: {}, //after selected text Style
          }} // optional
          centerAlign // optional text will align center or not
          allowFontScaling={false} // optional
          format="DD-MM-YYYY"
          placeholder={selectedRange.startId + ' - - - ' + selectedRange.endId}
          onConfirm={onConfirm}
          mode={'range'}
        />
      </View>

      {Data == undefined || Data.length == 0 ? (
        <View style={styles.imgContainerStyle}>
          <View style={styles.imgwarpStyle}>
            <Image style={styles.imageStyle} source={emptyproduct} />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>

          <FlashList
            data={Data}
            renderItem={renderItem}
            estimatedItemSize={50}
            keyExtractor={(item, index) =>
              item.type === 'header' ? `${item.date}-${index}` : `${item.id_transaksi_pembelian}`
            }
          />

        </View>


      )}


      <YearPicker
        visible={selectingYear}
        onClose={onDismisstahun}
        onConfirm={(year) => onConfirmtahun(year)}
        selectedYear={selectedYear}
        startYear={2000}
        endYear={2080}
      />
      <DatePickerModal
        locale="id"
        mode="range"
        visible={open}
        onDismiss={onDismiss}
        startDate={selectedRange.startDate}
        endDate={selectedRange.endDate}
        onConfirm={onConfirm}
      />
      <DatePickerModal
        locale="id"
        mode="range"
        visible={opentgllaporan}
        onDismiss={onDismisslpr}
        onConfirm={onConfirmlpr}

      />

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
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}>
        <TouchableOpacity
          onPress={() => setModalVisible(!modalVisible)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            flex: 1,
            justifyContent: 'center',
          }}>
          <View style={styles.modalView}>
            <Pressable style={styles.wrapcard} onPress={() => { }}>
              <Text
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: '500',
                  marginTop: 12
                }}>
                Pilih Export
              </Text>
              <View style={{ padding: 12 }}>
                <View style={{ padding: 6 }}>
                  <Button title="Download Laporan Harian" onPress={() => downloadReport(`transaksi-pembelian-per-hari/${params.data.id_toko}`, false)} />
                </View>
                <View style={{ padding: 6 }}>
                  <Button title="Download Laporan Rentan Tanggal" onPress={() => {
                    setSelectedYear(parseInt(moment().format('YYYY')))
                    setOpentgllaporan(true)
                  }} />
                </View>
                <View style={{ padding: 6 }}>
                  <Button title="Download Laporan Tahunan" onPress={() => setSelectingYear(true)} />
                </View>
              </View>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HistoryPembelianPage;
const Dwidth = Dimensions.get('screen').width;
const Dheight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  selectedDateStyle: {
    fontWeight: 'bold',
    color: 'white',
  },
  modalView: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
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
  selectedDateContainerStyle: {
    color: '#000',
    height: 38,
    borderRadius: 50,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#44dfff',
  },
  header: {
    backgroundColor: '#eee',
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 14,
  },
});
