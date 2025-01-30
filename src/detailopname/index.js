import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import BASE_URL from '../../config';
import { FlashList } from '@shopify/flash-list';

const DetailOpname = ({ route ,navigation}) => {
  const { selectedItems, id_toko } = route.params;

  const [data, setData] = useState([]);
  const [counters, setCounters] = useState({}); // Menyimpan counter berdasarkan ID item

  const handleIncrement = (id) => {
    setCounters((prevCounters) => ({
      ...prevCounters,
      [id]: (prevCounters[id] || 0) + 1,
    }));
  };
  
  const handleDecrement = (id) => {
    setCounters((prevCounters) => ({
      ...prevCounters,
      [id]: Math.max((prevCounters[id] || 0) - 1, 0),
    }));
  };
  

  const handleInputChange = (id, text) => {
    const numericValue = parseInt(text, 10);
    setCounters((prev) => ({
      ...prev,
      [id]: isNaN(numericValue) ? 0 : numericValue, // Simpan nilai baru atau 0 jika kosong
    }));
  };
  const get = async () => {
    try {
      const token = await AsyncStorage.getItem('tokenAccess'); // Get token if needed
      const selectedCodes = selectedItems.map(item => item); // Extract the kode_produk values
      const initialCounters = {};
      selectedCodes.forEach((item) => {
        initialCounters[item] = 0;
      });
      setCounters(initialCounters);
      const response = await axios.post(
        `${BASE_URL}/s`,
        { kode_produk: selectedCodes }, // Send the array of kode_produk
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setData(response.data)
    } catch (error) {
      console.error('Error sending data:', error.message);

    }
  }
  useEffect(() => {
    get()
  }, [])

  const handleSave = async () => {
    try {
      // Validasi awal: Periksa token
      const token = await AsyncStorage.getItem('tokenAccess');
      if (!token) {
        alert('Token tidak ditemukan. Harap login kembali.');
        return;
      }
      console.log(id_toko)
      // Validasi awal: Periksa id_toko
      if (!id_toko) {
        alert('ID Toko tidak valid.');
        return;
      }

      // Format dan validasi data
      const formattedData = data.map((item) => {
        const stokFisik = counters[item.kode_produk] || 0;

        if (!item.kode_produk || typeof item.kode_produk !== 'number') {
          throw new Error(`Kode produk tidak valid untuk item: ${JSON.stringify(item)}`);
        }

        if (stokFisik < 1) {
          throw new Error(`Stok fisik tidak boleh kurang dari 0 untuk produk: ${item.kode_produk}`);
        }

        return {
          kode_produk: item.kode_produk,
          stok_fisik: stokFisik,
          keterangan: item.keterangan || '', // Tambahkan keterangan jika diubah di input
        };
      });

      // Kirim data ke server
      const response = await axios.post(
        `${BASE_URL}/svopname`,
        { id_toko: id_toko, stok_opname: formattedData }, // Data yang akan dikirim
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        navigation.goBack()  
        alert('Data berhasil disimpan');
      }
    } catch (error) {
      console.error('Error saving data:', error.message);
      if (error.response) {
        console.log('Server response:', error.response.data);
      }

      alert('Gagal menyimpan data: ' + (error.message || 'Terjadi kesalahan.'));
    }
  };


  const renderItem = ({ item }) => (

    <View style={{
      backgroundColor: '#fff', flex: 1, padding: 8,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 12,
    }}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Nama Produk:</Text>
          <Text style={styles.text}>{item.nama_produk}</Text>
          <Text style={styles.label}>Stok Sistem:</Text>
          <Text style={styles.text}>{item.stok}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Stok Terkini:</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleDecrement(item.kode_produk)}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <TextInput
    
    style={[styles.input,{maxWidth:100,}]}
              placeholder="0"
              value={String(counters[item.kode_produk] || 0)} // Tampilkan 0 jika belum ada nilai
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange(item.kode_produk, text)}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleIncrement(item.kode_produk)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Selisih:</Text>
          <Text style={styles.text}>{item.stok - counters[item.kode_produk]}</Text>
        </View>

      </View>
      <Text style={styles.label}>Keterangan:</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan Keterangan"
        value={item.keterangan || ''}
        onChangeText={(text) => {
          setData((prevData) =>
            prevData.map((product) =>
              product.kode_produk === item.kode_produk
                ? { ...product, keterangan: text }
                : product
            )
          );
        }}

      />
    </View>

  );

  return (
    <View style={styles.container}>
      {/* Header */}

      {/* FlatList for rendering items */}
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.kode_produk.toString()}
        estimatedItemSize={100}
        extraData={counters}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  row: {

    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',




  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  column: {
    flex: 1,
    // marginHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',

  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    height: 40,
    color: '#000',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailOpname

