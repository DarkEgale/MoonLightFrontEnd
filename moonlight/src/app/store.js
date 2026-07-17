

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authslice';
import shopReducer from '../features/auth/shopslice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        shop: shopReducer
    }
})