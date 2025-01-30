import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BASE_URL from '../../../config'

const ItemList3 = ({ data, ...props }) => {

  return (
    <TouchableOpacity {...props} style={{ justifyContent: 'space-between', backgroundColor: '#fff', elevation: 4, marginHorizontal: 2, borderRadius: 8 }} >
      <View style={{flexDirection:'row'}}>
        <View>
          {data.url_img == undefined ? (
            data.nama_toko.split(' ').length <= 1 ? (
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
                  {data.nama_toko.slice(0, 1).toUpperCase() +
                    data.nama_toko.slice(1, 2).toUpperCase()}
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
                  {data.nama_toko.split(' ')[0].slice(0, 1).toUpperCase() +
                    data.nama_toko.split(' ')[1].slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )
          ) : (
            <Image source={{ uri: data.url_img }} style={styles.image}></Image>
          )}
        </View>
        <View style={{marginLeft:6,justifyContent:'center'}}>
          <Text style={{ color: '#000', fontWeight: 'bold', fontSize:16}}>{data.nama_toko}</Text>
          <Text style={{ color: '#000' }}>{data.alamat_toko}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ItemList3

const styles = StyleSheet.create({
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
})