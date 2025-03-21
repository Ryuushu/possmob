import { StatusBar, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import Routes from './routes'
import { Provider } from 'react-redux'
import { store } from './redux'
import 'react-native-reanimated';
import { AlertNotificationRoot } from 'react-native-alert-notification'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider } from './ThemeContext'
import { en, id } from 'date-fns/locale';
import { registerTranslation } from 'react-native-paper-dates';
import { setupDatabase } from './service/db'

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    text: '#000',
  },
};

const App = () => {
  registerTranslation('id', {
    save: 'Simpan',
    selectSingle: 'Pilih tanggal',
    selectMultiple: 'Pilih beberapa tanggal',
    selectRange: 'Pilih rentang tanggal',
    notAccordingToDateFormat: (inputFormat) =>
      `Format tanggal harus ${inputFormat}`,
    mustBeHigherThan: (date) => `Harus lebih dari ${date}`,
    mustBeLowerThan: (date) => `Harus kurang dari ${date}`,
    mustBeBetween: (startDate, endDate) =>
      `Harus antara ${startDate} - ${endDate}`,
    typeInDate: 'Masukkan tanggal',
    typeInMonth: 'Masukkan bulan',
    typeInYear: 'Masukkan tahun',
    start: 'Mulai',
    end: 'Selesai',
    cancel: 'Batal',
    close: 'Tutup',
    pickDateFromCalendar: 'Pilih tanggal dari kalender', // Tambahkan ini
  });

  // Untuk bahasa Indonesia
  return (
    <Provider store={store} style={{ flex: 1 }}>

      <StatusBar backgroundColor={'#000080'} animated={true} barStyle="light-content" />
      <AlertNotificationRoot>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer theme={LightTheme} >
            <Routes />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AlertNotificationRoot>

    </Provider>

  )
}

export default App

const styles = StyleSheet.create({})