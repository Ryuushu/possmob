import React, { useCallback, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    Pressable,
    Modal,
} from 'react-native';
import Label from '../../component/label';
import Input from '../../component/input';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config';
import { setForm } from '../../redux/action';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Formtoko = () => {
    const navigation = useNavigation();
    const FormReducer = useSelector((state) => state.FormTokoReducer);
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
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

    const validate = () => {
        let valid = true;
        let tempErrors = {};

        if (!FormReducer.form.namatoko || FormReducer.form.namatoko.trim() === '') {
            tempErrors.namatoko = 'Nama Toko harus diisi';
            valid = false;
        }

        if (!FormReducer.form.alamattoko || FormReducer.form.alamattoko.trim() === '') {
            tempErrors.alamattoko = 'Alamat Toko harus diisi';
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    const onPress = async () => {
        if (!validate()) {
            return;
        }

        const token = await AsyncStorage.getItem('tokenAccess');
        const formData = new FormData();
        formData.append('nama_toko', FormReducer.form.namatoko);
        formData.append('alamat_toko', FormReducer.form.alamattoko);
        if (FormReducer.form.whatsapp) formData.append('whatsapp', FormReducer.form.whatsapp);
        if (FormReducer.form.instagram) formData.append('instagram', FormReducer.form.instagram);
        if (selectedFile) {
            formData.append('url_img', {
                uri: selectedFile.uri,
                type: selectedFile.type,
                name: selectedFile.fileName,
            });
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/toko`,
                formData,
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            Alert.alert('Sukses', 'Data berhasil disimpan.');
            navigation.goBack();
        } catch (error) {
            console.error(error.response);
            Alert.alert('Error', 'Gagal menyimpan data. Coba lagi nanti.');
        }
    };

    const onInputChange = (value, input) => {
        dispatch(setForm(input, value));
    };
     useFocusEffect(
        useCallback(() => {
            dispatch({ type: 'RM_FORM' });
        }, [])
      );

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            >
                <View style={styles.card}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>Form Toko</Text>
                    </View>
                    <View style={styles.warpcard}>
                        <Label label={'Nama Toko'} />
                        <View style={styles.formgroup}>
                            <Input
                                placeholder={'Nama Toko'}
                                value={FormReducer.form.namatoko}
                                onChangeText={(value) => onInputChange(value, 'namatoko')}
                            />
                        </View>
                        {errors.namatoko && <Text style={styles.errorText}>{errors.namatoko}</Text>}

                        <Label label={'Alamat Toko'} />
                        <View style={styles.formgroup}>
                            <Input
                                placeholder={'Alamat Toko'}
                                value={FormReducer.form.alamattoko}
                                onChangeText={(value) => onInputChange(value, 'alamattoko')}
                            />
                        </View>
                        {errors.alamattoko && <Text style={styles.errorText}>{errors.alamattoko}</Text>}

                        <Label label={'Whatsapp'} />
                        <View style={styles.formgroup}>
                            <Input
                                placeholder={'Whatsapp'}
                                value={FormReducer.form.whatsapp}
                                onChangeText={(value) => onInputChange(value, 'whatsapp')}
                            />
                        </View>
                        {errors.whatsapp && <Text style={styles.errorText}>{errors.whatsapp}</Text>}

                        <Label label={'Instagram'} />
                        <View style={styles.formgroup}>
                            <Input
                                placeholder={'Instagram'}
                                value={FormReducer.form.instagram}
                                onChangeText={(value) => onInputChange(value, 'instagram')}
                            />
                        </View>
                        {errors.instagram && <Text style={styles.errorText}>{errors.instagram}</Text>}

                        <Label label="Upload Foto Toko" />
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
                        <Text style={styles.supportText}>Supported formats: JPG, JPEG, PNG | Max size: 2MB</Text>
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
                    }} pointerEvents="auto">
                        <View onPress={() => { }} style={{ flex: 1, marginHorizontal: 20, marginVertical: 18,  justifyContent: 'center',
                        alignItems: 'center', }}>
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
        width: DWidth * 0.9,
        elevation: 2,
        paddingVertical: 20,
    },
    titleWrapper: {
        alignItems: 'center',
        marginBottom: 20,
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
    previewImage: {
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        height: 190,
        borderRadius: 10,
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

export default Formtoko;
