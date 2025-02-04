import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux'


const CartitemPembelian = ({ item }) => {
  // console.log(item)
  const dispatch = useDispatch()
  const currency = new Intl.NumberFormat('id-ID')

  // const onPressIncrement = () => {
  //   dispatch({ type: 'INCREMENT', value: item })
  // }
  // const onPressDecrement = () => {
  //   dispatch({ type: 'DECREMENT', value: item })
  // }
  const onPressRemove = () => {
    dispatch({ type: 'REMOVEpembelian', payload: item})
  }
  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.box2}>
          <View>
            {item.foto == null ?
              item.nama_produk.split(' ').length <= 1 ?
                <View style={styles.productImage}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>{item.nama_produk.slice(0, 1).toUpperCase() + item.nama_produk.slice(1, 2).toUpperCase()}</Text>
                </View> : <View style={styles.productImage}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ededed' }}>{item.nama_produk.split(' ')[0].slice(0, 1).toUpperCase() + item.nama_produk.split(' ')[1].slice(0, 1).toUpperCase()}</Text>
                </View> : <Image
                style={styles.productImage}
                source={{ uri: item.foto }}
              />
            }
            {/* <Image
                style={styles.productImage}
                source={{uri:'file://'+RNFS.DownloadDirectoryPath+'/dataimg/'+item.item.imgname}}
              /> */}
          </View>
          <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Text style={styles.title}>{item.nama_produk}</Text>
            <Text style={styles.attribute}>
              {'1pcs - ' + 'Rp. ' + currency.format(item.harga)}
            </Text>
            {item.stok != null ? <Text style={styles.attribute}>
              {'stok : ' + item.stok}
            </Text> : null}

            
          </View>
        </View>
        <View style={styles.deleteBtn}>
          <TouchableOpacity
            onPress={() => onPressRemove()}>
            <Text style={styles.option}>DELETE</Text>
            {/* <Icon name="trash-2" size={20} color={Color.red} /> */}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CartitemPembelian

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 10,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'TitilliumWeb-Bold',
    fontSize: 14,
    color: '#595959',
    textAlign: 'left',
    marginLeft: 20,
    marginRight: 10,
  },
  quantityCount: {
    fontFamily: 'TitilliumWeb-Regular',
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    marginRight: 10,
  },
  attribute: {
    fontFamily: 'TitilliumWeb-Regular',
    fontSize: 14,
    color: '#27AE60',
    textAlign: 'left',
    marginLeft: 20,
    marginRight: 10,

  },
  counter: {
    fontFamily: 'TitilliumWeb-Regular',
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    width: 30,
  },
  option: {
    fontFamily: 'TitilliumWeb-Regular',
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  productImage: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#656565',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: 70,
  },
  addToCart: {
    backgroundColor: '#27AE60',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 20,
  },
  quantity: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 33,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  quantitContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 6,
    marginLeft: 20,
  },

  addToCartText: {
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 20,
    paddingRight: 20,
    color: '#fff',
  },
  box2: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBtn: {
    padding: 10,
  },
  border: {
    borderBottomWidth: 1,
    borderColor: '#A29F9F',
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 999,
  },
})