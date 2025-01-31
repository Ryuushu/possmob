import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Printer, PrintersDiscovery, usePrintersDiscovery, } from 'react-native-esc-pos-printer';
import { BluetoothManager } from 'react-native-esc-pos-printer';
const SetupnewPrinter = () => {
    const { start, printerError,isDiscovering, printers } = usePrintersDiscovery();

    useEffect(() => {
        if (printers.length > 0) {
          console.log('Printers found:', printers);
        }
      }, [printers]);
    return (
        <View>
          <Button title={isDiscovering ? "Searching..." : "Search Printers"} onPress={start} />
      {printers.length > 0 ? (
        printers.map((printer, index) => (
          <Text key={index}>{printer.deviceName}</Text>
        ))
      ) : (
        <Text>No printers found</Text>
      )}
      {printerError ? (
                <Text style={styles.errorText}>{printerError.message}</Text>
            ) : null}
        </View>
    )
}

export default SetupnewPrinter

const styles = StyleSheet.create({})