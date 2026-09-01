import { GET_ALL_DATA } from "./Actions";

const ShopReducer = (state = [], action)=>{
    switch (action.type) {
        case GET_ALL_DATA:
            return action.payload
        default:
            return state
    }
}

export default ShopReducer