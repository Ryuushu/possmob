import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

const Cardcatalog = ({ item, oriented, status }) => {
  const isOutOfStock = item.is_stock_managed == 1 && item.stok == 0;
  const dispatch = useDispatch();
  const currency = new Intl.NumberFormat('id-ID');

  const TRXReducer = useSelector(state => state.TRXReducer);

  const setCart = (item, idpproduk, count, harga) => {
    let ids = '';
    // if (TRXReducer.id_produk == null) {
    //   ids = id_tensaksi;
    // } else {
    //   ids = TRXReducer.id_produk;
    // }

    let cart = {
      item: item,
      id: idpproduk,
      count: count,
      subTotal: harga,
    };
    dispatch({ type: 'CART', value: cart });
  };

  const setidproduk = (id) => {
    dispatch({ type: 'IDPRODUK', value: id });
  };

  const handdlebutton = () => {
    // const rawdate = new Date();
    // const date = moment(rawdate).format('DD-MM-YY').split('-');
    // const id_tensaksi =
    //   'TRX-' +
    //   date[0] +
    //   date[1] +
    //   date[2] +
    //   Math.floor(Math.random() * 1000000) + 1;
    // setidproduk(id_tensaksi);
    // console.log(item)
    // let idpproduk = item.kode_produk; // Assuming `idpproduk` is a field in the object
    // let harga = item.harga;
    // let count = 1;
    let cart = {
      item: item,
      id: item.kode_produk,
      count: 1,
      subTotal: item.harga,
      stok: item.stok
    };
    dispatch({ type: 'CART', value: cart })
    // setCart(item, idpproduk, count, harga);
  };

  return (
    <TouchableOpacity
      style={styles.wrapCard(oriented)}
      onPress={() => handdlebutton()}
      disabled={isOutOfStock}>
      <View style={styles.wrapImg(oriented)}>
        {item.url_img == null ? (
          item.nama_produk.split(' ').length <= 1 ? (
            <View
              style={{
                flex: 1,
                borderTopStartRadius: 6,
                borderTopEndRadiu: 6,

                backgroundColor: '#656565',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                {item.nama_produk.slice(0, 1).toUpperCase() +
                  item.nama_produk.slice(1, 2).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                borderRadius: 6,
                backgroundColor: '#656565',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>
                {item.nama_produk.split(' ')[0].slice(0, 1).toUpperCase() +
                  item.nama_produk.split(' ')[1].slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )
        ) : (
          <View style={{
            flex: 1,
            borderRadius: 6,
          }}>
            <Image
              source={{ uri: item.url_img }}
              style={styles.image}
            ></Image>
          </View>

        )}
      </View>


      {/* Overlay jika stok habis */}
      {isOutOfStock && (
        <View style={styles.overlay}>
          <Text style={styles.textOutOfStock}>Stok Habis</Text>
        </View>
      )}


      <View style={styles.wrapContentCard}>
        <Text style={styles.textTitle}>{item.nama_produk}</Text>
        <Text style={styles.textStok}>Kategori: {item.kategori.nama_kategori}</Text>
        {item.is_stock_managed == 1 ? <Text style={styles.textStok}>Stok: {item.stok}</Text> : null}

        <Text style={[styles.textHarga, isOutOfStock && { color: '#999' }]}>Rp. {currency.format(item.harga)}</Text>
      </View>
    </TouchableOpacity>

  );
};

export default Cardcatalog;

const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  wrapCard: (Oriented) => ({
    flex: 1,
    height: Oriented == 'portrait' ? Dheight * 0.33 : Dheight * 0.66,
    maxWidth: Oriented == 'portrait' ? Dwidth * 0.46 : Dwidth * 0.5,
    marginHorizontal: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#626262',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  }),
  wrapImg: (Oriented) => ({
    // width: Oriented == 'portrait' ? Dwidth * 0.455 : Dwidth * 0.48, 
    height: Oriented == 'portrait' ? Dheight * 0.2 : Dheight * 0.4,
    marginBottom: 4
  }),
  image: {
    flex: 1,
    // aspectRatio: 1.15,
    borderRadius: 6,
    // flex: 1,
  },
  wrapContentCard: {
    marginHorizontal: 6,
  },
  textTitle: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'TitilliumWeb-Bold',
  },
  textStok: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'TitilliumWeb-Light',
  },
  textHarga: {
    marginVertical: 8,
    color: '#000',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: 'TitilliumWeb-Regular',
  },
  initials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ededed',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  textOutOfStock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  outOfStock: {
    opacity: 0.6, // Membuat kartu tampak redup jika stok habis
  },
});
