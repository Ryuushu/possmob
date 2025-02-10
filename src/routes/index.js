import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Formkasir from '../pages/formkasir';
// import Dashboard from '../pages/dashboard';
import { useNavigation } from '@react-navigation/native';
import Cartpage from '../pages/cartpage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Iabout, Idiskon, Idrawer, Ihistory, Ihome, Ilist, Isexcel, Isprint, Ichart, Iscan } from '../assets/icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SetupPrinter from '../pages/setupprinter';
import CustomDrawer from '../component/customdrawer';
import FinalPage from '../pages/finalpage';
import Splashscreen from '../pages/splashscreen';
import HistoryPage from '../pages/historypage';
import HistoryItemPage from '../pages/historyitempage';
import LoginPage from '../pages/loginpage';
import ListKatalog from '../pages/listkatalogpage';
import FormEdit from '../pages/formeditkatalog';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import KategoriPage from '../pages/kategoripage';
import TokoPage from '../pages/tokopage';
import Home from '../pages/home';
import ListToko from '../pages/llisttoko';
import Formtoko from '../pages/formtoko';
import Formedittoko from '../pages/formedittoko';
import ListPekerjaPage from '../pages/listpekerjapage';
import KartuStokPage from '../pages/kartustokpage';
import DetailKartuStok from '../pages/detailkartustok';
import DetailOpname from '../detailopname';
import OpnamePage from '../pages/opnamepage';
import TransaksiPage from '../pages/transaksi';
import RegisterPage from '../pages/registerpage';
import Cardkartu from '../component/Cardkartu';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Profile from '../pages/profile';
import OtpVerificationScreen from '../pages/otpverification';
import ResetPasswordScreen from '../pages/resetpassword';
import ForgotPasswordScreen from '../pages/forgotpasswordscreen';
import SetupnewPrinter from '../pages/setupnewprinter';
import TransaksiPembelianBaru from '../pages/transaksipembelianbaru';
import HistoryPembelianItemPage from '../pages/historypembelianitempage';
import HistoryPembelianPage from '../pages/historypembelianpage';

