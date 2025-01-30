import { StyleSheet, Text} from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'

const ItemList2 = ({data,...props}) => {
  
  return (
   <TouchableOpacity {...props} style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',elevation:4,marginHorizontal:2,padding:12,borderRadius:8}} >
        <Text style={{color: '#000'}}>{data.nama_kategori}</Text>
   </TouchableOpacity>
  )
}

export default ItemList2

const styles = StyleSheet.create({})