import {Image, StyleSheet, Text, View,TouchableOpacity} from 'react-native';
import React,{ useEffect,useState } from 'react';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  Menu, Divider, Provider
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ihistory } from '../../assets/icon';
import axios from 'axios';
import BASE_URL from '../../../config';
import { useNavigation } from '@react-navigation/native';


const CustomDrawer = props => {
  const [user,setUser] = useState({})
  const [isTokoDropdownOpen, setIsTokoDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const navigations = useNavigation(); 
  const Logout = async () => {
    try {
      const token = await AsyncStorage.getItem('tokenAccess');
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
  
      await AsyncStorage.removeItem('tokenAccess');
      navigations.replace('loginpage'); 
  
    } catch (e) {
      console.error('Logout error:', e);
    }
  }
  
  const get=async()=>{
//     const user= JSON.parse(await AsyncStorage.getItem('usergooglesignin'))
// setUser(user)
  }
  useEffect(()=>{
    get()
  },[])
  return (
    <View style={{flex:1}}>
   
        {/* <View style={{height:150,justifyContent:'center',backgroundColor:'#000080'}}>
          <View style={{alignItems:'center',flexDirection:'row'}}> */}
          {/* <Image source={{uri:user.photo}} style={{height:65,width:65,borderRadius:50,marginLeft:12}}/> */}
          {/* <View style={{marginLeft:12}}> */}
          {/* <Text style={{color:'#fff',fontSize:18,fontFamily:'TitilliumWeb-Bold'}}>{user.name}</Text> */}
          {/* <Text style={{color:'#fff',fontSize:14,fontFamily:'TitilliumWeb-Regular'}}>{user.email}</Text> */}
          
          {/* </View>
          
          </View>
         

        </View> */}
        

        <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
        label={"Logout"}
          onPress={Logout}
        />
        </DrawerContentScrollView>
      
      <View style={{alignItems:'center',backgroundColor:'#151B25'}}>
        <Text style={{color:'#fff',marginTop:8,fontWeight:'500',fontFamily:'TitilliumWeb-Bold'}}>Create By Me</Text>
        <Text style={{color:'#fff',marginBottom:8,fontWeight:'500',fontFamily:'TitilliumWeb-Bold'}}>Copyright@2022</Text>
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
 header: {
    height: 150,
    justifyContent: 'center',
    backgroundColor: '#000080',
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileImage: {
    height: 65,
    width: 65,
    borderRadius: 50,
    marginLeft: 12,
  },
  textContainer: {
    marginLeft: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'TitilliumWeb-Bold',
  },
  userEmail: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'TitilliumWeb-Regular',
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  dropdownContainer: {
    backgroundColor: '#f5f5f5',
    marginLeft: 20,
    marginTop: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingLeft: 30,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#151B25',
    paddingVertical: 10,
  },
});
