import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import moment from 'moment';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import ViewShot, {captureRef} from 'react-native-view-shot';
import Share from 'react-native-share';
import { Print } from '../../service/print';

moment.suppressDeprecationWarnings = true;
const HistoryItemPage = ({route, navigation}) => {
  let fakturContainer = null;
  const [modalVisibleLoading, setModalVisibleLoading] = useState(false);
  const currency = new Intl.NumberFormat('id-ID');
  const item = route.params.Item;

  const onPressprint = async () => {
    // console.log()
    try {
      // await BluetoothEscposPrinter.printPic64(chillLogo, { width: 200, height: 150 });

      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [33],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['\x1B\x61\x01' + item.item.toko.nama_toko],
        {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 2, // lebar font 2x
          heigthtimes: 2, // tinggi font 2x
          fonttype: 0, // jenis font
        },
      );
      await BluetoothEscposPrinter.setBlob(0);

      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [item.item.toko.alamat_toko],
        {},
      );
      if (item.item.toko.whatsapp != null && item.item.toko.whatsapp != '') {
        await BluetoothEscposPrinter.printColumn(
          [32],
          [BluetoothEscposPrinter.ALIGN.CENTER],
          ['Telp/wa : ' + item.item.toko.whatsapp],
          {},
        );
      }
      if (item.item.toko.instagram != null && item.item.toko.instagram != '') {
        await BluetoothEscposPrinter.printColumn(
          [32],
          [BluetoothEscposPrinter.ALIGN.CENTER],
          ['Instagram : ' + item.item.toko.instagram],
          {},
        );
      }
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [item.item.id_transaksi],
        {},
      );
      // await BluetoothEscposPrinter.printColumn(
      //   [9, 24],
      //   [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      //   ['', item.item.id_transaksi],
      //   {},
      // );
      await BluetoothEscposPrinter.printColumn(
        [10, 22],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [
          'Tanggal',
          moment(item.item.created_at).format('DD MMM yyyy HH:mm:ss'),
        ],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [10, 22],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [
          'Kasir',
          item.item.user?.pemilik?.nama_pemilik ||
            item.item.user?.pekerja?.nama_pekerja,
        ],
        {},
      );

      await BluetoothEscposPrinter.printColumn(
        [17, 15],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Jenis Pembayaran', item.item.jenis_pembayaran],
        {},
      );

      await BluetoothEscposPrinter.printColumn(
        [11, 10, 11],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['==========', 'Pesanan', '=========='],
        {},
      );
      // CartReducer.cartitem.map(async(items,index)=>{

      for (const element of item.item.detail_transaksi) {
        const product = element.produk;
        const quantity = element.qty;
        const pricePerUnit = element.harga;
        const subtotal = quantity * pricePerUnit;
        const formattedSubtotal = 'Rp.' + currency.format(subtotal);
        await BluetoothEscposPrinter.setBlob(3);
        await BluetoothEscposPrinter.printColumn(
          [32],
          [BluetoothEscposPrinter.ALIGN.LEFT],
          [product.nama_produk],
          {},
        );
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            `${quantity}x Rp.${currency.format(pricePerUnit)}`,
            formattedSubtotal,
          ],
          {},
        );
      }
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [
          'Subtotal',
          'Rp.' +
            currency
              .format(
                item.item.detail_transaksi.reduce(
                  (result, item) => item.subtotal + result,
                  0,
                ),
              )
              .toString(),
        ],
        {},
      );
      item.item.ppn != 0 && item.item.ppn != '' && item.item.ppn != null
        ? await BluetoothEscposPrinter.printColumn(
            [16, 16],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Ppn', item.item.ppn.toString() + '%'],
            {},
          )
        : null;
      item.item.ppn != '' && item.item.ppn != 0 && item.item.ppn != null
        ? await BluetoothEscposPrinter.printColumn(
            [16, 16],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['PPN', 'Rp.' + currency.format(item.item.bulatppn)],
            {},
          )
        : null;

      // Diskon
      item.item.valuediskon != '' &&
      item.item.valuediskon != 0 &&
      item.item.valuediskon != null
        ? await BluetoothEscposPrinter.printColumn(
            [16, 16],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            [
              'Diskon',
              item.item.tipediskon == 'nominal'
                ? 'Rp.' + currency.format(item.item.valuediskon)
                : item.item.valuediskon.toString() + '%',
            ],
            {},
          )
        : null;
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Total', 'Rp.' + currency.format(item.item.totalharga).toString()],
        {},
      );
      await BluetoothEscposPrinter.setBlob(0);

      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Tunai', 'Rp.' + currency.format(item.item.pembayaran).toString()],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Kembalian', 'Rp.' + currency.format(item.item.kembalian).toString()],
        {},
      );
      await BluetoothEscposPrinter.printText(
        '================================',
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['"' + 'Terimakasih Atas Kunjungannya' + '"'],
        {},
      );
      await BluetoothEscposPrinter.printText('\r\n', {});
    } catch (e) {
      alert(e.message || 'ERROR');
    }
  };
  const onPressKirim = async () => {
    if (fakturContainer) {
      try {
        const uri = await captureRef(fakturContainer, {
          format: 'png',
          quality: 0.9,
          result: 'data-uri',
        });
        shareImageViaWhatsApp(uri);
      } catch (error) {
        console.log('Gagal mengambil tangkapan layar faktur:', error);
      }
    }
  };
  const shareImageViaWhatsApp = async base64Data => {
    const shareOptions = {
      // url: `data:image/png;base64,${base64Data}`,
      url: base64Data,
      failOnCancel: false,
      social: Share.Social.WHATSAPP,
    };

    try {
      await Share.shareSingle(shareOptions);
    } catch (error) {
      console.log('Gagal membagikan gambar:', error);
    }
  };

  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      <ScrollView>
        <View style={{marginHorizontal: 14}}>
          <ViewShot ref={ref => (fakturContainer = ref)}>
            <View style={{backgroundColor: '#fff'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                }}>
                <View>
                  <Text
                    style={{
                      color: '#000',
                      fontFamily: 'InknutAntiqua-Regular',
                    }}>
                    {item.item.id_transaksi}
                  </Text>
                  <Text
                    style={{color: '#000', fontFamily: 'TitilliumWeb-Light'}}>
                    {moment(item.item.created_at).format(
                      'DD MMM yyyy HH:mm:ss',
                    )}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: '#000',
                      fontFamily: 'InknutAntiqua-Regular',
                    }}>
                    Rp.
                    {currency.format(item.item.totalharga)}
                  </Text>
                  <Text
                    style={{color: '#000', fontFamily: 'TitilliumWeb-Light'}}>
                    {item.item.user?.pemilik?.nama_pemilik ||
                      item.item.user?.pekerja?.nama_pekerja}
                  </Text>
                </View>
              </View>

              <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Light'}}>
                Jenis Pembayaran : {item.item.jenis_pembayaran}
              </Text>
              <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Light'}}>
                Nama Toko : {item.item.toko.nama_toko}
              </Text>
              <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Light'}}>
                Alamat Toko : {item.item.toko.alamat_toko}
              </Text>
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
                <View style={{marginHorizontal: 14}}>
                  {item.item.detail_transaksi.map((item, index) => {
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
                          <View
                            style={{
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
                                style={{
                                  color: '#000',
                                  fontFamily: 'TitilliumWeb-Regular',
                                }}>
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
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                      Subtotal
                    </Text>
                    <Text
                      style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                      Rp.
                      {currency.format(
                        item.item.detail_transaksi.reduce(
                          (result, item) => item.subtotal + result,
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                  {item.item.ppn != 0 &&
                  item.item.ppn != '' &&
                  item.item.ppn != null ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          color: '#000',
                          fontFamily: 'TitilliumWeb-Bold',
                        }}>
                        Ppn
                      </Text>
                      <Text
                        style={{
                          color: '#000',
                          fontFamily: 'TitilliumWeb-Bold',
                        }}>
                        {item.item.ppn}%
                      </Text>
                    </View>
                  ) : null}
                  {item.item.valuediskon != 0 &&
                  item.item.valuediskon != '' &&
                  item.item.valuediskon != null ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          color: '#000',
                          fontFamily: 'TitilliumWeb-Bold',
                        }}>
                        Diskon
                      </Text>
                      <Text
                        style={{
                          color: '#000',
                          fontFamily: 'TitilliumWeb-Bold',
                        }}>
                        {item.item.tipediskon == 'nominal'
                          ? 'Rp.' + currency.format(item.item.valuediskon)
                          : item.item.valuediskon + '%'}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                      Total
                    </Text>
                    <Text
                      style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                      Rp.
                      {currency.format(item.item.totalharga)}
                    </Text>
                  </View>
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
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 14,
                }}>
                <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                  Tunai
                </Text>
                <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                  Rp.{currency.format(item.item.pembayaran)}
                </Text>
              </View>
              <View
                style={{
                  marginBottom: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 14,
                }}>
                <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                  Kembalian
                </Text>
                <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                  Rp.{currency.format(item.item.kembalian)}
                </Text>
              </View>
            </View>
          </ViewShot>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginBottom: 18,
              marginHorizontal: 26,
            }}>
            <TouchableOpacity
              onPress={() => Print(route.params.Item.item)}
              style={{
                flex: 1,
                borderWidth: 1,
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                marginRight: 12,
              }}>
              <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                Cetak
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressKirim()}
              style={{
                flex: 1,
                borderWidth: 1,
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                marginLeft: 12,
              }}>
              <Text style={{color: '#000', fontFamily: 'TitilliumWeb-Bold'}}>
                Kirim
              </Text>
            </TouchableOpacity>
          </View>
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

export default HistoryItemPage;

const styles = StyleSheet.create({});
