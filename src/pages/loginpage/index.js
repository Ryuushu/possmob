import { TextInput, TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BASE_URL from '../../../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
const Loginpage = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrors({}); // Reset errors before sending the request

    if (!email || !password) {
      setErrors({
        email: email ? '' : 'Email is required',
        password: password ? '' : 'Password is required',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}`+'/login', {
        email: email,
        password: password,
      });

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        await AsyncStorage.setItem('datasession',JSON.stringify(response.data.data));
        await AsyncStorage.setItem('tokenAccess',token);
        console.log(token)
        navigation.replace('Routestack', { user: user });
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Display validation errors from the server
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);
      } else if (error.response && error.response.status === 401) {
        setErrors({ general: 'Invalid credentials' });
      } else {
        alert('An unexpected error occurred. Please try again.');
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  cekislogin=async()=>{
    if(await AsyncStorage.getItem('tokenAccess')){
      const user = JSON.parse(await AsyncStorage.getItem('datasession'));
      navigation.replace('Routestack',user);
    };
  }
  useEffect(() => {
   cekislogin()
    }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={'#000'}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: undefined })); 
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
       {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={'#000'}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: undefined })); 
        }}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('regis')}
      >
        <Text style={styles.registerText}>Belum punya akun? Register</Text>
      </TouchableOpacity>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#333',
  },
  input: {
    color:'#000',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  registerButton: {
    marginTop: 16,
  },
  registerText: {
    color: '#4CAF50',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  
});


export default Loginpage
