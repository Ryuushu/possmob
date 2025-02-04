import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    FlatList,
    Button,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    Pressable,
} from 'react-native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import CardItem from '../../component/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { emptycart, emptyproduct } from '../../assets/image';
import moment from 'moment';
import BASE_URL from '../../../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FlashList } from '@shopify/flash-list';
import Label from '../../component/label';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CartitemPembelian from '../../component/CartItempembelian';

const TransaksiPembelianBaru = ({ route }) => {
    const params = route.params
    const currency = new Intl.NumberFormat('id-ID');
    const navigation = useNavigation();
    const CartReducer = useSelector(state => state.CartPembelianReducer);
    // const TRXReducer = useSelector(state => state.TRXReducer);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleform, setModalVisibleform] = useState(false);
    const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
    const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
    const [Datakateogri, setDatakateogri] = useState([]);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [stock, setStock] = useState(""); // For stock input
    const [price, setPrice] = useState(""); // For price input
    const [Data, setData] = useState(""); // For price input
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [category, setCategory] = useState("");
    // const data = ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Pineapple', 'Strawberry'];
    const dispatch = useDispatch();
    const handleImageSelection = useCallback((type, options) => {
        const launchMethod = type === 'capture' ? launchCamera : launchImageLibrary;

        launchMethod(options, (response) => {
            if (response.assets?.[0]) {
                setSelectedFile(response.assets[0]);
                // dispatch(setForm('fileImage', response.assets[0].uri));
            }
        });

        setModalVisible(false);
    }, []);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    setErrors({})
                    setQuery("")
                    setCategory("");
                    setPrice("");
                    setStock("");
                    setSelectedFile(null)
                    setSelectedProduct(null);
                    setModalVisibleform(true)
                }} style={{ marginRight: 15 }}>
                    <Icon name="shopping-cart" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    const get = async () => {
        // dispatch({ type: 'RM_FORM' })
        const token = await AsyncStorage.getItem('tokenAccess');
        try {
            const [res1, res2] = await Promise.all([
                axios.get(`${BASE_URL}/produk/${params.data.id_toko}/true`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`${BASE_URL}/kategori?id_toko=${params.data.id_toko}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);
            setData(res1.data.data)
            setDatakateogri(res2.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const handleSearch = (text) => {
        setQuery(text);
        if (text.length > 0) {
            const filteredData = Data.filter((item) =>
                item.nama_produk.toLowerCase().includes(text.toLowerCase())
            );
            setSuggestions(filteredData);
        } else {
            setSuggestions([]);
        }
        setCategory("");
        setPrice("");
        setStock("");
        setSelectedFile(null)
        setSelectedProduct(null);
    };
    const validateForm = () => {
        let newErrors = {};

        if (!query.trim()) newErrors.query = "Nama produk tidak boleh kosong!";
        if (!category.trim()) newErrors.category = "Kategori produk tidak boleh kosong!";
        if (!price.trim() || isNaN(price) || Number(price) <= 0) newErrors.price = "Harga harus berupa angka & lebih dari 0!";
        if (!stock.trim() || isNaN(stock) || Number(stock) < 0) newErrors.stock = "Stok harus berupa angka & tidak boleh negatif!";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateFormselect = () => {
        let newErrors = {};
        if (!price.trim() || isNaN(price) || Number(price) <= 0) newErrors.price = "Harga harus berupa angka & lebih dari 0!";
        if (!stock.trim() || isNaN(stock) || Number(stock) < 0) newErrors.stock = "Stok harus berupa angka & tidak boleh negatif!";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSave = () => {
        // console.log(selectedProduct)
        if (selectedProduct) {
            if (!validateFormselect()) return;

        } else {
            if (!validateForm()) return;
        }

        const existingProduct = CartReducer.cartitempembelian.find(
            (item) => item.nama_produk === (selectedFile ? selectedProduct.nama_produk : query)
        );

        if (existingProduct) {
            Alert.alert("Peringatan", "Produk sudah masuk ke keranjang!");
            return;
        }

        const newProduct = {
            kode_produk: selectedProduct ? selectedProduct.kode_produk : `manual_${Date.now()}`,
            nama_produk: selectedProduct ? selectedProduct.nama_produk : query,
            kategori: selectedProduct ? selectedProduct.kategori.kode_kategori : category,
            harga: price,
            stok: stock,
            foto: selectedProduct ? selectedProduct.url_img : selectedFile ? selectedFile.uri : null,
            file: selectedFile ? {
                uri: selectedFile.uri,
                type: selectedFile.type,
                name: selectedFile.fileName,
            } : null,
            tipe: selectedProduct ? "pilihan" : "manual",
        };
        // console.log(newProduct)
        dispatch({ type: "ADD_PRODUCT", payload: newProduct });
        setModalVisibleform(false);
    };
    useFocusEffect(
        useCallback(() => {
            get()
        }, [])
    );
    useEffect(() => {
        if (selectedProduct) {
            setPrice(selectedProduct.harga?.toString() || "");
        }
    }, [selectedProduct]);
    const renderCartItem = item => {
        return <CartitemPembelian item={item} />;
    };
    const onPresssimpan = async () => {
        try {
            const user = JSON.parse(await AsyncStorage.getItem('datasession'));
            const token = await AsyncStorage.getItem('tokenAccess');
            // console.log(token)
            const id_toko = params.data.id_toko;
            const id_user = user.id_user
            const formData = new FormData();
            formData.append('id_toko', id_toko);
            formData.append('id_user', id_user);
            formData.append('items', CartReducer.cartitempembelian);
            console.log(JSON.stringify(formData))

            await axios.post(`${BASE_URL}/transaksipembelian`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }).then((res)=>{
                console.log(res)
            })
            
        } catch (error) {
            Alert.alert(error.response.data.message);
            console.error('Terjadi kesalahan saat mengirim transaksi:', error.response || error.message);
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.box1}>
                <StatusBar backgroundColor={'#151B25'} barStyle="light-content" />
                {CartReducer.cartitempembelian.length > 0 ? (
                    <FlatList
                        key={'flatlist'}
                        data={CartReducer.cartitempembelian}
                        renderItem={({ item }) => renderCartItem(item)}
                        keyExtractor={item => item.kode_produk}
                        contentInset={{ bottom: 150 }}
                        contentContainerStyle={{
                            paddingBottom:
                                CartReducer.cartitempembelian.length > 0
                                    ? Dimensions.get('screen').height / 3.5
                                    : 0,
                        }}
                    />) : null
                }
            </View>

            {CartReducer.cartitempembelian.length > 0 ? (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                    }}>

                    <View style={styles.box2}>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity
                                style={styles.checkout_container}
                                onPress={() => {
                                    onPresssimpan()
                                }}>
                                <Text style={styles.checkout}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <View style={styles.imgwarpStyle}>
                        <Image style={styles.imageStyle} source={emptycart} />
                    </View>

                    <Text style={styles.title}>Keranjang Kosong</Text>
                    <Button
                        color={'#695bd1'}
                        title="Tambah Pembelian Produk"
                        onPress={() => {
                            setErrors({})
                            setQuery("")
                            setCategory("");
                            setPrice("");
                            setStock("");
                            setSelectedFile(null)
                            setSelectedProduct(null);
                            setModalVisibleform(true)
                        }}
                    />
                </View>
            )}
            <Modal transparent={true} visible={modalVisibleLoading}>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                    }}>
                    <ActivityIndicator size={100} color={'#44dfff'} />
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleform}
                onRequestClose={() => setModalVisibleform(false)}
            >
                <TouchableOpacity
                    onPress={() => {
                        setModalVisibleform(false)

                    }}
                    style={styles.modalOverlay}
                >
                    <Pressable style={styles.modalContent1}>
                        <Text style={styles.modalTitle}>Tambah Item</Text>
                        <ScrollView style={{ flex: 1 }}>
                            {/* Produk */}
                            <Label label="Produk" />
                            <View style={styles.searchContainer}>
                                <Icon name="search" size={20} color="gray" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Search..."
                                    value={query}
                                    onChangeText={handleSearch}
                                />
                            </View>
                            {errors.query && <Text style={{ color: 'red' }}>{errors.query}</Text>}
                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    <FlashList
                                        data={suggestions}
                                        keyExtractor={(item, index) => index.toString()}
                                        estimatedItemSize={100}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    setQuery(item.nama_produk);
                                                    setSelectedProduct(item);
                                                    setCategory(item.kategori.nama_kategori);
                                                    setSelectedFile(true)
                                                    setSuggestions([]);
                                                }}
                                            >
                                                <Text>{item.nama_produk}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}
                            {!selectedFile ? (
                                <View>
                                    <Label label="Kategori Produk" />
                                    <TouchableOpacity
                                        style={styles.formGroup}
                                        onPress={() => setModalVisibleCategory(true)}
                                    >
                                        <Text style={{ color: '#000', padding: 8 }}>
                                            {category || 'Pilih Kategori'}
                                        </Text>
                                    </TouchableOpacity>
                                    {errors.category && <Text style={{ color: 'red' }}>{errors.category}</Text>}
                                </View>
                            ) : null}
                            <Label label="Stok Produk" />
                            <View style={styles.searchContainer}>
                                <Icon name="inventory" size={20} color="gray" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stok"
                                    value={stock}
                                    onChangeText={(text) => setStock(text)}
                                />
                            </View>
                            {errors.stock && <Text style={{ color: 'red' }}>{errors.stock}</Text>}
                            <Label label="Harga Produk" />
                            <View style={styles.searchContainer}>
                                <Icon name="inventory" size={20} color="gray" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Harga Produk"
                                    value={price}
                                    onChangeText={(text) => setPrice(text)}
                                    keyboardType="numeric"
                                />
                            </View>
                            {errors.price && <Text style={{ color: 'red' }}>{errors.price}</Text>}

                            {!selectedProduct ? (
                                <View>
                                    <Label label="Upload Foto Toko" />
                                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                                        <View style={styles.uploadBox}>

                                            {selectedFile ? (
                                                <Image source={{ uri: selectedFile.uri, }} resizeMode="contain" style={styles.previewImage} />
                                            ) : (
                                                <>
                                                    <Image
                                                        source={{ uri: "https://img.icons8.com/ios/50/000000/upload.png" }}
                                                        style={styles.icon}
                                                    />
                                                    <Text style={styles.uploadText}>Drag and Drop file here or</Text>
                                                    <Text style={styles.chooseFile}>Choose file</Text>
                                                </>
                                            )}

                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.supportText}>
                                        Supported formats: JPG, JPEG, PNG | Max size: 2MB
                                    </Text>
                                    {errors.fileImage && <Text style={styles.errorText}>{errors.fileImage}</Text>}
                                </View>
                            ) : null}


                        </ScrollView>

                        {/* Save Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Simpan"
                                onPress={() => {
                                    handleSave()
                                }}
                            />
                        </View>
                    </Pressable>
                </TouchableOpacity>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    console.log('close');
                    setModalVisible(!modalVisible);
                }}>
                <Pressable
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1, justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => setModalVisible(!modalVisible)}
                >
                    <Pressable style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        width: Dwidth / 1.2,
                        height: Dheight / 2,
                        borderRadius: 12,
                    }}>
                        <View onPress={() => { }} style={{
                            flex: 1, marginHorizontal: 20, marginVertical: 18, justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <TouchableOpacity style={styles.imagePicker} onPress={() => handleImageSelection("library", {
                                selectionLimit: 1,
                                mediaType: 'photo',
                                includeBase64: false,

                            })}>
                                <Text style={{ color: '#000' }}>Pilih Gambar dari Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.imagePicker} onPress={() => handleImageSelection("capture", {
                                saveToPhotos: false,
                                mediaType: 'photo',
                                includeBase64: false,

                            })}>
                                <Text style={{ color: '#000' }}>Ambil Gambar dengan Kamera</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
            <Modal transparent={true} visible={modalVisibleCategory}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalVisibleCategory(false)}
                >
                    <Pressable onPress={() => { }} style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Kategori</Text>
                        <ScrollView style={{ flex: 1, marginBottom: 12 }}>
                            {Datakateogri && Datakateogri.length > 0 ? (
                                Datakateogri.map((item, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.btnitemcategory}
                                        onPress={() => {
                                            setCategory(item.nama_kategori);
                                            setModalVisibleCategory(false);
                                        }}
                                    >
                                        <Text style={{ color: '#000', textAlign: 'center' }}>{item.nama_kategori}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={{ color: '#000', textAlign: 'center' }}>Tidak Ada Data Kategori</Text>
                            )}
                        </ScrollView>
                    </Pressable>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default TransaksiPembelianBaru;
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;
const styles = StyleSheet.create({
    modalView: {
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    box1: {
        display: 'flex',
        flexDirection: 'column',
    },
    box2: {
        backgroundColor: '#fff',
        width: '100%',
        height: 50,
        flexDirection: 'row',
        display: 'flex',
        flex: 1,
    },
    total_price: {
        height: 50,
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'TitilliumWeb-Bold',
        backgroundColor: '#fff',
        color: '#034687',
    },
    checkout_container: {
        textAlign: 'center',
        height: 50,
        backgroundColor: '#034687',
        color: '#fff',
    },
    checkout: {
        width: '100%',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'TitilliumWeb-Bold',
        color: '#fff',
    },
    imgContainerStyle: {
        height: 150,
        width: 250,
    },
    imageStyle: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'center',
        resizeMode: 'center',
    },
    title: {
        color: '#000',
        fontFamily: 'arial',
        fontSize: 20,
        marginBottom: 20,
    },
    btnStyle: {
        padding: 10,
        backgroundColor: '#034687',
        borderRadius: 20,
        margin: 20,
        fontSize: 16,
    },

    imgwarpStyle: {
        marginHorizontal: Dwidth * 0.06,
        height: Dheight / 2.5,
        width: "100%",
    },
    formGroup: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginVertical: 8,
    },
    modalOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: Dwidth / 1.2,
        height: Dheight / 2,
        borderRadius: 12,
    },
    modalContent1: {
        padding: 12,

        backgroundColor: '#fff',
        width: Dwidth / 1.2,
        height: Dheight / 1.2,

        borderRadius: 12,
    },
    modalTitle: {
        color: '#000',
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
        marginVertical: 12,
    },
    btnitemcategory: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    searchContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',

        zIndex: 1, // Memastikan input tetap terlihat
    },
    icon: {
        marginRight: 5,
    },
    input: {
        flex: 1,
        height: 40,
    },
    suggestionsContainer: {
        height: Dheight / 2,
        // margin: 12,
        position: 'absolute',
        top: 100, // Sesuaikan dengan tinggi input pencarian
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        zIndex: 2, // Memastikan daftar saran muncul di depan
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    uploadBox: {
        width: "100%",
        height: 200,
        borderWidth: 2,
        borderColor: "#007bff",
        borderStyle: "dashed",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },

    uploadText: {
        fontSize: 16,
        color: "#333",
    },
    chooseFile: {
        color: "#007bff",
        fontWeight: "bold",
        marginTop: 5,
    },
    fileName: {
        fontSize: 16,
        color: "#333",
        fontWeight: "bold",
    },
    supportText: {
        fontSize: 12,
        color: "#666",
        marginTop: 10,
    },
    imagePicker: {
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
    },
    previewImage: {
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        height: 190,
        borderRadius: 10,
        marginBottom: 10,
    },
});
