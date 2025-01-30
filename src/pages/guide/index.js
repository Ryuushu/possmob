import { Image, Linking, StyleSheet, Text, TouchableOpacity, View, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Swiper from 'react-native-swiper'
import Label from '../../component/label'
import Input from '../../component/input'
import { useDispatch, useSelector } from 'react-redux';
import { b1,b2,b3,b4,b5,satupng,duapng,tigapng,empatpng,apk1,apk2,apk3,apk4 } from '../../assets/image'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'



const GuidePage = ({navigation}) => {
  // const {code} = route.params
  const [indexcard, setIndexCard] = useState(0)
  const [form, setForm] = useState()
  const dispatch=useDispatch()
  const isFocused = useIsFocused()
  const cekReducer = useSelector(state=>state.cekReducer)


  const dataimgbp = [
    { imgname: b1, firsttext: "1.Buka Link Berikut :", secondtext: "https://docs.google.com/spreadsheets/u/0/", thirdtext: "2.Tekan Titik Tiga Dikanan Atas" },
    { imgname: b2, firsttext: "3.Tekan Situs Desktop", secondtext:"Lalu Login", thirdtext:null},
    { imgname: b3, firsttext: "\t\t4.Setelah Login", secondtext: "5.Buat Spreadsheets Baru", thirdtext: null },
    { imgname: b4, firsttext: "6.Tekan File > Share > Share With Other, Atau,", secondtext: "Tekan File > Bagikan > Bagikan Dengan\n\t\tOrang Lain", thirdtext: null },
    { imgname: b5, firsttext: "7.Tekan Restricted > Anyone With Link,atau ", secondtext: "Tekan Dibatasi > Siapa Yang memiliki link,", thirdtext: "\t\tLalu Done/Selesai Lalu Copas URL" }
  ]

  const dataimgapk = [
    { imgname: apk1, firsttext: "1.Jika Belum Memiliki Aplikasi Spreadsheets:", secondtext: "https://play.google.com/store/apps/details?id=com.google.android.apps.docs.editors.sheets", thirdtext: "2.Buka Link Berikut Dan Buat Spreadsheets Baru",fourthtext: "https://docs.google.com/spreadsheets/u/0/"},
    { imgname: apk2, firsttext: "3.Tekan Titik Tiga Dikanan Atas", secondtext: "Lalu Tekan Bagikan&Ekspor > Kelola Akses", thirdtext: null},
    { imgname: apk3, firsttext: "\t\t4.Tekan Ubah > Tekan Dibatasi>Ubah Ke Siapa\n\t\t\t\tSaja Yang Memiliki Link", secondtext: "", thirdtext: null },
    { imgname: apk4, firsttext: "6.Tekan Pelihat > Ubah Ke Editor", secondtext: "Lalu Tekan Icon Dikanan Atas", thirdtext: "\t\tLalu Kembali Ke Aplikasi Dan Paste",fourthtext: null }]

  const dataimgbd = [
    { imgname: b3, firsttext: "1.Buka Link Berikut Dan Login :", secondtext: "https://docs.google.com/spreadsheets/u/0/", thirdtext: "2.Buat Spreadsheets Baru", },
    { imgname: b4, firsttext: "3.Jika Sudah Membuat lalu Buka,", secondtext: "Tekan File > Share > Share With Other, Atau,", thirdtext: "\t\tTekan File > Bagikan > Bagikan Dengan\n\t\tOrang Lain" },
    { imgname: tigapng, firsttext: "\t\t4.Ganti Nama File (Optional)", secondtext: "5.Lalu Tekan Save", thirdtext: null },
    { imgname: b5, firsttext: "6.Tekan Restricted > Anyone With Link,atau ", secondtext: "Tekan Dibatasi > Siapa Yang memiliki link,", thirdtext: "\t\tLalu Done/Selesai Lalu Copas URL" }]

   

    const onPressTutorial=(code)=>{
      dispatch({type:"SET_CEK",value:true,code:code})
      setIndexCard(0)
    }

    const onInputChage=(value)=>{
      setForm(value)
    }
    const btnSubmit=()=>{
      
      if(form==null||form==undefined||form==""){
        Alert.alert(title="Error",message="Kolom Harus Di Isi")
      }
      else{
        const valuesplit = form.split("/")
        if(valuesplit.length<5){
          Alert.alert(title="Error ID Spreadsheets",message="Id Tidak Ditemukan")
          console.log("Id Tidak DItemukan")
        }else{
          AsyncStorage.setItem("TokenSheet",valuesplit[5])
          AsyncStorage.setItem("TokenSheetFull",form)
          navigation.replace('Routestack')
        }
      }
    }

    const kontenguide=()=>{
      return(
        <Swiper paginationStyle={{
          position: 'absolute',
          bottom: 0
        }}
          bounces={true}
          activeDotColor="#9B5EFF"
          activeDotStyle={{ width: 20, height: 8 }}
          loop={false}
          onIndexChanged={(i) => { setIndexCard(i) }}>

          {cekReducer.code=="BP"?
            dataimgbp.map((i) => {
            return (
              <View style={{ marginHorizontal: 20 }} key={i}>
                <Text style={styles.textsub}>{i.firsttext}</Text>
                {indexcard == 0 ? <TouchableOpacity onPress={() => Linking.openURL(i.secondtext)}><Text style={{ color: 'blue', fontSize: 17, marginVertical: 12 }}>{'\t\t' + i.secondtext}</Text></TouchableOpacity> : <Text style={styles.textsub}>{'\t\t' + i.secondtext}</Text>}
                <Text style={styles.textsub}>{i.thirdtext}</Text>
                <View style={styles.wrapimg}>
                  <Image source={i.imgname}  />
                </View>
              </View>
            )
          }):
          cekReducer.code=="APK"?
          dataimgapk.map((i) => {
            return (
              <View style={{ marginHorizontal: 20 }} key={i}>
                <Text style={styles.textsub}>{i.firsttext}</Text>
                {indexcard == 0 ? 
                <TouchableOpacity onPress={() => Linking.openURL(i.secondtext)}><Text style={{ color: 'blue',}}>{'\t\t'+i.secondtext}</Text></TouchableOpacity> : <Text style={styles.textsub}>{'\t\t' + i.secondtext}</Text>}
                <Text style={styles.textsub}>{i.thirdtext}</Text>
                {indexcard == 0 ? 
                <TouchableOpacity onPress={() => Linking.openURL(i.fourthtext)}><Text style={{ color: 'blue',}}>{'\t\t'+i.fourthtext}</Text></TouchableOpacity> : <Text style={styles.textsub}>{i.fourthtext}</Text>}


                <View style={styles.wrapimg}>
                  <Image source={i.imgname}  />
                </View>
              </View>
            )
          }):
          dataimgbd.map((i) => {
            return (
              <View style={{ marginHorizontal: 20 }} key={i}>
                <Text style={styles.textsub}>{i.firsttext}</Text>
                {indexcard == 0 ? <TouchableOpacity onPress={() => Linking.openURL(i.secondtext)}><Text style={{ color: 'blue', fontSize: 17, marginVertical: 12 }}>{'\t\t' + i.secondtext}</Text></TouchableOpacity> : <Text style={styles.textsub}>{'\t\t' + i.secondtext}</Text>}
                <Text style={styles.textsub}>{i.thirdtext}</Text>
                <View style={styles.wrapimg}>
                  <Image source={i.imgname}  />
                </View>
              </View>
            )
          })}
          
        </Swiper>
      )
    }

  const swipe = () => {
    return (
      <View style={{ height:'100%' }}>
        <View style={styles.header}>
          <Text style={styles.textheader}>Welcome To Chill </Text>
          <Text style={styles.textheader}>Point Of Sale</Text>
        </View>

        {kontenguide()}
        
        {indexcard == 4 ?
          <TouchableOpacity style={styles.btn} onPress={() => dispatch({type:"SET_CEK",value:false})}>
            <Text style={styles.textbtn}>Get Started</Text>
          </TouchableOpacity> : cekReducer.code=="APK"&& indexcard == 3||cekReducer.code=="BD"&& indexcard == 3?<TouchableOpacity style={styles.btn} onPress={() => dispatch({type:"SET_CEK",value:false})}>
            <Text style={styles.textbtn}>Get Started</Text>
          </TouchableOpacity>:<View style={styles.btn}><Text style={styles.textbtn}>Geser Ke Kanan {" >>"}</Text></View>}

      </View>
    )

  }
  const formd = () => {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#000', fontSize: 28, marginBottom: 40 }}>Setup Spredsheet</Text>
        <View style={styles.card}>
          <Text style={{ justifyContent: 'center', alignItems: 'center', color: '#000', fontSize: 18, textAlign: 'center', marginVertical: 20 }}>Silahkan Masukan{"\n"}SpreadsheetID Anda</Text>
          <View style={styles.warpcard}>
            <Label label={'SpreadsheetID'} />
            <Input input={'SpreadsheetID'} numberOfLines={4} onChangeText={(value)=>onInputChage(value)} value={form}/>
            <View style={styles.wrapbuttonsub}>
              <TouchableOpacity style={styles.button} onPress={()=>btnSubmit()}>
                <Text style={styles.buttontxt}>OK</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.buttonTutorial} onPress={() => onPressTutorial("BP")}>
              <Text style={styles.buttontxtTutorial}>Tutorial Get SpreadsheetID In Browser Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonTutorial} onPress={() => onPressTutorial("APK")}>
              <Text style={styles.buttontxtTutorial}>Tutorial Get SpreadsheetID In Aplikasi Google Spreadsheet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonTutorial,{marginBottom:24}]} onPress={() => onPressTutorial("BD")}>
              <Text style={styles.buttontxtTutorial}>Tutorial Get SpreadsheetID In Browser Desktop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )

  }
    const get= async()=>{
       const cek = await AsyncStorage.getItem('TokenSheet')
       if(cek){
        navigation.replace('Routestack')
       }
    }
  useEffect(()=>{
    get()
  },[isFocused])
  return (
    <View style={{ flex: 1 }}>
      {cekReducer.cek == false ?  formd():swipe()}
    </View>
  )
}

export default GuidePage
const DWidth = Dimensions.get('window').width;
const DHeight = Dimensions.get('window').height;


const styles = StyleSheet.create({

  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18
  },
  textheader: {
    fontSize: 24,
    color: '#000'
  },
  wrapimg: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
   
  },
  btn: {
    marginTop:14,
    padding: 18,
    backgroundColor: '#151B25',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  textbtn: {
    color: '#fff',
    fontSize: 17,
  },
  textsub: {
    color: '#000',
    fontSize: 16,
    marginVertical: 12
  },
  //FORM

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  card: {
    width: DWidth * 0.9,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 8,
  },
  warpcard: {
    marginHorizontal: DWidth * 0.05,

  },
  wrapbuttonsub: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: DWidth * 0.7,
    height: DHeight / 15,
    backgroundColor: '#151B250'
  },
  buttontxt: {
    color: '#fff',
    fontSize: 20,
  },
  buttonTutorial: {
    marginVertical: 8
  },
  buttontxtTutorial: {
    color: "blue",
    textDecorationLine: 'underline'

  }
})





