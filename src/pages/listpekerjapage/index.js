import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Pressable
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ItemKatalog from '../../component/itemkatalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { emptyproduct } from '../../assets/image';
import { FlashList } from '@shopify/flash-list';
import { TextInput } from 'react-native-gesture-handler';
import { Ifilter } from '../../assets/icon';
import BASE_URL from '../../../config';
import ItemList2 from '../../component/itemlist2';
import ItemList4 from '../../component/itemlist4';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const ListPekerjaPage = ({ route, navigation }) => {
    const params = route.params
    const [Data, setData] = useState([]);
    const [DumyData, setDumyData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
    const [Datakateogri, setDatakateogri] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleadd, setModalVisibleadd] = useState(false);
    const [SelectData, setSelectData] = useState({});
    const [errors, setErrors] = useState({});
    const [Form, setForm] = useState({
        id: '',
        namapekerja: '',
        alamatpekerja: '',
        email: '',
        password: "",
        conpass: "",
    });
    const validateForm = () => {
        const newErrors = {};
        // Validate nama pekerja
        if (!Form.namapekerja || Form.namapekerja.trim() === '') {
            newErrors.namapekerja = 'Nama pekerja harus diisi';
        }

        // Validate alamat pekerja
        if (!Form.alamatpekerja || Form.alamatpekerja.trim() === '') {
            newErrors.alamatpekerja = 'Alamat pekerja harus diisi';
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!Form.email || !emailRegex.test(Form.email)) {
            newErrors.email = 'Email tidak valid';
        }

        // Validate password
        if (!Form.password || Form.password.length < 6) {
            newErrors.password = 'Password harus memiliki minimal 6 karakter';
        }

        // Validate confirm password
        if (Form.conpass !== Form.password) {
            newErrors.conpass = 'Konfirmasi password harus sama dengan password';
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const onInputChange = (value, input) => {
        setForm({
            ...Form,
            [input]: value,
        });
    };
    const onPressdelete = (item) => {

        Dialog.show({
            type: ALERT_TYPE.CONFIRM,
            title: 'Konfirmasi',
            textBody: 'Apakah Anda yakin ingin melanjutkan?',
            autoClose: false,
            onPressYes: async () => {
                try {
                    const token = await AsyncStorage.getItem('tokenAccess');
                    await axios.delete(`${BASE_URL}/pekerja/${item.id_pekerja}`,
                        {
                            headers: {
                                Authorization: 'Bearer ' + token,
                            },
                        },
                    )
                } catch (error) {
                    console.log(error.response)
                }
            },
            // Aksi saat tombol "Tidak" ditekan
            onPressNo: () => {
                console.log('Pengguna membatalkan penghapusan!');
            },
        })
        // return(AlertComfirm())
    }
    const onPressadd = async () => {
        if (!validateForm()) return;
        const token = await AsyncStorage.getItem('tokenAccess');
        const response = await axios.post(`${BASE_URL}` + '/pekerja', {
            id_toko: params.data.id_toko,
            nama_pekerja: Form.namapekerja,
            alamat_pekerja: Form.alamatpekerja,
            email: Form.email,
            password: Form.password,
            password_confirmation: Form.conpass
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        }).then(() => {
            closeModaladd()
        }).catch((e) => {
            console.log(e.response)
        });
    };
    const onPress = ({ item, i }) => {
        setErrors({})
        setModalVisible(true);
        setForm({
            id: item.item.id_pekerja,
            namapekerja: item.item.nama_pekerja,
            alamatpekerja: item.item.alamat_pekerja,
            email: item.item.user.email,
            password: "",
            conpass: "",
        })
    };
    const onPressedit = async () => {
        try {
            if (!validateForm()) return;
            const token = await AsyncStorage.getItem('tokenAccess');
            const response = await axios.put(`${BASE_URL}/pekerja/${Form.id}`, {
                id_toko: params.data.id_toko,
                nama_pekerja: Form.namapekerja,
                alamat_pekerja: Form.alamatpekerja,
                email: Form.email,
                password: Form.password,
                password_confirmation: Form.conpass
            }, {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            }).then(() => {
                closeModaledt()
            });
        } catch (error) {
            console.log(error.response)
        }

    }
    const closeModaladd = () => {
        setErrors({})
        setForm({
            id: '',
            namapekerja: '',
            alamatpekerja: '',
            email: '',
            password: "",
            conpass: "",
        })
        setModalVisibleadd(false);

        // setNama('');
        // setId('')
    };
    const closeModaledt = () => {
        // setNama('');
        // setId('')
        setForm({
            id: '',
            namapekerja: '',
            alamatpekerja: '',
            email: '',
            password: "",
            conpass: "",
        })
        setModalVisible(false);
    };
    const renderitem = item => {
        return (
            <View style={{ marginTop: 18, paddingBottom: 2 }}>
                <ItemList4
                    data={item.item}
                    onPress={() => onPress({ item })}
                    onLongPress={() => onPressdelete(item.item)}
                    delayLongPress={100}
                />
            </View>
        );
    };

    const get = async () => {

        try {
            const token = await AsyncStorage.getItem('tokenAccess');
            const response = await axios.get(`${BASE_URL}/pekerja/${params.data.id_toko}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            }).then((res) => {

                setData(res.data.data)
                setDumyData(res.data.data)
                setRefreshing(false);
            }).catch((e) => {
                console.log(e.response)
            });




            // setModalVisibleLoading(false);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                alert(error.message);
                setRefreshing(false);
            } else if (error.request) {
                console.log(error.request);
                alert(error.message);
                setRefreshing(false);
            } else {
                console.log('Error', error.message);
                alert(error.message);
                setRefreshing(false);
            }
        };
    };
    const Filter = (textinput, category) => {
        if (textinput == null) {
            if (category.toLowerCase() == 'all') {
                setData(DumyData)
                setModalVisibleCategory(!modalVisibleCategory)
            }
            else {
                const a = DumyData.filter(fill => fill.kategori.nama_kategori != null ? fill.kategori.nama_kategori.toLowerCase() == category.toLowerCase() : null)
                setData(a)
                setModalVisibleCategory(!modalVisibleCategory)
            }
        }
        else {
            const input = textinput.toLowerCase()
            if (input == ' ' || input == null) {
                setData(DumyData)
            }
            else {
                const results = DumyData.filter(product => {
                    const productName = product[1].toLowerCase();
                    return productName.includes(input);
                });
                setData(results)
            }
        }


    };
    const onRefresh = async () => {
        setRefreshing(true);
        get();
    };

    useEffect(() => {
        get();
    }, [1]);
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
                style={{ backgroundColor: '#151B25', padding: 18, alignItems: 'center' }}
                onPress={() => { setModalVisibleadd(true) }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
                    Tambah Pegawai
                </Text>
            </TouchableOpacity>

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
                        <View style={styles.wrapcard}>
                            <Text
                                style={{
                                    color: '#000',
                                    textAlign: 'center',
                                    fontSize: 24,
                                    fontWeight: '500',
                                }}>
                                Edit Data Pegawai
                            </Text>
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Nama Pegawai
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Nama Pegawai'}
                                value={Form.namapekerja}
                                onChangeText={value => onInputChange(value, 'namapekerja')}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#18AECF',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />
                            {errors.namapekerja && <Text style={styles.errorText}>{errors.namapekerja}</Text>}
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Alamat Pegawai
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Alamat Pegawai'}
                                value={Form.alamatpekerja}
                                onChangeText={value => onInputChange(value, 'alamatpekerja')}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#18AECF',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Email
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Email'}
                                value={Form.email}
                                onChangeText={value => onInputChange(value, 'email')}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#18AECF',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Password
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Password'}
                                onChangeText={value => onInputChange(value, 'password')}
                                style={{
                                    color: '#000',
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: '#18AECF',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            />
                            <Text
                                style={{
                                    color: '#000',
                                    fontSize: 19,
                                    fontWeight: '500',
                                    marginVertical: 12,
                                }}>
                                Konfirmasi Password
                            </Text>
                            <TextInput
                                placeholderTextColor={'#000'}
                                placeholder={'Konfirmasi Password'}

                                onChangeText={value => onInputChange(value, 'conpass')}
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
                                    backgroundColor: '#151B25',
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
            <Modal
                transparent={true}
                visible={modalVisibleadd}
                onRequestClose={() => setModalVisibleadd(!modalVisibleadd)}
            //    key={SelectData[0]}>
            >
                <Pressable
                    onPress={() => closeModaladd()}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                    <ScrollView>
                        <View style={styles.modalView}>
                            <Pressable // Inner card that doesn't close modal

                                style={{ padding: 16,  }}
                                onPress={() => { }}>
                                <View style={styles.wrapcard}>
                                    <Text
                                        style={{
                                            color: '#000',
                                            textAlign: 'center',
                                            fontSize: 24,
                                            fontWeight: '500',
                                        }}>
                                        TAMBAH PEKERJA
                                    </Text>
                                    <Text
                                        style={{
                                            color: '#000',
                                            fontSize: 19,
                                            fontWeight: '500',
                                            marginVertical: 12,
                                        }}>
                                        Nama Pekerja
                                    </Text>
                                    <TextInput
                                        placeholderTextColor={'#000'}
                                        placeholder={'Nama Pekerja'}
                                        onChangeText={value => onInputChange(value, 'namapekerja')}
                                        style={{
                                            color: '#000',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#18AECF',
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                        }}
                                    />
                                    {errors.namapekerja && <Text style={styles.errorText}>{errors.namapekerja}</Text>}
                                    <Text
                                        style={{
                                            color: '#000',
                                            fontSize: 19,
                                            fontWeight: '500',
                                            marginVertical: 12,
                                        }}>
                                        Alamat Pekerja
                                    </Text>
                                    <TextInput
                                        placeholderTextColor={'#000'}
                                        placeholder={'Alamat Pekerja'}
                                        onChangeText={value => onInputChange(value, 'alamatpekerja')}
                                        style={{
                                            color: '#000',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#18AECF',
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                        }}
                                    />
                                    {errors.alamatpekerja && <Text style={styles.errorText}>{errors.alamatpekerja}</Text>}
                                    <Text
                                        style={{
                                            color: '#000',
                                            fontSize: 19,
                                            fontWeight: '500',
                                            marginVertical: 12,
                                        }}>
                                        Email
                                    </Text>
                                    <TextInput
                                        placeholderTextColor={'#000'}
                                        placeholder={'Email'}

                                        onChangeText={value => onInputChange(value, 'email')}
                                        style={{
                                            color: '#000',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#18AECF',
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                        }}
                                    />
                                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                                    <Text
                                        style={{
                                            color: '#000',
                                            fontSize: 19,
                                            fontWeight: '500',
                                            marginVertical: 12,
                                        }}>
                                        Password
                                    </Text>
                                    <TextInput
                                        placeholderTextColor={'#000'}
                                        placeholder={'Password'}

                                        onChangeText={value => onInputChange(value, 'password')}
                                        style={{
                                            color: '#000',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#18AECF',
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                        }}
                                    />
                                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                                    <Text
                                        style={{
                                            color: '#000',
                                            fontSize: 19,
                                            fontWeight: '500',
                                            marginVertical: 12,
                                        }}>
                                        Konfirmasi Password
                                    </Text>
                                    <TextInput
                                        placeholderTextColor={'#000'}
                                        placeholder={'Konfirmasi Password'}

                                        onChangeText={value => onInputChange(value, 'conpass')}
                                        style={{
                                            color: '#000',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#18AECF',
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                        }}
                                    />
                                    {errors.conpass && <Text style={styles.errorText}>{errors.conpass}</Text>}
                                    <TouchableOpacity
                                        style={{
                                            padding: 12,
                                            backgroundColor: '#151B25',
                                            marginTop: 12,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                        }}
                                        onPress={() => onPressadd()}>
                                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '500' }}>
                                            Simpan
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </View>
                    </ScrollView>

                </Pressable>
            </Modal>

        </View>
    );
};

export default ListPekerjaPage;
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
    btnitemcategory: {
        padding: 18,
        backgroundColor: '#ededed',
    },
    modalView: {
        
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
    },
    wrapcard: {
        margin: 14,
    }, errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});
