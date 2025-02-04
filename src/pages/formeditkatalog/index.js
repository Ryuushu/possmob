import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Image,
  Pressable,
  Switch,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Label from '../../component/label';
import Input from '../../component/input';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Iscan, Iscand } from '../../assets/icon';
import BASE_URL from '../../../config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const FormEdit = ({ route, navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const params = route.params;
  const isFocused = useIsFocused();
  const [modalVisibleCategory, setModalVisibleCategory] = useState(false);
  const [Datakateogri, setDatakateogri] = useState([]);
  const [kateg, setkateg] = useState(false);
  const [errors, setErrors] = useState({});
  const [switchValue, setSwitchValue] = useState(false);
  const [Form, setForm] = useState({
    kodeproduk: '',
    namaproduk: '',
    hargaproduk: '',
    kodekategori: '',
    stokproduk: '',
    urlimgproduk: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const includeExtra = false;
  const onButtonPressimg = React.useCallback((type, options) => {
    if (type === 'capture') {
      launchCamera(options, (response) => {
        if (response.assets && response.assets[0]) {
          setSelectedFile(response.assets[0]);
          // dispatch(setForm('fileImage', response.assets[0].uri));
        }
      });
    } else {
      launchImageLibrary(options, (response) => {
        if (response.assets && response.assets[0]) {
          setSelectedFile(response.assets[0]);
          // dispatch(setForm('fileImage', response.assets[0].uri));
        }
      });
    }
    setModalVisible(false)
  }, []);
  const validateInputs = () => {
    const newErrors = {};
    if (!Form.namaproduk || Form.namaproduk.trim() === '') {
      newErrors.namaproduk = 'Nama produk harus diisi';
    }
    if (!Form.hargaproduk || isNaN(Form.hargaproduk)) {
      newErrors.hargaproduk = 'Harga produk harus berupa angka';
    }
    if (Form.stokproduk && isNaN(Form.stokproduk)) {
      newErrors.stokproduk = 'Stok produk harus berupa angka';
    }
    if (!Form.kategoriproduk || Form.kategoriproduk.trim() === '') {
      newErrors.kategoriproduk = 'Kategori produk harus dipilih';
    }
    if (!Form.hargaproduk || isNaN(Form.hargaproduk) || Number(Form.hargaproduk) < 0) {
      newErrors.hargaproduk = 'Harga produk harus berupa angka positif';
    }
    if (Form.stokproduk && (isNaN(Form.stokproduk) || Number(Form.stokproduk) < 0)) {
      newErrors.stokproduk = 'Stok produk harus berupa angka positif';
    }
    if (selectedFile && selectedFile.fileSize > 2 * 1024 * 1024) {
      alert('Ukuran gambar melebihi 2MB');
      return;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const onPress = async () => {
    if (!validateInputs()) return;

    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      const formData = new FormData();

      formData.append('nama_produk', Form.namaproduk);
      formData.append('harga', Form.hargaproduk);
      formData.append('stok', Form.stokproduk);
      formData.append('kode_kategori', Form.kodekategori);
      formData.append('is_stock_managed', Form.stokproduk > 0 ? 1 : 0);

      if (selectedFile) {
        formData.append('url_img', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.fileName,
        });
      }

      const response = await axios.post(`${BASE_URL}/produk/${Form.kodeproduk}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response);
      navigation.goBack();
    } catch (e) {
      console.error(e.response);
    }
  };


  const onInputChange = (value, input) => {
    setForm({
      ...Form,
      [input]: value,
    });
  };


  const get = async () => {
    console.log(params)
    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      await axios.get(`${BASE_URL}/kategori?id_toko=${params.id}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      ).then(res => {
        setDatakateogri(res.data.data);
      })

      setForm({
        kodeproduk: params.data.kode_produk,
        namaproduk: params.data.nama_produk,
        hargaproduk: params.data.harga,
        stokproduk: params.data.stok,
        kodekategori: params.data.kategori.kode_kategori,
        kategoriproduk: params.data.kategori.nama_kategori,
        urlimgproduk: params.data.url_img,
      });
      params.data.kategori.is_stok == 1 ? setkateg(true) : setkateg(false)
      // console.log(params.data.url_img)
    } catch (error) {
      console.error(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Form Tambah Produk</Text>

          <View style={styles.wrapCard}>
            <Label label="Nama Produk" />
            <View style={styles.formGroup}>
              <Input
                input="Nama Produk"
                value={Form.namaproduk}
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
                {Form.kategoriproduk || 'Pilih Kategori'}
              </Text>
            </TouchableOpacity>
            {errors.kategoriproduk && <Text style={styles.errorText}>{errors.kategoriproduk}</Text>}
            <Label label="Harga Produk" />
            <View style={styles.formGroup}>
              <Input
                input="Harga Produk"
                value={String(Form.hargaproduk)}
                onChangeText={(value) => onInputChange(value, 'hargaproduk')}
                keyboardType="number-pad"
              />
            </View>
            {errors.hargaproduk && <Text style={styles.errorText}>{errors.hargaproduk}</Text>}
            {kateg ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: '#000', fontSize: 16, marginRight: 10 }}>Memiliki stok ? {switchValue ? 'Iya' : 'Tidak'}</Text>

              <Switch
                value={switchValue} // state to manage the switch status
                onValueChange={newValue =>

                  setSwitchValue(newValue)
                }
                trackColor={{ false: '#ccc', true: '#4CAF50' }} // Change track color
                thumbColor={switchValue ? '#ffffff' : '#f4f3f4'} // Thumb color when ON and OFF
                ios_backgroundColor="#3e3e3e" // Background color when it's OFF on iOS
              />
            </View> : null}


            <Label label="Upload Foto Produk" />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View style={styles.uploadBox}>
                {selectedFile ? (
                  <Image source={{ uri: selectedFile.uri, }} resizeMode="contain" style={styles.previewImage} />
                ) : Form.urlimgproduk != '' && Form.urlimgproduk != null ? (
                  <Image source={{ uri: Form.urlimgproduk, }} resizeMode="contain" style={styles.previewImage} />
                ) :
                  (
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
              <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


      </ScrollView>
      <Modal transparent={true} visible={modalVisibleCategory}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisibleCategory(false)}
        >
          <Pressable onPress={() => { }} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori</Text>
            <ScrollView style={{ flex: 1, marginBottom: 42 }}>
              {Datakateogri && Datakateogri.length > 0 ? (
                Datakateogri.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.btnitemcategory}
                    onPress={() => {
                      setForm((prevForm) => ({
                        ...prevForm,
                        kategoriproduk: item.nama_kategori,
                        kodekategori: item.kode_kategori,
                      }));
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
          activeOpacity={1}>
          <Pressable onPress={() => { }} style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            width: DWidth / 1.2,
            height: DHeight / 2,
            borderRadius: 12,
          }} pointerEvents="auto" >
            <View style={{ flex: 1, marginHorizontal: 20, justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={styles.imagePicker} onPress={() => onButtonPressimg("library", {
                selectionLimit: 1,
                mediaType: 'photo',
                includeBase64: false,
                includeExtra,
              })}>
                <Text style={{ color: '#000' }}>Pilih Gambar dari Galeri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePicker} onPress={() => onButtonPressimg("capture", {
                saveToPhotos: false,
                mediaType: 'photo',
                includeBase64: false,
                includeExtra,
              })}>
                <Text style={{ color: '#000' }}>Ambil Gambar dengan Kamera</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FormEdit;
const DWidth = Dimensions.get('window').width;
const DHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  previewImage: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: 190,
    borderRadius: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // padding: 16,
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
    padding: 16,
    elevation: 2,
    margin: 12,
  },
  wrapCard: {
    marginVertical: 8,
  },
  formGroup: {
    borderWidth: 1,
    borderColor: '#007bff',
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
    height: DHeight / 2,
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
  previewImage: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: 190,
    borderRadius: 10,
    marginBottom: 10,
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
