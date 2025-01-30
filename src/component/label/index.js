import { StyleSheet, Text} from 'react-native'
import React from 'react'

const Label = ({label}) => {
  return (
    <Text style={styles.label}>{label}</Text>
  )
}

export default Label

const styles = StyleSheet.create({
    label:{
        marginVertical:10,
        color:'#000',
        fontSize:18,
       
    }
})