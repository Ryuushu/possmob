import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { React, useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  const [tokoList, setTokoList] = useState([]);
  const [UserData, setUserData] = useState([]);
  const onPressadd = async () => {
    navigation.navigate('formaddtoko')
  };
  const onPresstoko = (item) => {
    navigation.navigate('tokopage', { data: item });
  };
  useFocusEffect(
    useCallback(() => {
      get()
    }, [])
  );
  const get = async () => {

    const datasession = await AsyncStorage.getItem('datasession');
    setUserData(JSON.parse(datasession).user)
    try {
      // setModalVisibleLoading(true);
      const token = await AsyncStorage.getItem('tokenAccess');
      const res = await axios.get(`${BASE_URL}/toko`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTokoList(res.data.data);
      // setModalVisibleLoading(false);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        alert(error.message);
        setRefreshing(false);
      } else if (error.request) {
        console.log(error.request);
        alert(error.message);
        setRefreshing(false);
      } else {
        console.log('Error', error.message);
        alert(error.message);
        setRefreshing(false);
      }
    };
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{UserData.role}</Text>
        <Text style={styles.cardValue}>Email: {UserData.email}</Text>
      </View>


      <View style={styles.headerContainer}>
        <Text style={styles.header}>Daftar Toko</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => onPressadd()} >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {tokoList.map((toko) => (
        <TouchableOpacity key={toko.id_toko} style={styles.tokoItem} onPress={() => onPresstoko(toko)}>
            <View style={{flexDirection:'row'}}>
                  <View>
                    {toko.url_img == undefined ? (
                      toko.nama_toko.split(' ').length <= 1 ? (
                        <View
                          style={{
                            borderBottomLeftRadius: 6,
                            backgroundColor: '#626262',
                            borderTopLeftRadius: 6,
                            height: 80,
                            width: 80,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                            {toko.nama_toko.slice(0, 1).toUpperCase() +
                              toko.nama_toko.slice(1, 2).toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            borderBottomLeftRadius: 6,
                            backgroundColor: '#626262',
                            borderTopLeftRadius: 6,
                            height: 80,
                            width: 80,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                            {toko.nama_toko.split(' ')[0].slice(0, 1).toUpperCase() +
                              toko.nama_toko.split(' ')[1].slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )
                    ) : (
                      <Image source={{ uri: toko.url_img }} style={styles.image}></Image>
                    )}
                  </View>
                  <View style={{marginLeft:6,justifyContent:'center'}}>
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize:16}}>{toko.nama_toko}</Text>
                    <Text style={{ color: '#000' }}>{toko.alamat_toko}</Text>
                  </View>
                </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
    height: 80,
    // width: 80,
     aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: '',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#000"
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#000"
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: "#000"
  },
  tokoItem: {
    backgroundColor: '#fff',

    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tokoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#000"
  },
  tokoAlamat: {
    fontSize: 18,
    color: "#000"
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

});
export default Home;