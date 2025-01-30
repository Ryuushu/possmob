import { StatusBar, StyleSheet } from 'react-native'
import React from 'react'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import Routes from './routes'
import { Provider } from 'react-redux'
import { store } from './redux'
import 'react-native-reanimated';
import { AlertNotificationRoot } from 'react-native-alert-notification'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider } from './ThemeContext'


const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    text: '#000',
  },
};
const App = () => {

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