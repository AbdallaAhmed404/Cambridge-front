// src/Redux/Store.js
import { configureStore } from "@reduxjs/toolkit";
import ShopReducer from "./Reducer";

const store = configureStore({
  reducer: {
    ShopReducer: ShopReducer, 
  },
});

export default store;
