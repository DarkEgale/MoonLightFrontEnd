import apibase from "./api";

// Get all employees (admin only) - all shops
export const getUsers = async (shopId) => {
    const response = await fetch(`${apibase}/admin/get-employees/${shopId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
};

// Get employees for current shop (shop route)
export const getShopEmployees = async () => {
    const response = await fetch(`${apibase}/shop/get-employees`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shop employees");
    }

    return response.json();
};

// Register employee (admin only)
export const registerEmployee = async (userData) => {
    const response = await fetch(`${apibase}/admin/register-employe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register employee");
    }

    return response.json();
};

// Update employee (admin only)
export const updateUser = async (id, userData) => {
    const response = await fetch(`${apibase}/admin/update-employe/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee");
    }

    return response.json();
};

// Delete employee (admin only)
export const deleteUser = async (id) => {
    const response = await fetch(`${apibase}/admin/delete-employe/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete employee");
    }

    return response.json();
};

// Get all users across all shops (admin only)
export const getAllUsers = async () => {
    const response = await fetch(`${apibase}/admin/get-all-users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch all users");
    }

    return response.json();
};