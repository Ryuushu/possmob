import { TextInput, TouchableOpacity, StyleSheet, Text, View, Image, Modal, Switch, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import BASE_URL from '../../../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { emptyproduct } from '../../assets';
import { FlashList } from '@shopify/flash-list';
import ItemList2 from '../../component/itemlist2';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const KategoriPage = ({ route }) => {
    const params = route.params
    const [Data, setData] = useState([]);
    const [SelectData, setSelectData] = useState({});
    const [id, setId] = useState([]);
    const [EditNama, setEditNama] = useState('');
    const [switchValue, setSwitchValue] = useState(false);
    const [switchValueedit, setSwitchValueedit] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
    const [modalVisibleadd, setModalVisibleadd] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            get()
        }, [])
    );
    const get = async () => {
        setModalVisibleLoading(true)
        const token = await AsyncStorage.getItem('tokenAccess');
        await axios.get(`${BASE_URL}/kategori?id_toko=${params.data.id_toko}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }

            },
        ).then(res => {
            setData(res.data.data)
        }).catch(err => {
            console.log(err.response)
        }).finally(() => {
            setModalVisibleLoading(false)
            setRefreshing(false)
        })

    };
    const onPressadd = async () => {
        const token = await AsyncStorage.getItem('tokenAccess');

        const response = await axios.post(`${BASE_URL}` + '/kategori', {
            id_toko: params.data.id_toko,
            nama_kategori: EditNama,
            is_stok: switchValue
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        }).then(() => {
            closeModaladd()
            get();
        }).catch((e) => { console.log(e.response) });
    };
    const onPress = ({ item, i }) => {
        setModalVisible(true);
        setEditNama(item.nama_kategori);
        setId(item.kode_kategori)

        setSwitchValueedit(item.is_stok == 1 ? true : false)
    };
    const closeModaladd = () => {
        setModalVisibleadd(false);
        setEditNama('');
        setId('')
    };
    const closeModaledt = () => {
        setEditNama('');
        setId('')
        setModalVisible(false);
    };
    const onPressedit = async () => {
        try {

            const token = await AsyncStorage.getItem('tokenAccess');
            const response = await axios.put(`${BASE_URL}/kategori/${id}`, {
                id_toko: params.data.id_toko,
                nama_kategori: EditNama,
                is_stok: switchValueedit
            }, {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            }).then(() => {
                closeModaledt()
                get();
            });
        } catch (error) {
            console.log(error.response)
        }

    }
    const onPressdelete = (item) => {
        setEditNama('');
        setId('')
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
                            await axios.delete(`${BASE_URL}/kategori/${item.item.kode_kategori}`,
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
                                Alert.alert("Gagal", "Kategori ini masih digunakan dalam produk dan tidak bisa dihapus.");
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
    const onRefresh = () => {
        setRefreshing(true);
        get();
    };
    const renderItem = item => {
        return (
            <View style={{ marginVertical: 12 }} >
                <ItemList2
                    data={item}
                    onPress={() => onPress({ item })}
                    onLongPress={() => onPressdelete({ item })}
                    delayLongPress={100}
                />
            </View>
        )
    }
    // useEffect(() => {
    //     get();
    // }, [isFocused]);
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
                onPress={() => setModalVisibleadd(true)}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
                    Tambah Kategori
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
                    <ActivityIndicator size={100} color={'#3498db'} />
                </View>
            </Modal>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
                key={SelectData[0]}>
                <TouchableOpacity
                    onPress={() => closeModaledt()}
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
                                    borderColor: '#ccc',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                                <Text style={{ color: '#000', fontSize: 16, marginRight: 10 }}>Memiliki stok ? {switchValueedit ? 'Iya' : 'Tidak'}</Text>

                                <Switch
                                    value={switchValueedit} // state to manage the switch status
                                    onValueChange={newValue =>

                                        setSwitchValueedit(newValue)
                                    }
                                    trackColor={{ false: '#ccc', true: '#4CAF50' }} // Change track color
                                    thumbColor={switchValueedit ? '#ffffff' : '#f4f3f4'} // Thumb color when ON and OFF
                                    ios_backgroundColor="#3e3e3e" // Background color when it's OFF on iOS
                                />
                            </View>

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
                        </Pressable>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                transparent={true}
                visible={modalVisibleadd}
                onRequestClose={() => setModalVisibleadd(!modalVisibleadd)}
                key={SelectData[0]}>
                <TouchableOpacity
                    onPress={() => closeModaladd()}
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
                                }}>
                                TAMBAH
                            </Text>
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Nama Kategori
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Nama Kategori'}
                                value={EditNama}
                                onChangeText={value => setEditNama(value)}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                                <Text style={{ color: '#000', fontSize: 16, marginRight: 10 }}>Memiliki stok ? {switchValue ? 'Iya' : 'Tidak'}</Text>

                                <Switch
                                    value={switchValue} // state to manage the switch status
                                    onValueChange={newValue =>
                                        setSwitchValue(newValue)}
                                    trackColor={{ false: '#ccc', true: '#4CAF50' }} // Change track color
                                    thumbColor={switchValue ? '#ffffff' : '#f4f3f4'} // Thumb color when ON and OFF
                                    ios_backgroundColor="#3e3e3e" // Background color when it's OFF on iOS
                                />
                            </View>
                            <TouchableOpacity
                                style={{
                                    padding: 12,
                                    backgroundColor: '#007bff',
                                    marginTop: 12,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                }}
                                onPress={() => onPressadd()}>
                                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '500' }}>
                                    Simpan
                                </Text>
                            </TouchableOpacity>
                        </Pressable>
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
});

export default KategoriPage
