import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Button, TextInput, Text, TouchableOpacity } from 'react-native';
import { color } from 'react-native-reanimated';
import BASE_URL from '../../../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const RegisterPage = () => {
    const navigation = useNavigation()
    const [formData, setFormData] = useState({
        nama_pemilik: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.nama_pemilik) newErrors.nama_pemilik = 'Nama pemilik diperlukan';
        if (!formData.email) {
            newErrors.email = 'Email diperlukan';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }
        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            setLoading(true);
            try {
                const response = await axios.post(`${BASE_URL}/register`,formData, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (response.data.status === 'success') {
                    const { user, token } = response.data.data;
                    // await AsyncStorage.setItem('datasession', JSON.stringify(response.data.data));
                    // await AsyncStorage.setItem('tokenAccess', token);
                    // console.log(token);
                    navigation.navigate('login');
                }
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    // Display validation errors from the server
                    const validationErrors = error.response.data.errors;
                    setErrors(validationErrors);
                } else if (error.response && error.response.status === 401) {
                    setErrors({ general: 'Invalid credentials' });
                } else {
                    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                    console.error( error.response);
                }
            } finally {
                setLoading(false);
            }
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView contentContainerStyle={styles.form}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nama Pemilik</Text>
                        <TextInput
                            placeholderTextColor={'#000'}
                            style={[styles.input, errors.nama_pemilik && styles.inputError]}
                            placeholder="Masukkan nama pemilik"
                            value={formData.nama_pemilik}
                            onChangeText={(value) => setFormData({ ...formData, nama_pemilik: value })}
                        />
                        {errors.nama_pemilik && <Text style={styles.errorText}>{errors.nama_pemilik}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholderTextColor={'#000'}
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Masukkan email"
                            value={formData.email}
                            onChangeText={(value) => setFormData({ ...formData, email: value })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            placeholderTextColor={'#000'}
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Masukkan password"
                            value={formData.password}
                            onChangeText={(value) => setFormData({ ...formData, password: value })}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Konfirmasi Password</Text>
                        <TextInput
                            placeholderTextColor={'#000'}
                            style={[styles.input, errors.password_confirmation && styles.inputError]}
                            placeholder="Masukkan ulang password"
                            value={formData.password_confirmation}
                            onChangeText={(value) => setFormData({ ...formData, password_confirmation: value })}
                            secureTextEntry
                        />
                        {errors.password_confirmation && (
                            <Text style={styles.errorText}>{errors.password_confirmation}</Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    card: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    form: {
        flexGrow: 1,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#f44336',
    },
    errorText: {
        color: '#f44336',
        fontSize: 12,
        marginTop: 5,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterPage;
