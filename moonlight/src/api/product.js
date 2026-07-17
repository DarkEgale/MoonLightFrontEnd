import apibase from './api';

// ----- ADMIN ROUTES -----

// Get all products (admin - all shops) with pagination and filters
export const getProducts = async (shopId, page = 1, limit = 10, company = '', status = '') => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (company) params.append('company', company);
        if (status) params.append('status', status);
        const response = await fetch(`${apibase}/admin/get-products/${shopId}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
        return data;
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

// Get single product by ID (admin)
export const getProduct = async (id) => {
    try {
        const response = await fetch(`${apibase}/admin/get-product/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
        return data;
    } catch (error) {
        console.error('Get product error:', error);
        throw error;
    }
};

// Create a new product (admin)
export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${apibase}/admin/create-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create product');
        return data;
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

// Update a product (admin)
export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${apibase}/admin/update-product/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update product');
        return data;
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

// Delete a product (admin)
export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${apibase}/admin/delete-product/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete product');
        return data;
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};

// ----- SHOP ROUTES (for non-admin users with shop access) -----

// Get all products for your shop
export const getShopProducts = async () => {
    try {
        const response = await fetch(`${apibase}/shop/get-products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shop products');
        return data;
    } catch (error) {
        console.error('Get shop products error:', error);
        throw error;
    }
};

// Get single product from your shop
export const getShopProduct = async (id) => {
    try {
        const response = await fetch(`${apibase}/shop/get-product/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch shop product');
        return data;
    } catch (error) {
        console.error('Get shop product error:', error);
        throw error;
    }
};

// Create a product in your shop
export const createShopProduct = async (productData) => {
    try {
        const response = await fetch(`${apibase}/shop/create-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create shop product');
        return data;
    } catch (error) {
        console.error('Create shop product error:', error);
        throw error;
    }
};

// Update a product in your shop
export const updateShopProduct = async (id, productData) => {
    try {
        const response = await fetch(`${apibase}/shop/update-product/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update shop product');
        return data;
    } catch (error) {
        console.error('Update shop product error:', error);
        throw error;
    }
};

// Delete a product from your shop
export const deleteShopProduct = async (id) => {
    try {
        const response = await fetch(`${apibase}/shop/delete-product/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete shop product');
        return data;
    } catch (error) {
        console.error('Delete shop product error:', error);
        throw error;
    }
};