import {
    ActivityIndicator,
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
import BASE_URL from '../../../config'
import { useFocusEffect } from '@react-navigation/native';

const KartuStokPage = ({ route, navigation }) => {
    const params = route.params.data
    const [Data, setData] = useState([]);
    const [DumyData, setDumyData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
    const [Datakateogri, setDatakateogri] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
    const renderitem = (item) => {

        return (
            <View style={{ marginTop: 18, paddingBottom: 2 }}>
                <ItemKatalog
                    item={item.item}
                    onPress={() =>
                        navigation.navigate('tabkartu', { item: item.item })
                    }
                />
            </View>
        );
    };

    const get = async () => {
        try {
            setModalVisibleLoading(true);
            const token = await AsyncStorage.getItem('tokenAccess');
            const [res1, res2] = await Promise.all([
                axios.get(`${BASE_URL}/produk/${params.id_toko}/true`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`${BASE_URL}/kategori?id_toko=${params.id_toko}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);
            // console.log(res1.data)
            setData(res1.data.data);
            setDatakateogri(res2.data.data)
            setDumyData(res1.data.data)
            // setLengthData(res1.data.data.length)
            setRefreshing(false);
            setModalVisibleLoading(false);
        } catch (error) {
            setModalVisibleLoading(false)
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
        setModalVisibleLoading(true)
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
            <View style={{ flex: 1, marginHorizontal: 8 }}>
                {Data.length === 0 ? (
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
        </View>
    );
};

export default KartuStokPage;
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
});