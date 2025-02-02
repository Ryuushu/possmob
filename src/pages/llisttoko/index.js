import { TextInput, TouchableOpacity, StyleSheet, Text, View, Image, Modal, Switch, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import BASE_URL from '../../../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { emptyproduct } from '../../assets';
import { FlashList } from '@shopify/flash-list';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import ItemList3 from '../../component/itemlist3';

const ListToko = () => {
    const navigation = useNavigation();
    const [Data, setData] = useState([]);
    const [SelectData, setSelectData] = useState({});
    const [id, setId] = useState([]);
    const [EditNama, setEditNama] = useState('');
    
    const [modalVisible, setModalVisible] = useState(false);
    
    const [Cek, setCek] = useState(true);
    const [isEnabled, setIsEnabled] = useState();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const get = async () => {
        const token = await AsyncStorage.getItem('tokenAccess');
        await axios.get(`${BASE_URL}` + '/toko',
            {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            },
        ).then(res => {
            setData(res.data.data)
        }).finally(() => { setRefreshing(false) })

    };
    const onPressadd = async () => {
        navigation.navigate('formaddtoko');
    };
    const onPress = ({ item }) => {
        navigation.navigate('tokopage', { data: item });
        // setModalVisible(true);
        // setEditNama(item.nama_kategori);
        // setId(item.kode_kategori)
    };
    const onPressedit = async () => {
        const token = await AsyncStorage.getItem('tokenAccess');
        const response = await axios.put(`${BASE_URL}/kategori/${id}`, {
            nama_kategori: EditNama
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        }).then(() => {
            setModalVisible(false);
        });
    }
    const onPressdelete = (item) => {
        Dialog.show({
            type: ALERT_TYPE.CONFIRM,
            title: 'Konfirmasi',
            textBody: 'Apakah Anda yakin ingin melanjutkan?',
            autoClose: false,
            onPressYes: async () => {
                try {
                    const token = await AsyncStorage.getItem('tokenAccess');
                    await axios.delete(`${BASE_URL}/toko/${item.item.id_toko}`,
                        {
                            headers: {
                                Authorization: 'Bearer ' + token,
                            },
                        },
                    )
                    Dialog.hide();
                    get();
                } catch (error) {
                    Dialog.hide();
                    get();
                }

            },
            onPressNo: () => {
                Dialog.hide();
                get();
            },
        })
    }
    const onSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filtered = Data.filter(item =>
                item.nama_toko.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(Data); // Reset jika pencarian kosong
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        get();
    };
    const renderItem = item => {
        return (
            <View style={{ marginVertical: 12 }} >
                <ItemList3
                    data={item}
                    onPress={() => onPress({ item })}
                    onLongPress={() => onPressdelete({ item })}
                    delayLongPress={100}
                />
            </View>
        )
    }
    useFocusEffect(
        useCallback(() => {
            get()
        }, [])
    );

    return (
        <View
            style={{
                justifyContent: 'space-between',
                flex: 1,
                backgroundColor: '#fff',
            }}>
            <View style={{ flex: 1, marginHorizontal: 16 }}>
                {Data.length > 0 ?
                    <FlashList
                        data={Data}
                        renderItem={item => renderItem(item.item)}
                        estimatedItemSize={30}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                    : <View style={styles.imgContainerStyle}>
                        <View style={styles.imgwarpStyle}>
                            <Image style={styles.imageStyle} source={emptyproduct} />
                        </View>
                    </View>}
            </View>

            <TouchableOpacity
                style={{ backgroundColor: '#007bff', padding: 18, alignItems: 'center' }}
                onPress={() => onPressadd()}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
                    Tambah Toko
                </Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
                key={SelectData[0]}>
                <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                    <View style={styles.modalView}>
                        <View style={styles.wrapcard}>
                            <Text
                                style={{
                                    color: '#000',
                                    textAlign: 'center',
                                    fontSize: 24,
                                    fontWeight: '500',
                                }}>
                                EDIT
                            </Text>

                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Nama Diskon
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Nama Diskon'}
                                value={EditNama}
                                onChangeText={value => setEditNama(value)}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#18AECF',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />



                            <TouchableOpacity
                                style={{
                                    padding: 12,
                                    backgroundColor: '#007bff',
                                    marginTop: 12,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                }}
                                onPress={() => onPressedit()}>
                                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '500' }}>
                                    Simpan
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;

const styles = StyleSheet.create({

    modalView: {
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
    },
    wrapcard: {
        margin: 14,
    },
    imgContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgwarpStyle: {
        marginHorizontal: Dwidth * 0.06,
        marginTop: Dheight / 4.5,
        height: Dheight / 2.5,
        width: Dwidth / 1.2,
    },
    imageStyle: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'center',
    },
});

export default ListToko
