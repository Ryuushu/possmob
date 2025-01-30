import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const CardSub = ({ item }) => {
  const currency= new Intl.NumberFormat('id-ID')

    return (
        <View style={styles.container}>
            <View style={styles.wrap}>
                <View>
                <Text style={styles.texthead}>{item.item.namaproduk}</Text>
                <Text style={styles.text}>{item.count}x</Text>
                </View>
                <Text style={styles.text}>Rp.{currency.format(item.count * item.item.hargaproduk)}</Text>
            </View>
            <View style={styles.line}></View>
        </View>
    )
}

export default CardSub

const styles = StyleSheet.create({
    container:{
        paddingTop:5
    },
    wrap: {
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    texthead:{
        fontSize: 16,
        color: '#000',
        fontFamily:'TitilliumWeb-Bold'
    },
    text: {
        fontSize: 16,
        color: '#000',
        fontFamily:'TitilliumWeb-Regular'
    },
    line: {
        paddingTop:5,
        borderBottomWidth: StyleSheet.hairlineWidth
    }
})