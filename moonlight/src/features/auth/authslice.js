import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    authChecked: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.loading = false;
            state.error = null;
            state.authChecked = true;
        },
        loginFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
            state.authChecked = true;
        },
        loading: (state, action) => {
            state.loading = action.payload;
        },
        registerStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        registerSuccess: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.loading = false;
            state.error = null;
            state.authChecked = true;
        },
        registerFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.authChecked = true;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
            state.authChecked = true;
        },
        authCheckComplete: (state, action) => {
            state.authChecked = true;
            if (action.payload) {
                state.user = action.payload;
                state.isLoggedIn = true;
            }
        }
    }
})

export const { loginStart, loginSuccess, loginFailure, loading, registerStart, registerSuccess, registerFailure, logout, authCheckComplete } = authSlice.actions;
export default authSlice.reducer;