import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TransaksiPembelian = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const data = ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Pineapple', 'Strawberry'];

  // Filter berdasarkan input pengguna
  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 0) {
      const filteredData = data.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filteredData);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {/* Menampilkan daftar saran yang menimpa input "Stok" */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setQuery(item);
                  setSuggestions([]);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input Stok (akan tertutupi oleh daftar saran) */}
      <View style={styles.searchContainer}>
        <Icon name="inventory" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Stok"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
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
    position: 'absolute',
    top: 55, // Sesuaikan dengan tinggi input pencarian
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
});

export default TransaksiPembelian;
