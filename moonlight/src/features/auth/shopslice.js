import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    shopId: null,
    productId: null,
    saleId: null,
}

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        setShopId: (state, action) => {
            state.shopId = action.payload;
        },
        setProductId: (state, action) => {
            state.productId = action.payload
        },
        setSaleId: (state, action) => {
            state.saleId = action.payload
        }
    }
})
export const { setShopId, setProductId, setSaleId } = shopSlice.actions
export default shopSlice.reducer;