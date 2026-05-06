import { apiClient as axiosInstance } from './axiosInstance';

class SellerAPI {

    // Seller Authentication
    static async registerSeller(sellerData) {
        const isFormData = sellerData instanceof FormData;
        const response = await axiosInstance.post('/api/seller/register', sellerData, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data;
    }

    static async saveOnboardingStep1(data) {
        const response = await axiosInstance.post('/api/seller/onboarding/step-1', data);
        return response.data;
    }

    static async saveOnboardingStep2(data) {
        const response = await axiosInstance.post('/api/seller/onboarding/step-2', data);
        return response.data;
    }

    static async saveOnboardingStep3(formData) {
        const response = await axiosInstance.post('/api/seller/onboarding/step-3', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    static async saveOnboardingStep4(data) {
        const response = await axiosInstance.post('/api/seller/onboarding/step-4', data);
        return response.data;
    }

    static async getOnboardingStatus() {
        const response = await axiosInstance.get('/api/seller/onboarding/status');
        return response.data;
    }

    static async loginSeller(credentials) {
        const response = await axiosInstance.post('/api/seller/login', credentials);
        return response.data;
    }

    static async getSellerProfile() {
        const response = await axiosInstance.get('/api/seller/profile');
        return response.data;
    }

    static async updateSellerProfile(profileData) {
        const response = await axiosInstance.put('/api/seller/profile', profileData);
        return response.data;
    }

    static async logoutSeller() {
        const response = await axiosInstance.post('/api/seller/logout');
        return response.data;
    }

    // Seller Products
    static async getSellerProducts() {
        const response = await axiosInstance.get('/api/seller/products');
        return response.data;
    }

    static async addProduct(productData) {
        const response = await axiosInstance.post('/api/seller/products', productData);
        return response.data;
    }

    static async updateProduct(productId, productData) {
        const response = await axiosInstance.put(`/api/seller/products/${productId}`, productData);
        return response.data;
    }

    static async deleteProduct(productId) {
        const response = await axiosInstance.delete(`/api/seller/products/${productId}`);
        return response.data;
    }

    static async toggleProductPause(productId) {
        const response = await axiosInstance.patch(`/api/seller/products/${productId}/toggle-pause`);
        return response.data;
    }

    // Seller Orders (Orders Central)
    static async getSellerOrders() {
        const response = await axiosInstance.get('/api/seller/orders');
        return response.data;
    }

    static async updateOrderStatus(orderId, status) {
        const response = await axiosInstance.put(`/api/seller/orders/${orderId}/status`, { status });
        return response.data;
    }

    static async updateOrderTracking(orderId, trackingId) {
        const response = await axiosInstance.put(`/api/seller/orders/${orderId}/tracking`, { tracking_id: trackingId });
        return response.data;
    }

    static async handleOrderReturn(orderId, status, reason) {
        const response = await axiosInstance.put(`/api/seller/orders/${orderId}/return`, { status, reason });
        return response.data;
    }

    // Seller Dashboard
    static async getDashboardStats() {
        const response = await axiosInstance.get('/api/seller/dashboard/stats');
        return response.data;
    }

    // Notifications
    static async getNotifications() {
        const response = await axiosInstance.get('/api/seller/notifications');
        return response.data;
    }

    static async markNotificationsRead() {
        const response = await axiosInstance.put('/api/seller/notifications/mark-read');
        return response.data;
    }
    static async sendSellerOTP(email) {
        const response = await axiosInstance.post('/api/seller/send-otp', { email });
        return response.data;
    }

    static async verifySellerOTP(email, otp) {
        const response = await axiosInstance.post('/api/seller/verify-otp', { email, otp });
        return response.data;
    }
}

export default SellerAPI;

// Compatibility exports
export const registerSeller = SellerAPI.registerSeller;
export const loginSeller = SellerAPI.loginSeller;
export const getSellerProfile = SellerAPI.getSellerProfile;
export const updateSellerProfile = SellerAPI.updateSellerProfile;
export const logoutSeller = SellerAPI.logoutSeller;
export const getSellerProducts = SellerAPI.getSellerProducts;
export const addProduct = SellerAPI.addProduct;
export const updateProduct = SellerAPI.updateProduct;
export const deleteProduct = SellerAPI.deleteProduct;
export const toggleProductPause = SellerAPI.toggleProductPause;
export const getSellerOrders = SellerAPI.getSellerOrders;
export const updateOrderStatus = SellerAPI.updateOrderStatus;
export const updateOrderTracking = SellerAPI.updateOrderTracking;
export const handleOrderReturn = SellerAPI.handleOrderReturn;
export const getDashboardStats = SellerAPI.getDashboardStats;
export const getNotifications = SellerAPI.getNotifications;
export const markNotificationsRead = SellerAPI.markNotificationsRead;
export const sendSellerOTP = SellerAPI.sendSellerOTP;
export const verifySellerOTP = SellerAPI.verifySellerOTP;

export const saveOnboardingStep1 = SellerAPI.saveOnboardingStep1;
export const saveOnboardingStep2 = SellerAPI.saveOnboardingStep2;
export const saveOnboardingStep3 = SellerAPI.saveOnboardingStep3;
export const saveOnboardingStep4 = SellerAPI.saveOnboardingStep4;
export const getOnboardingStatus = SellerAPI.getOnboardingStatus;

