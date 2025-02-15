import { TextInput, TouchableOpacity, StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import BASE_URL from '../../../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginPage = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('tokenAccess');
      if (token) {
        const user = JSON.parse(await AsyncStorage.getItem('datasession'));
        navigation.replace('Routestack',  { user: user });
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    setErrors({});
    if (!identifier || !password) {
      setErrors({
        identifier: identifier ? '' : 'Email harus diisi',
        password: password ? '' : 'Password harus diisi',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/login`, { identifier, password });
      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
            console.log(user)

        await AsyncStorage.setItem('datasession', JSON.stringify(user));
        await AsyncStorage.setItem('tokenAccess', token);
        navigation.replace('Routestack',  { user: user } );
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 401) {
        setErrors({ general: 'Email atau password salah' });
      } else {
        console.log(error)
        alert('Terjadi kesalahan, coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Masuk</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Atau Nama Anda"
          placeholderTextColor={'#000'}
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.identifier && <Text style={styles.errorText}>{errors.identifier}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          placeholderTextColor={'#000'}
          style={styles.input}
          placeholder="Masukkan password"
          value={password}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry={!showPassword} // Toggle visibility
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Memuat...' : 'Masuk'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('regis')}>
        <Text style={styles.registerText}>Belum punya akun? Daftar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    color: '#000',
  },
  eyeIcon: {
    padding: 2,
  },
  button: {
    width: '90%',
    padding: 14,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: '5%',
    marginBottom: 8,
  },
  registerText: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});

export default LoginPage;
