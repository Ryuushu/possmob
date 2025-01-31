import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  BackHandler,
  Image,
  Pressable,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Input from '../../component/input';
import Label from '../../component/label';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setForm } from '../../redux/action';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
const { width: DWidth, height: DHeight } = Dimensions.get('window');

const Formkasir = ({ route }) => {
  const params = route.params.data;
  const navigation = useNavigation();
  const FormReducer = useSelector((state) => state.FormReducer);
  const dispatch = useDispatch();
  const includeExtra = false;
  const [Check, setCheck] = useState(false);
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [Datakateogri, setDatakateogri] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [kateg, setkateg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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
  const handleBackButtonClick = () => {
    navigation.goBack();
    dispatch({ type: 'RM_FORM' });
    return true;
  };

  const get = async () => {
    dispatch({ type: 'RM_FORM' })
    const token = await AsyncStorage.getItem('tokenAccess');
    try {
      const res = await axios.get(`${BASE_URL}/kategori?id_toko=${params.id_toko}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDatakateogri(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!FormReducer.form.namaproduk || FormReducer.form.namaproduk.trim() === '') {
      newErrors.namaproduk = 'Nama produk harus diisi';
    }
    if (!FormReducer.form.hargaproduk || isNaN(FormReducer.form.hargaproduk)) {
      newErrors.hargaproduk = 'Harga produk harus berupa angka';
    }
    if (FormReducer.form.stokproduk && isNaN(FormReducer.form.stokproduk)) {
      newErrors.stokproduk = 'Stok produk harus berupa angka';
    }
    if (!FormReducer.form.kategoriproduk || FormReducer.form.kategoriproduk.trim() === '') {
      newErrors.kategoriproduk = 'Kategori produk harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onPress = async () => {
    if (!validateInputs()) return;

    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      const formData = new FormData();
      formData.append('id_toko', params.id_toko);
      formData.append('nama_produk', FormReducer.form.namaproduk);
      formData.append('harga', FormReducer.form.hargaproduk);

      formData.append('stok', FormReducer.form.stokproduk)

      formData.append('kode_kategori', FormReducer.form.idkategori);
      formData.append('is_stock_managed', FormReducer.form.stokproduk > 0 ? 1 : 0);
      if (selectedFile) {
        formData.append('url_img', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.fileName,
        });
      }
      // console.log(formData)
      const response = await axios.post(`${BASE_URL}/produk`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        dispatch({ type: 'RM_FORM' });
        navigation.goBack();
        setCheck(!Check);
      }
    } catch (error) {
      console.log(error.response)
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const onInputChange = (value, input) => {
    dispatch(setForm(input, value));
    setErrors((prev) => ({ ...prev, [input]: null }));
  };

  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>Form Tambah Produk</Text>
        <View style={styles.card}>
          <View style={styles.wrapCard}>
            <Label label="Nama Produk" />
            <View style={styles.formGroup}>
              <Input
                input="Nama Produk"
                value={FormReducer.form.namaproduk}
                onChangeText={(value) => onInputChange(value, 'namaproduk')}
              />
            </View>
            {errors.namaproduk && <Text style={styles.errorText}>{errors.namaproduk}</Text>}
            <Label label="Kategori Produk" />
            <TouchableOpacity
              style={styles.formGroup}
              onPress={() => setModalVisibleCategory(true)}
            >
              <Text style={{ color: '#000', padding: 8 }}>
                {FormReducer.form.kategoriproduk || 'Pilih Kategori'}
              </Text>
            </TouchableOpacity>
            {errors.kategoriproduk && <Text style={styles.errorText}>{errors.kategoriproduk}</Text>}
            <Label label="Harga Produk" />
            <View style={styles.formGroup}>
              <Input
                input="Harga Produk"
                value={FormReducer.form.hargaproduk}
                onChangeText={(value) => onInputChange(value, 'hargaproduk')}
                keyboardType="number-pad"
              />
            </View>
            {errors.hargaproduk && <Text style={styles.errorText}>{errors.hargaproduk}</Text>}
            {kateg ? <View>
              <Label label="Stok Produk" />
              <View style={styles.formGroup}>
                <Input
                  input="Stok Produk"
                  value={FormReducer.form.stokproduk}
                  onChangeText={(value) => onInputChange(value, 'stokproduk')}
                  keyboardType="number-pad"
                />
              </View>
              {errors.stokproduk && <Text style={styles.errorText}>{errors.stokproduk}</Text>}
            </View>:null}


            <Label label="Foto Produk" />
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
            <Text style={styles.supportText}>Supported formats: JPG, JPEG, PNG | Max size: 2MB</Text>
            {errors.fileImage && <Text style={styles.errorText}>{errors.fileImage}</Text>}
            <View style={styles.wrapButton}>
              <TouchableOpacity style={styles.button} onPress={() => onPress()}>
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        <Modal transparent={true} visible={modalVisibleCategory}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisibleCategory(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Category</Text>
              <ScrollView style={{ flex: 1, marginBottom: 42 }}>
                {Datakateogri && Datakateogri.length > 0 ? (
                  Datakateogri.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.btnitemcategory}
                      onPress={() => {
                        dispatch(setForm('kategoriproduk', item.nama_kategori));
                        dispatch(setForm('idkategori', item.kode_kategori));
                        setModalVisibleCategory(false);
                        item.is_stok == 1 ? setkateg(true) : setkateg(false)
                      }}
                    >
                      <Text style={{ color: '#000', textAlign: 'center' }}>{item.nama_kategori}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#000', textAlign: 'center' }}>Tidak Ada Data Kategori</Text>
                )}
              </ScrollView>
            </View>
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
            activeOpacity={1}>
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
              width: DWidth / 1.2,
              height: DHeight / 4.8,
              borderRadius: 12,
            }} pointerEvents="auto" >
              <Pressable onPress={() => { }} style={{ flex: 1, marginHorizontal: 20, marginVertical: 18 }}>
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
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',

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
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  wrapCard: {
    marginVertical: 8,
  },
  formGroup: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 8,
  },
  wrapButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: DWidth / 1.2,
    height: DHeight / 3.5,
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
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
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
});

export default Formkasir;