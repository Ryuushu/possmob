import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BASE_URL from '../../../config';

const ItemKatalog = ({ item, type, ...res }) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: getCardColor(type),
          borderRadius: 6,
          marginHorizontal: 2,
          elevation:2,
        },
      ]}
      {...res}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.url_img == undefined ? (
          item.nama_produk.split(' ').length <= 1 ? (
            <View
              style={{
                borderBottomLeftRadius: 6,
                backgroundColor: '#626262',
                borderTopLeftRadius: 6,
                height: 80,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                {item.nama_produk.slice(0, 1).toUpperCase() +
                  item.nama_produk.slice(1, 2).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View
              style={{
                borderBottomLeftRadius: 6,
                backgroundColor: '#626262',
                borderTopLeftRadius: 6,
                height: 80,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                {item.nama_produk.split(' ')[0].slice(0, 1).toUpperCase() +
                  item.nama_produk.split(' ')[1].slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )
        ) : (
          <Image source={{ uri: item.url_img }} style={styles.image}></Image>
        )}
        <View style={{ flex: 5, marginLeft: 12 }}>
          <Text style={{ color: gettextColor(type), fontFamily: 'TitilliumWeb-Bold' }}>
            {item.nama_produk}
          </Text>
          <Text style={{ color: gettextColor(type), fontFamily: 'TitilliumWeb-Light' }}>
            Kategori : {item.kategori.nama_kategori}
          </Text>
          {item.stok > 0 ? <Text style={{ color: gettextColor(type), fontFamily: 'TitilliumWeb-Light' }}>
            stok : {item.stok}
          </Text> : <View></View>}

        </View>

        <View style={{ marginRight: 12 }}>
          <Text style={{ color: gettextColor(type), fontFamily: 'TitilliumWeb-Regular' }}>
            Rp.{item.harga}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemKatalog;
const getCardColor = (type) => {
  if (type) {
    return '#007bff';
  } else {
    return '#fff';
  }
}
const gettextColor = (type) => {
  if (type) {
    return '#fff';
  } else {
    return '#000';
  }
}
const styles = StyleSheet.create({
  selectedItem: {
    backgroundColor: '#007bff', // Warna highlight
  },
  image: {
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
    height: 80,
    // width: 80,
     aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: '',
  },
});
