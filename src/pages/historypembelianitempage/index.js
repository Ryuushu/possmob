import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { chillLogo } from '../../assets/image/logo';


moment.suppressDeprecationWarnings = true;
const HistoryPembelianItemPage = ({ route, navigation }) => {
  let fakturContainer = null;
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const currency = new Intl.NumberFormat('id-ID');
  const item = route.params.Item;
 

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <ScrollView>
        <View style={{ marginHorizontal: 14 }}>
          <ViewShot ref={(ref) => (fakturContainer = ref)}>
            <View style={{ backgroundColor: '#fff' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                }}>
                <View>
                  <Text style={{ color: '#000', fontFamily: 'InknutAntiqua-Regular' }}>
                    {item.item.id_transaksi_pembelian}
                  </Text>
                  <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Light' }}>

                    {moment(item.item.created_at).format('DD MMM yyyy HH:mm:ss')}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: '#000', fontFamily: 'InknutAntiqua-Regular' }}>
                    Rp.
                    {currency.format(item.item.totalharga)}
                  </Text>
                  <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Light' }}>
                    {item.item.user?.pemilik?.nama_pemilik || item.item.user?.pekerja?.nama_pekerja}
                  </Text>
                </View>
              </View>
              {/* <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold', paddingTop: 6, fontSize: 16 }}>Catatan :</Text>
              <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular', paddingTop: 4, paddingBottom: 16, fontSize: 14 }}>{Pesan}</Text> */}


              <View
                style={{
                  marginVertical: 12,
                  borderStyle: 'dashed',
                  borderBottomWidth: 1,
                  borderColor: '#C3C3C3',
                }}></View>
              <View
                style={{
                  backgroundColor: '#EEFFFC',

                  paddingVertical: 16,
                  borderRadius: 8,
                }}>
                <View style={{ marginHorizontal: 14 }}>
                  {item.item.detail_transaksi_pembelian.map((item, index) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 4,
                        }}
                        key={index}>
                        <View
                          style={{
                            flex: 1,
                            paddingVertical: 4,

                          }}>

                          <Text
                            style={{
                              color: '#000',
                              fontFamily: 'TitilliumWeb-Regular',
                            }}>

                            {item.produk.nama_produk}
                          </Text>
                          <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',


                          }}>
                            <View>
                              <Text
                                style={{
                                  color: '#000',
                                  fontFamily: 'TitilliumWeb-Regular',
                                }}>
                                {item.qty}x Rp.{currency.format(item.harga)}
                              </Text>
                            </View>
                            <View>
                              <Text
                                style={{ color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                                Rp.{currency.format(item.subtotal)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: '#000',
                      marginVertical: 12,
                    }}></View>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                      Total
                    </Text>
                    <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Bold' }}>
                      Rp.
                      {currency.format(item.item.totalharga)}
                    </Text>
                  </View>
                </View>
              </View>
              
            </View>
          </ViewShot>

          
        </View>
      </ScrollView>


      <Modal transparent={true} visible={modalVisibleLoading}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}>
          <ActivityIndicator size={100} color={'#44dfff'} />
        </View>
      </Modal>
    </View>
  );
};

export default HistoryPembelianItemPage;

const styles = StyleSheet.create({});
