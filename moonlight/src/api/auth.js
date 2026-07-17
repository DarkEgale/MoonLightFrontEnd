import apibase from './api';
import { loginSuccess, loginFailure, loginStart, loading } from '../features/auth/authslice';

// Login user
const login = async (email, password, dispatch) => {
    try {
        dispatch(loginStart());
        dispatch(loading(true));
        const response = await fetch(`${apibase}/auth/login`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        dispatch(loginSuccess(data));
        dispatch(loading(false));
        return data;
    } catch (error) {
        dispatch(loading(false));
        dispatch(loginFailure(error.message));
        console.error("Login error:", error);
        throw error;
    }
};

// Get current user
const getCurrentUser = async () => {
    try {
        const response = await fetch(`${apibase}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get current user');
        }

        return data;
    } catch (error) {
        console.error("Get current user error:", error);
        throw error;
    }
};

// Logout user
const logout = async () => {
    try {
        const response = await fetch(`${apibase}/auth/logout`, {
            method: "POST",
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

// Change password
const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await fetch(`${apibase}/auth/change-password`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        return data;
    } catch (error) {
        console.error("Change password error:", error);
        throw error;
    }
};

export { login, getCurrentUser, logout, changePassword };

