import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from '../../../config';

const OtpVerificationScreen = () => {
  const navigation = useNavigation();

  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        otp,
      });

      alert('OTP Verified Successfully');
      navigation.navigate('login');
    } catch (error) {
      alert('OTP verification failed: ' + error.response.data.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      <Button title="Verify OTP" onPress={handleVerifyOtp} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default OtpVerificationScreen;
