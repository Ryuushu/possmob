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
  let totalQty = 0;
  let totalHargaBeli = 0;

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
                  <Text style={{ color: '#000', fontFamily: 'TitilliumWeb-Light' }}>
                    {item.item.user?.pemilik?.nama_pemilik || item.item.user?.pekerja?.nama_pekerja}
                  </Text>
                </View>
              </View>
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 8,
                    }}>
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                        <Text
                          style={{
                            fontSize: 13,
                            flex: 2,
                            fontWeight: 'bold',
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Nama Produk
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 'bold',
                            flex: 1,
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Kuantitas
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 'bold',
                            marginHorizontal: 4,
                            flex: 1,
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Harga Beli
                        </Text>
                        <Text
                          style={{ fontSize: 13, fontWeight: 'bold', color: '#000', fontFamily: 'TitilliumWeb-Regular' }}>
                          Harga Jual
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.item.detail_transaksi_pembelian.map((item, index) => {
                    totalQty += item.qty;
                    totalHargaBeli += item.harga_beli * item.qty;

                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        key={index}>
                        <View
                          style={{
                            flex: 1,
                            paddingVertical: 2,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text
                              style={{
                                flex: 2,
                                color: '#000',
                                fontFamily: 'TitilliumWeb-Regular',
                              }}>
                              {item.produk.nama_produk}
                            </Text>
                            <Text
                              style={{
                                flex: 1,
                                color: '#000',
                                fontFamily: 'TitilliumWeb-Regular',
                              }}>
                              {item.qty}
                            </Text>
                            <Text
                              style={{
                                marginHorizontal: 4,
                                flex: 1,
                                color: '#000',
                                fontFamily: 'TitilliumWeb-Regular',
                              }}>
                              Rp.{currency.format(item.harga_beli)}
                            </Text>
                            <Text
                              style={{
                                color: '#000',
                                fontFamily: 'TitilliumWeb-Regular',
                              }}>
                              Rp.{currency.format(item.harga)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {/* Garis pemisah */}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: '#000',
                      marginVertical: 12,
                    }}
                  />

                  {/* Total Qty & Total Harga Beli */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        flex: 1,
                        paddingVertical: 2,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            flex: 2,
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Total
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          {totalQty}
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 4,
                            flex: 1,
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Rp.{currency.format(totalHargaBeli)}
                        </Text>
                        <Text
                          style={{
                            color: '#000',
                            fontFamily: 'TitilliumWeb-Regular',
                          }}>
                          Rp.{currency.format(item.item.totalharga)}
                        </Text>
                      </View>
                    </View>
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
