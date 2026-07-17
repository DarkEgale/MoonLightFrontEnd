import apibase from './api';
// Get all shops for a user
export const getShops = async (userId) => {
    try {
        const response = await fetch(`${apibase}/admin/get-shops/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shops');
        return data;
    } catch (error) {
        console.error('Get shops error:', error);
        throw error;
    }
};

// Create a new shop
export const createShop = async (shopData) => {
    try {
        const response = await fetch(`${apibase}/admin/create-shop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(shopData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create shop');
        return data;
    } catch (error) {
        console.error('Create shop error:', error);
        throw error;
    }
};

// Update a shop
export const updateShop = async (id, shopData) => {
    try {
        const response = await fetch(`${apibase}/admin/update-shop/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(shopData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update shop');
        return data;
    } catch (error) {
        console.error('Update shop error:', error);
        throw error;
    }
};

// Delete a shop
export const deleteShop = async (id) => {
    try {
        const response = await fetch(`${apibase}/admin/delete-shop/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete shop');
        return data;
    } catch (error) {
        console.error('Delete shop error:', error);
        throw error;
    }
};