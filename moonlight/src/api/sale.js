import apibase from './api';

// ----- ADMIN ROUTES -----

// Get all sales (admin) with pagination and status filter
export const getSales = async (shopId, page = 1, limit = 10, status = '') => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);
        const response = await fetch(`${apibase}/admin/get-sales/${shopId}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch sales');
        return data;
    } catch (error) {
        console.error('Get sales error:', error);
        throw error;
    }
};

// Get single sale by ID (admin)
export const getSale = async (id) => {
    try {
        const response = await fetch(`${apibase}/admin/get-sale/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch sale');
        return data;
    } catch (error) {
        console.error('Get sale error:', error);
        throw error;
    }
};

// Create a new sale (admin)
export const createSale = async (saleData) => {
    try {
        const response = await fetch(`${apibase}/admin/create-sale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(saleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create sale');
        return data;
    } catch (error) {
        console.error('Create sale error:', error);
        throw error;
    }
};

// Update a sale (admin)
export const updateSale = async (id, saleData) => {
    try {
        const response = await fetch(`${apibase}/admin/update-sale/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(saleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update sale');
        return data;
    } catch (error) {
        console.error('Update sale error:', error);
        throw error;
    }
};

// Delete a sale (admin)
export const deleteSale = async (id) => {
    try {
        const response = await fetch(`${apibase}/admin/delete-sale/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete sale');
        return data;
    } catch (error) {
        console.error('Delete sale error:', error);
        throw error;
    }
};

// Get all due sales (admin)
export const getDueSales = async () => {
    try {
        const response = await fetch(`${apibase}/admin/get-due-sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch due sales');
        return data;
    } catch (error) {
        console.error('Get due sales error:', error);
        throw error;
    }
};

// Update a due sale (admin)
export const updateDueSale = async (id, dueSaleData) => {
    try {
        const response = await fetch(`${apibase}/admin/update-due-sale/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dueSaleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update due sale');
        return data;
    } catch (error) {
        console.error('Update due sale error:', error);
        throw error;
    }
};

// ----- SHOP ROUTES (for non-admin users with shop access) -----

// Get all sales for your shop
export const getShopSales = async () => {
    try {
        const response = await fetch(`${apibase}/shop/get-sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shop sales');
        return data;
    } catch (error) {
        console.error('Get shop sales error:', error);
        throw error;
    }
};

// Get single sale from your shop
export const getShopSale = async (id) => {
    try {
        const response = await fetch(`${apibase}/shop/get-sale/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shop sale');
        return data;
    } catch (error) {
        console.error('Get shop sale error:', error);
        throw error;
    }
};

// Create a sale in your shop
export const createShopSale = async (saleData) => {
    try {
        const response = await fetch(`${apibase}/shop/create-sale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(saleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create shop sale');
        return data;
    } catch (error) {
        console.error('Create shop sale error:', error);
        throw error;
    }
};

// Update a sale in your shop
export const updateShopSale = async (id, saleData) => {
    try {
        const response = await fetch(`${apibase}/shop/update-sale/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(saleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update shop sale');
        return data;
    } catch (error) {
        console.error('Update shop sale error:', error);
        throw error;
    }
};

// Delete a sale from your shop
export const deleteShopSale = async (id) => {
    try {
        const response = await fetch(`${apibase}/shop/delete-sale/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete shop sale');
        return data;
    } catch (error) {
        console.error('Delete shop sale error:', error);
        throw error;
    }
};

// Get due sales for your shop
export const getShopDueSales = async () => {
    try {
        const response = await fetch(`${apibase}/shop/get-due-sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shop due sales');
        return data;
    } catch (error) {
        console.error('Get shop due sales error:', error);
        throw error;
    }
};

// Update a due sale in your shop
export const updateShopDueSale = async (id, dueSaleData) => {
    try {
        const response = await fetch(`${apibase}/shop/update-due-sale/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dueSaleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update shop due sale');
        return data;
    } catch (error) {
        console.error('Update shop due sale error:', error);
        throw error;
    }
};