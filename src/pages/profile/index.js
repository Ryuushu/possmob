import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config';

const Profile = () => {
    const navigations = useNavigation()
    const [user, setUser] = useState("")
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
    const get = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('datasession');
            if (!storedUser) {
                console.log('datasession tidak ditemukan');
                return;
            }

            const userData = JSON.parse(storedUser);
            setUser(userData || {});

        } catch (error) {
            console.error('Error mengambil data session:', error);
        }
    };
    useFocusEffect(
        useCallback(() => {
            get()
        }, [])
    );
    return (
        <View style={styles.profileContainer}>
            {/* <Image
                source={{ uri: 'https://i.pravatar.cc/150' }}
                style={styles.profileImage}
            /> */}
            <Text style={styles.profileName}>{user?.pemilik?.nama_pemilik || user?.pekerja?.nama_pekerja || 'Nama tidak tersedia'}</Text>
            <Text style={styles.profileDesc}>{user?.email || 'Email tidak tersedia'} | {user?.role || 'Role tidak tersedia'}</Text>
            {user.role == "pemilik" ? <TouchableOpacity style={styles.menuCard} onPress={() => navigations.navigate('listtoko')}>
                <Icon name="storefront-outline" size={24} color="#3498db" />
                <Text style={styles.menuText}>Daftar Toko</Text>
            </TouchableOpacity> : null}

            <TouchableOpacity style={styles.menuCard} onPress={() => navigations.navigate('setupprinter')}>
                <Icon name="printer-settings" size={24} color="#3498db" />
                <Text style={styles.menuText}>Setup Printer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuCard, { backgroundColor: '#e74c3c' }]} onPress={() => Logout()}>
                <Icon name="logout" size={24} color="#fff" />
                <Text style={[styles.menuText, { color: '#fff' }]}>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3498db',
    },
    tabBarStyle: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        marginBottom: 10,
        marginHorizontal: 20,
        height: 60,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    profileContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    profileDesc: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#ecf0f1',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    menuText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 10,
    },
})