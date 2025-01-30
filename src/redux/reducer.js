import {
    combineReducers
} from "redux"
const initialStateidtrx = {
    id_produk: null,
}
const TRXReducer = (state = initialStateidtrx, action) => {
    if (action.type == "RMIDPRODUK") {
        return {
            id_produk: action.value
        }
    }
    if (action.type == "IDPRODUK") {
        if (state.id_produk == null) {
            return {
                id_produk: action.value
            }
        }
        else {
            return {
                id_produk: state.id_produk
            }
        }
    }
    return state
}
const initialStateDiskon = {
    nama_diskon: '',
    diskon: '',

}
const DiskonReducer = (state = initialStateDiskon, action) => {
    if (action.type == "DISKON") {
        return {
            nama_diskon: action.valuenama,
            diskon: action.valuediskon
        }
    }
    return state
}
const initialStateTunai = {
    nominal: null,
}
const TunaiReducer = (state = initialStateTunai, action) => {
    if (action.type == "NOMINAL") {
        return {
            nominal: action.value
        }
    }
    return state
}
const initialStateCart = {
    cartitem: [],
}
const CartReducer = (state = initialStateCart, action) => {

    if (action.type == 'CART') {
        // console.log(state.cartitem)
        const isInCart = state.cartitem.some(item => item.id === action.value.id);

        if (isInCart) {
            return {
                ...state,
                cartitem: state.cartitem.map(
                    item => item.id === action.value.id ? {
                        ...item,
                        count: item.count + 1
                    } : item
                )
            }
        }
        return {
            ...state,
            cartitem: [...state.cartitem, action.value]
        }
    }
    if (action.type == 'INCREMENT') {
        return {
            ...state,
            cartitem: state.cartitem.map(
                item => item.id === action.value.id ? {
                    ...item,
                    count: item.count + 1
                } : item
            )
        }
    }
    if (action.type == 'DECREMENT') {
        const item = state.cartitem.find(item => item.id === action.value.id)
        if (item?.count === 1) {
            return {
                ...state,
                cartitem: state.cartitem.filter(item => item.id !== action.value.id),
            };
        }
        return {
            ...state,
            cartitem: state.cartitem.map(
                item => item.id === action.value.id
                    ? {
                        ...item,
                        count: item.count - 1
                    }
                    : item
            ),
        };
    }
    if (action.type == "REMOVE") {
        return {
            ...state,
            cartitem: state.cartitem.filter(
                (item) => item.id !== action.value.id
            ),
        };
    }
    if (action.type == "REMOVEALL") {
        return {
            ...state,
            cartitem: []
        };
    }
    return state
}


const inistialStateForm = {
    form: {
        namaproduk: null,
        hargaproduk: null,
        kategoriproduk: null,
        stokproduk: null,
        idkategori: 0,
        namakategori: null
    },
}

const FormReducer = (state = inistialStateForm, action) => {
    if (action.type === 'SET_FORM') {
        return {
            ...state,
            form: {
                ...state.form,
                [action.inputType]: action.inputValue
            }
        }
    }
    if (action.type === 'RM_FORM') {
        return {
            form: {
                namaproduk: null,
                hargaproduk: null,
                kategoriproduk: null,
                stokproduk: null,
                idkategori: 0,
                namakategori: null
            }
        }
    }
    return state
}
const inistialStateCek = {
    cek: false,
    code: "ssd"

}
const cekReducer = (state = inistialStateCek, action) => {
    if (action.type === 'SET_CEK') {
        return {
            ...state,
            cek: action.value,
            code: action.code
        }
    }
    return state
}

const inistialStateFormToko = {
    form: {
        namatoko: null,
        alamattoko: null,
        whatsapp: null,
        instagram: null
    },
}

const FormTokoReducer = (state = inistialStateFormToko, action) => {
    if (action.type === 'SET_FORM') {
        return {
            ...state,
            form: {
                ...state.form,
                [action.inputType]: action.inputValue
            }
        }
    }
    if (action.type === 'RM_FORM') {
        return {
            form: {
                namatoko: null,
                alamattoko: null,
                whatsapp: null,
                instagram: null
            }
        }
    }
    return state
}


const reducer = combineReducers({
    FormReducer,
    CartReducer,
    cekReducer,
    TRXReducer,
    TunaiReducer,
    DiskonReducer,
    FormTokoReducer

});

export default reducer;