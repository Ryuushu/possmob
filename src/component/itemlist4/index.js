import { StyleSheet, Text,TouchableOpacity, View } from 'react-native'
import React from 'react'

const ItemList4 = ({data,...props}) => {
  return (
    <TouchableOpacity {...props} style={{justifyContent:'space-between',backgroundColor:'#fff',elevation:4,marginHorizontal:2,padding:12,borderRadius:8}} >
           <Text style={{color: '#000', fontWeight: 'bold',}}>{data.nama_pekerja}</Text>
           <Text style={{color: '#000'}}>{data.alamat_pekerja}</Text>
      </TouchableOpacity>
  )
}

export default ItemList4

const styles = StyleSheet.create({})