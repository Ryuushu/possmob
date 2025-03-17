import { StyleSheet, Text} from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'

const ItemDiskon = ({data,...props}) => {
  return (
   <TouchableOpacity {...props} style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',elevation:4,marginHorizontal:2,padding:12,borderRadius:8}} >
        <Text style={{color: '#000'}}>{data[1]}</Text>
        <Text style={{color: '#000'}}>{data[2].split('-').length<=1?'Rp.'+data[2].split('-')[0]:data[2].split('-')[0]+'%'}</Text>
   </TouchableOpacity>
  )
}

export default ItemDiskon

const styles = StyleSheet.create({})