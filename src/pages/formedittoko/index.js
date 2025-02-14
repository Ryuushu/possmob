import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  BackHandler,
  Pressable,
  Image,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import Input from '../../component/input';
import Label from '../../component/label';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const FormEditToko = ({ route }) => {
  const navigation = useNavigation();
  const params = route.params;
  const FormReducer = useSelector(state => state.FormTokoReducer);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [Form, setForm] = useState({
    id: '',
    namatoko: '',
    alamattoko: '',
    whatsapp: '',
    instagram: ''
  });
  const [errors, setErrors] = useState({});
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
  const validate = () => {
    let valid = true;
    let tempErrors = {};

    if (!Form.namatoko || Form.namatoko.trim() === '') {
      tempErrors.namatoko = 'Nama Toko harus diisi';
      valid = false;
    }

    if (!Form.alamattoko || Form.alamattoko.trim() === '') {
      tempErrors.alamattoko = 'Alamat Toko harus diisi';
      valid = false;
    }
    if (selectedFile && selectedFile.fileSize > 5 * 1024 * 1024) {
      alert('Ukuran gambar melebihi 5MB');
      return;
    }
    setErrors(tempErrors);
    return valid;
  };

  const get = () => {
    setForm({
      id: params.data.id_toko,
      namatoko: params.data.nama_toko,
      alamattoko: params.data.alamat_toko,
      whatsapp: params.data.whatsapp,
      instagram: params.data.instagram
    });
  }
  const handleBackButtonClick = () => {
    navigation.goBack();
    dispatch({ type: 'RM_FORM' });
    return true;
  }

  const onPress = async () => {
    if (!validate()) {
      // Alert.alert('Error', 'Mohon isi semua kolom dengan benar.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      const formData = new FormData();
      formData.append('nama_toko', Form.namatoko);
      formData.append('alamat_toko', Form.alamattoko);
      if (Form.whatsapp) formData.append('whatsapp', Form.whatsapp);
      if (Form.instagram) formData.append('instagram', Form.instagram);
      if (selectedFile) {
        formData.append('url_img', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.fileName,
        });
      }
      const response = await axios.post(
        `${BASE_URL}/toko/${Form.id}`,
        formData,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.status === 'success') {
        dispatch({ type: 'RM_FORM' })
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menyimpan data. Coba lagi nanti.');
    } finally {
      // setLoading(false);
    }

  };
  const onInputChange = (value, input) => {
    setForm({
      ...Form,
      [input]: value,
    });
  };
  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'RM_FORM' })
      get()
    }, [])
  );
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Ubah Toko</Text>
          </View>
          <View style={styles.warpcard}>
            <Label label={'Nama Toko'} />
            <View style={styles.formgroup}>
              <Input
                placeholder={'Nama Toko'}
                value={Form.namatoko}
                onChangeText={(value) => onInputChange(value, 'namatoko')}
              />
            </View>
            {errors.namatoko && <Text style={styles.errorText}>{errors.namatoko}</Text>}

            <Label label={'Alamat Toko'} />
            <View style={styles.formgroup}>
              <Input
                placeholder={'Alamat Toko'}
                value={Form.alamattoko}
                onChangeText={(value) => onInputChange(value, 'alamattoko')}
              />
            </View>
            {errors.alamattoko && <Text style={styles.errorText}>{errors.alamattoko}</Text>}

            <Label label={'Whatsapp (Optional)'} />
            <View style={styles.formgroup}>
              <Input
                placeholder={'Whatsapp'}
                value={Form.whatsapp}
                onChangeText={(value) => onInputChange(value, 'whatsapp')}
                keyboardType="numeric"
              />
            </View>
            {errors.whatsapp && <Text style={styles.errorText}>{errors.whatsapp}</Text>}

            <Label label={'Instagram (Optional)'} />
            <View style={styles.formgroup}>
              <Input
                placeholder={'Instagram'}
                value={Form.instagram}
                onChangeText={(value) => onInputChange(value, 'instagram')}
              />
            </View>
            {errors.instagram && <Text style={styles.errorText}>{errors.instagram}</Text>}

            <Label label="Upload Foto Toko (Optional)" />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View style={styles.uploadBox}>
                {selectedFile ? (
                  <Image source={{ uri: selectedFile.uri }} resizeMode="contain" style={styles.previewImage} />
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
            <Text style={styles.supportText}>Supported formats: JPG, JPEG, PNG | Max size: 5MB</Text>
            {errors.fileImage && <Text style={styles.errorText}>{errors.fileImage}</Text>}

            <View style={styles.wrapbutton}>
              <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttontxt}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
          <Pressable style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            width: DWidth / 1.2,
            height: DHeight / 2,
            borderRadius: 12,
          }} pointerEvents="auto" >
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
    </View>
  );
};

export default FormEditToko;
const DWidth = Dimensions.get('window').width;
const DHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  card: {
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 2,
    margin: 12,
    padding: 16,
  },
  titleWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#151B25',
  },
  warpcard: {
    marginHorizontal: DWidth * 0.05,
    justifyContent: 'center',
  },
  formgroup: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 0,
    padding: 4,
  },
  wrapbutton: {
    marginTop: 14,
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: DWidth * 0.7,
    height: DHeight / 15,
    backgroundColor: '#007bff',
  },
  buttontxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
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
