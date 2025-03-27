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
import React, { useState, useCallback, useLayoutEffect, memo } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyproduct } from '../../assets';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { Icash } from '../../assets/icon';
import { FlashList } from '@shopify/flash-list';
import BASE_URL from '../../../config';
import { DatePickerModal, YearPicker } from 'react-native-paper-dates';
import { downloadReport } from '../../service/downloadReport';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import DatePicker from 'react-native-daterange';

const HistoryPage = memo(({ route, navigation }) => {
  const params = route.params
  const [selectedRange, setSelectedRange] = useState({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') });
  const [selectedRange1, setSelectedRange1] = useState({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') });
  const [Data, setData] = useState([]);
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const [modalVisibledate, setModalVisibledate] = useState(false);

  const [selected, setSelected] = useState(null);
  const currency = new Intl.NumberFormat('id-ID');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [opentgllaporan, setOpentgllaporan] = React.useState(false);
  const [selectedYear, setSelectedYear] = useState(parseInt(moment().format('yyyy')))
  const [selectingYear, setSelectingYear] = useState(false)
  const [TipeLaporan, setTipeLaporan] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs(),
    endDate: dayjs().add(3, 'days')
  });

  const onConfirmtahun = async (tahun) => {
    try {
      setModalVisibleLoading(true)
      await downloadReport(`transaksi-penjualan-per-tahun/${params.data.id_toko}?tahun=${tahun}`, true)
      setOpentgllaporan(false);
      setModalVisibleLoading(false)
    } catch (error) {
      console.log(error)
    }
  }
  const onDismisstahun = () => {
    setSelectingYear(false);
    setSelectedYear("2025")
  };
  const onDismiss = React.useCallback(() => {
    setSelectedRange({ startId: moment().format('yyyy-MM-DD'), endId: moment().format('yyyy-MM-DD') })
    setOpen(false);
  }, [setOpen]);
  const onConfirmlpr = React.useCallback(
    async ({ startDate, endDate }, extraParam) => {
      // console.log(moment("2025/03/06", "YYYY/MM/DD").format("YYYY-MM-DD"));
      try {
        setModalVisibleLoading(true)
        if (extraParam == "tgl") {
          await downloadReport(`transaksi-penjualan-per-rentan/${params.data.id_toko}?tglmulai=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&&tglakhir=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, true)
        } else if (extraParam == "produk") {
          await downloadReport(`penjualan-berdasarkan-produk/${params.data.id_toko}?tglmulai=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&&tglakhir=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, true)
        } else if (extraParam == "pengguna") {
          await downloadReport(`transaksi-per-pengguna/${params.data.id_toko}?tglmulai=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&&tglakhir=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, true)
        }
        setOpentgllaporan(false);
        setModalVisible(false);
        setModalVisibleLoading(false)
      } catch (error) {
        console.log(error)
      }
    },
    [setOpentgllaporan]
  );
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Text>Export</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation])
    ;
  const onConfirm = React.useCallback(
    async ({ startDate, endDate }) => {
      try {
        // setOpen(false);
        setSelectedRange({ startId: moment(startDate).format('yyyy-MM-DD'), endId: moment(endDate).format('yyyy-MM-DD') });
        const token = await AsyncStorage.getItem('tokenAccess');
        const res = await axios.get(`${BASE_URL}/riwayattransaksi/${params.data.id_toko}?start_date=${moment(startDate, "YYYY/MM/DD").format('yyyy-MM-DD')}&end_date=${moment(endDate, "YYYY/MM/DD").format('yyyy-MM-DD')}`, {
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
      } catch (error) {
        console.log(error.response)

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
          elevation: 1.5,
          borderRadius: 12,
        }}
        onPress={() =>
          navigation.navigate('historyitempage', { Item, selectedRange })
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
                {Item.item.id_transaksi}

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
              <Text style={{ color: '#000', textAlign: 'right' }}>Rp.{currency.format(Item.item.totalharga)}</Text>
              <Text style={{ color: '#000', textAlign: 'right' }}>{Item.item.user?.pemilik?.nama_pemilik || Item.item.user?.pekerja?.nama_pekerja}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

  };

  const get = async () => {
    const token = await AsyncStorage.getItem('tokenAccess');
    const res = await axios.get(`${BASE_URL}/riwayattransaksi/${params.data.id_toko}?start_date=${selectedRange.startId}&end_date=${selectedRange.endId}`, {
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
  useFocusEffect(
    useCallback(() => {
      get();
    }, [selectedRange])
  );

  const minDate = new Date(2010, 0, 1);
  const maxDate = new Date(2060, 11, 31);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ elevation: 6, padding: 12, backgroundColor: '#fff' }}>
        <DatePicker
          style={{
            borderWidth: 1, borderColor: "#000"
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
              item.type === 'header' ? `${item.date}` : `${item.id_transaksi}`
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


      <Modal
        transparent={true}
        visible={modalVisibledate}
        onRequestClose={() => setModalVisibledate(!modalVisibledate)}>
        <TouchableOpacity
          onPress={() => setModalVisibledate(!modalVisibledate)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            flex: 1,
            justifyContent: 'center',
          }}>
          <View style={styles.modalView}>
            <Pressable style={styles.wrapcard} onPress={() => { }}>

            </Pressable>
          </View>
        </TouchableOpacity>
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
                  <TouchableOpacity style={styles.btn} onPress={async () => {
                    setModalVisibleLoading(true)
                    await downloadReport(`transaksi-penjualan-per-hari/${params.data.id_toko}`, true)
                    setModalVisible(false);
                    setModalVisibleLoading(false)
                  }} >
                    <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Download Laporan Harian</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 6 }}>
                  <DatePicker
                    style={{
                      elevation: 8,
                      backgroundColor: "#007bff",
                      borderRadius: 5,
                      borderColor: '#fff',
                      borderWidth: 0.5
                    }}
                    customStyles={{
                      placeholderText: { fontSize: 16, color: "#fff" },// placeHolder style
                      headerStyle: { backgroundColor: '#000080' },			// title container style
                      headerMarkTitle: {}, // title mark style
                      headerDateTitle: {}, // title Date style
                      contentInput: {}, //content text container style
                      contentText: {}, //after selected text Style
                    }} // optional
                    centerAlign // optional text will align center or not
                    allowFontScaling={true} // optional
                    format="DD-MM-YYYY"
                    placeholder={"Download Laporan Rentan Tanggal"}
                    value={"Download Laporan Rentan Tanggal"}
                    onConfirm={(range) => onConfirmlpr(range, "tgl")}
                    mode={'range'}
                  />
                </View>
                <View style={{ padding: 6 }}>
                  <TouchableOpacity style={styles.btn} onPress={() => setSelectingYear(true)} >
                    <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Download Laporan Tahunan</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 6 }}>
                  <DatePicker
                    style={{
                      elevation: 8,
                      backgroundColor: "#007bff",
                      borderRadius: 5,
                      borderColor: '#fff',
                      borderWidth: 0.5
                    }}
                    customStyles={{
                      placeholderText: { fontSize: 16, color: "#fff" },// placeHolder style
                      headerStyle: { backgroundColor: '#000080' },			// title container style
                      headerMarkTitle: {}, // title mark style
                      headerDateTitle: {}, // title Date style
                      contentInput: {}, //content text container style
                      contentText: {}, //after selected text Style
                    }} // optional
                    centerAlign // optional text will align center or not
                    allowFontScaling={true} // optional
                    format="DD-MM-YYYY"
                    placeholder={"Download Laporan Produk"}
                    value={"Download Laporan Rentan Tanggal"}
                    onConfirm={(range) => onConfirmlpr(range, "produk")}
                    mode={'range'}
                  />
                </View>
                <View style={{ padding: 6 }}>
                  <DatePicker
                    style={{
                      elevation: 8,
                      backgroundColor: "#007bff",
                      borderRadius: 5,
                      borderColor: '#fff',
                      borderWidth: 0.5
                    }}
                    customStyles={{
                      placeholderText: { fontSize: 16, color: "#fff" },// placeHolder style
                      headerStyle: { backgroundColor: '#000080' },			// title container style
                      headerMarkTitle: {}, // title mark style
                      headerDateTitle: {}, // title Date style
                      contentInput: {}, //content text container style
                      contentText: {}, //after selected text Style
                    }} // optional
                    centerAlign // optional text will align center or not
                    allowFontScaling={true} // optional
                    format="DD-MM-YYYY"
                    placeholder={"Download Laporan Pengguna"}
                    value={"Download Laporan Rentan Tanggal"}
                    onConfirm={(range) => onConfirmlpr(range, "pengguna")}
                    mode={'range'}
                  />
                </View>
              </View>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
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
    </View>
  );
});

export default HistoryPage;
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
  btn: {
    padding: 10,
    elevation: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
    borderColor: '#fff',
    borderWidth: 0.5
  }
});
