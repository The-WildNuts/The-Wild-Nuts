const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const fetchBrands = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
};

export const loginUser = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
};