const Routes = ({ navigation }) => {
  const Stack = createNativeStackNavigator();
  const navigations = useNavigation();
  const Drawer = createDrawerNavigator()
  const Tab = createMaterialTopTabNavigator();
  const BtmTab = createBottomTabNavigator();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cek, setCek] = useState(false)
  const get = async () => {
    const cek = await AsyncStorage.getItem('TokenSheet')
    if (cek) {
      setCek(true)
    }
  }

  useEffect(() => {
    get()
  }, [])
  const Routestack = () => {
    return (
      <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />} screenOptions={{ drawerLabelStyle: { fontFamily: 'TitilliumWeb-Bold' } }}>
        <Drawer.Screen name='home' component={Home} options={({ navigation }) => ({
          drawerIcon: ({ focused, size }) => (<Ihome />),
          title: 'Dashboard', headerStyle: {
            backgroundColor: '#000080',
          }, headerTitleStyle: { color: '#fff' }, headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 }}>
              <Idrawer />
            </TouchableOpacity>
          ),
        })} />
        <Drawer.Screen name='listtoko' component={ListToko} options={({ navigation }) => ({
          drawerIcon: ({ focused, size }) => (<Ihome />),
          title: 'Daftar Toko', headerStyle: {
            backgroundColor: '#000080',

          }, headerTitleStyle: { color: '#fff' }, headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 }}>
              <Idrawer />
            </TouchableOpacity>
          ),
        })} />
        {/* <Drawer.Screen name='dashboard' component={Dashboard} options={({ navigation }) => ({
          drawerIcon: ({ focused, size }) => (<Ihome />),
          title: 'Transaksi', headerStyle: {
            backgroundColor: '#000080',
           
          },headerTitleStyle:{ color:'#fff'}, headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 }}>
              <Idrawer />
            </TouchableOpacity>
          ), 
        })} /> */}
        {/* <Drawer.Screen name='listkatalog' component={ListKatalog} options={{ title: 'Produk', drawerIcon: ({ focused, size }) => (<Ilist />) }} /> */}
        <Drawer.Screen name='kategori' component={KategoriPage} options={({ navigation }) => ({
          drawerIcon: ({ focused, size }) => (<Ihome />),
          title: 'Kategori', headerStyle: {
            backgroundColor: '#000080',

          }, headerTitleStyle: { color: '#fff' }, headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 }}>
              <Idrawer />
            </TouchableOpacity>
          ),
        })} />
        {/* <Drawer.Screen name='toko' component={TokoPage} options={{ title: 'Toko', drawerIcon: ({ focused, size }) => (<Ilist />) }} /> */}

        {/*   */}
        {/* <Drawer.Screen name='diskonpage' component={DiskonPage} options={{ title: 'Diskon', drawerIcon: ({ focused, size }) => (<Idiskon />) }} /> */}
        {/* <Drawer.Screen name='pengeluaranpage' component={PengeluaranPage} options={{ title: 'Pengeluaran', drawerIcon: ({ focused, size }) => (<Ilist />) }} /> */}
        {/* <Drawer.Screen name='toptab' component={Toptab} options={{ headerShown: false, title: 'Statistik', drawerIcon: ({ focused, size }) => (<Ichart />) }} /> */}
        {/* <Drawer.Screen name='setupage' component={Setupage} options={{ title: 'Setup Spreedsheet', headerShown: false, drawerIcon: ({ focused, size }) => (<Isexcel />) }} /> */}
        <Drawer.Screen name='SetupPrinter' component={SetupPrinter} options={{ title: 'Setup Printer', headerShown: false, drawerIcon: ({ focused, size }) => (<Isprint />) }} />
        {/* <Drawer.Screen name='aboutpage' component={AboutPage} options={{ title: 'About', headerShown: false, drawerIcon: ({ focused, size }) => (<Iabout />) }} /> */}
      </Drawer.Navigator>
    )
  }


  const Tabkartustok = ({ route }) => {
    const { item } = route.params;
    return (
      <Tab.Navigator screenOptions={{
        tabBarScrollEnabled: true,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray', // Enable scroll for tabs
      }}>
        <Tab.Screen name="Semua" component={Cardkartu} initialParams={{ item, type: 'all' }} />
        <Tab.Screen name="Masuk" component={Cardkartu} initialParams={{ item, type: 'masuk' }} />
        <Tab.Screen name="Keluar" component={Cardkartu} initialParams={{ item, type: 'keluar' }} />
        <Tab.Screen name="Penyesuaian" component={Cardkartu} initialParams={{ item, type: 'penyesuaian' }} />
      </Tab.Navigator>
    )
  }

  const BottomTabNavigator = ({ route }) => {
    const { user } = route.params;
    const pekerjaData = user?.pekerja || {};
    if (user?.role == "pemilik") {
      return (

        <BtmTab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              // position: 'absolute',
              // backgroundColor: 'rgba(255, 255, 255, 0.2)',
              // borderRadius: 20,
              // marginBottom: 10,
              // marginHorizontal: 20,
              height: 60,

              // elevation: 5,
            },
            // tabBarShowLabel: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'account' : 'account-outline';
              }
              return <Icon name={iconName} size={28} color={focused ? '#3498db' : '#7f8c8d'} />;
            },
          })}
        >
          <BtmTab.Screen name="Home" component={Home} />
          <BtmTab.Screen name="Profile" component={Profile} />
        </BtmTab.Navigator>
      );
    } else {
      return (
        <BtmTab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              // position: 'absolute',
              // backgroundColor: 'rgba(255, 255, 255, 0.2)',
              // borderRadius: 20,
              // marginBottom: 10,
              // marginHorizontal: 20,
              height: 60,
              
              // elevation: 5,
            },
            // tabBarShowLabel: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'transaksi') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'account' : 'account-outline';
              }
              return <Icon name={iconName} size={28} color={focused ? '#3498db' : '#7f8c8d'} />;
            },
          })}
        >
          <BtmTab.Screen name="transaksi" component={TransaksiPage} initialParams={{ data: pekerjaData }} />
          <BtmTab.Screen name="Profile" component={Profile} />
        </BtmTab.Navigator>
      );
    }

  };

  return (
    <Stack.Navigator >
      <Stack.Screen name='splashscreen' component={Splashscreen} options={{ headerShown: false }} />
      <Stack.Screen name='loginpage' component={LoginPage} options={{ headerShown: false }} />
      {/* {!cek ? <Stack.Screen name='GuidePage' component={GuidePage} options={{ headerShown: false }} /> : null} */}
      <Stack.Screen name='Routestack' component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='formkasir' component={Formkasir} options={{ title: 'Tambah Katalog', headerShown: false }} />
      <Stack.Screen name='formaddtoko' component={Formtoko} options={{ title: 'Tambah Toko', headerShown: false }} />
      <Stack.Screen name='formedittoko' component={Formedittoko} options={{ title: 'Ubah Toko', headerShown: false }} />
      <Stack.Screen name='tokopage' component={TokoPage} options={({ navigation, route }) => ({
        title: 'Detail Toko',
        headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('formedittoko', { data: route.params?.data }) // pass tokoId from route
            }
          >
            <Text style={{ fontSize: 24, paddingRight: 10, color: "#000" }}>☰</Text>
          </TouchableOpacity>
        ),
      })} />
      {/* <Stack.Screen name='camscan' component={Camscan} options={{}} /> */}
      {/* <Stack.Screen name='setupage' component={Setupage} /> */}
      <Stack.Screen name='cartpage' component={Cartpage} options={{ title: 'Keranjang' }} />
      <Stack.Screen name='historyitempage' component={HistoryItemPage} options={{ title: 'Detail Riwayat Penjualan' }} />
      <Stack.Screen name='historypage' component={HistoryPage} options={{ title: 'Riwayat Transaksi Penjualan' }} />
      <Stack.Screen name='historypembelianitempage' component={HistoryPembelianItemPage} options={{ title: 'Detail Riwayat Pembelian' }} />
      <Stack.Screen name='historypembelianpage' component={HistoryPembelianPage} options={{ title: 'Riwayat Transaksi Pembelian' }} />
      {/* <Stack.Screen name='formdiskon' component={FormDiskon} options={{ title: 'Tambah Diskon' }} /> */}
      <Stack.Screen name='formedit' component={FormEdit} options={{ title: 'Ubah Produk' }} />
      <Stack.Screen name='finalpage' component={FinalPage} options={{ headerShown: false }} />
      <Stack.Screen name='listkatalog' component={ListKatalog} options={{title: 'Daftar Produk', headerShown: true }} />
      <Stack.Screen name='listpekerja' component={ListPekerjaPage} options={{title: 'Daftar Pekerja', headerShown: true }} />
      <Stack.Screen name='listtoko' component={ListToko} options={{title: 'Daftar Toko', headerShown: true }} />
      <Stack.Screen name='setupprinter' component={SetupPrinter} options={{ headerShown: true }} />
      <Stack.Screen name='setupnewprinter' component={SetupnewPrinter} options={{ headerShown: true }} />
      <Stack.Screen name='kategoripage' component={KategoriPage} options={{title: 'Daftar Kategori', headerShown: true }} />


      <Stack.Screen name='transaksi' component={TransaksiPage} options={{title: 'Penjualan', headerShown: true }} />
      <Stack.Screen name='kartustok' component={KartuStokPage} options={{title: 'Kartu Stok', headerShown: true }} />
      <Stack.Screen name='detailkartustok' component={DetailKartuStok} options={{title: 'Detail Kartu Stok', headerShown: true }} />
      <Stack.Screen name='detailopname' component={DetailOpname} options={{title: 'Detail Stok Opname', headerShown: true }} />
      <Stack.Screen name='opnamepage' component={OpnamePage} options={{title: 'Stok Opname', headerShown: true }} />
      <Stack.Screen name='regis' component={RegisterPage} options={{ headerShown: false }} />
      <Stack.Screen name='tabkartu' component={Tabkartustok} options={({ route }) => ({
        title: 'Kartu Stok',
        headerShown: true,
        title: route.params?.item.nama_produk || 'Default Title', // Use the route parameter for title
      })} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name='transaksipembelian' component={TransaksiPembelianBaru} options={{title: 'Transaksi', headerShown: true }} />

    </Stack.Navigator>

  )
}

export default Routes

const styles = StyleSheet.create({})