import { apiClient } from './axiosInstance';

class UserAPI {
    static async getUserProfile() {
        const response = await apiClient.get('/api/profile');
        return response.data;
    };

    static async updateUserProfile(profileData) {
        const response = await apiClient.put('/api/profile', profileData);
        return response.data;
    };

    static async getUserOrders() {
        const response = await apiClient.get('/api/orders');
        return response.data;
    };

    static async createOrder(orderData) {
        const response = await apiClient.post('/api/orders', orderData);
        return response.data;
    };

    static async createCheckoutSession(paymentData) {
        const response = await apiClient.post('/api/orders/create-checkout-session', paymentData);
        return response.data;
    };

    static async confirmSession(sessionId) {
        const response = await apiClient.post('/api/orders/confirm-session', { sessionId });
        return response.data;
    };

    static async getOrderById(orderId) {
        const response = await apiClient.get(`/api/orders/${orderId}`);
        return response.data;
    };

    static async cancelOrder(orderId) {
        const response = await apiClient.patch(`/api/orders/${orderId}/cancel`);
        return response.data;
    };

    static async returnOrder(orderId, data) {
        const isFormData = data instanceof FormData;
        const response = await apiClient.patch(`/api/orders/${orderId}/return`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    };

    // --- CMS Content (Public) ---
    static async getActiveBanners() {
        const response = await apiClient.get('/api/content/banners/active');
        return response.data;
    };

    static async trackBanner(bannerId, action) {
        const response = await apiClient.post(`/api/content/banners/track/${bannerId}?action=${action}`);
        return response.data;
    }

    static async getCMSPage(slug) {
        const response = await apiClient.get(`/api/content/pages/${slug}`);
        return response.data;
    };

    static async getActiveAnnouncements() {
        const response = await apiClient.get('/api/content/announcements/active');
        return response.data;
    };

    static async checkDelivery(pincode) {
        const response = await apiClient.post('/api/delivery/check', { pincode });
        return response.data;
    };

    static async getPublicSettings() {
        const response = await apiClient.get('/api/system/settings');
        return response.data;
    };
}


export default UserAPI;

// Compatibility exports
export const getUserProfile = UserAPI.getUserProfile;
export const updateUserProfile = UserAPI.updateUserProfile;
export const getUserOrders = UserAPI.getUserOrders;
export const createOrder = UserAPI.createOrder;
export const createCheckoutSession = UserAPI.createCheckoutSession;
export const confirmSession = UserAPI.confirmSession;
export const getOrderById = UserAPI.getOrderById;
export const cancelOrder = UserAPI.cancelOrder;
export const returnOrder = UserAPI.returnOrder;
export const getActiveBanners = UserAPI.getActiveBanners;
export const getCMSPage = UserAPI.getCMSPage;
export const getActiveAnnouncements = UserAPI.getActiveAnnouncements;
export const checkDelivery = UserAPI.checkDelivery;
export const trackBanner = UserAPI.trackBanner;
export const getPublicSettings = UserAPI.getPublicSettings;

