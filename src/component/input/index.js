import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'

const Input = ({ input, ...rest }) => {
    return (
        <TextInput placeholder={input}
            multiline={true}
            placeholderTextColor={'#000'}
            style={{ color: '#000' }}
            {...rest}
        />
    )
}

export default Input

const styles = StyleSheet.create({

})