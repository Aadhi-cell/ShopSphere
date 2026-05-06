import { apiClient } from './axiosInstance';

class ProductAPI {
    static async getProducts(params) {
        const response = await apiClient.get('/api/products', { params });
        return response.data;
    };

    static async getProductById(id) {
        const response = await apiClient.get(`/api/products/${id}`);
        return response.data;
    };

    static async getProductReviews(id) {
        const response = await apiClient.get(`/api/products/${id}/reviews`);
        return response.data;
    };

    static async addProductReview(id, reviewData) {
        const isFormData = reviewData instanceof FormData;
        const response = await apiClient.post(`/api/products/${id}/reviews`, reviewData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    };


}

export default ProductAPI;

// Compatibility exports
export const getProducts = ProductAPI.getProducts;
export const getProductById = ProductAPI.getProductById;
export const getProductReviews = ProductAPI.getProductReviews;
export const addProductReview = ProductAPI.addProductReview;

