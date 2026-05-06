import { apiClient } from './axiosInstance';

class AdminAPI {
    static async getAdminStats(range = 'All Time') {
        const response = await apiClient.get(`/api/admin/stats?range=${encodeURIComponent(range)}`);
        return response.data;
    }

    static async getAdminProducts() {
        const response = await apiClient.get('/api/admin/products');
        return response.data;
    }

    static async getPendingProducts() {
        const response = await apiClient.get('/api/admin/pending-products');
        return response.data;
    }

    static async approveProductAdmin(id) {
        const response = await apiClient.put(`/api/admin/products/${id}/approve`);
        return response.data;
    }

    static async updateProductStatusAdmin(id, status) {
        const response = await apiClient.put(`/api/admin/products/${id}/status`, { status });
        return response.data;
    }

    static async rejectProductAdmin(id, reason) {
        const response = await apiClient.post(`/api/admin/products/${id}/reject`, { reason });
        return response.data;
    }

    static async blockProduct(id) {
        const response = await apiClient.patch(`/api/admin/products/${id}/block`);
        return response.data;
    }

    static async unblockProduct(id) {
        const response = await apiClient.patch(`/api/admin/products/${id}/unblock`);
        return response.data;
    }

    static async getAdminSellers() {
        const response = await apiClient.get('/api/admin/sellers');
        return response.data;
    }

    static async updateSellerStatusAdmin(id, status, reason = null) {
        const response = await apiClient.put(`/api/admin/sellers/${id}/approve`, { status, reason });
        return response.data;
    }

    static async getAdminOrders() {
        const response = await apiClient.get('/api/admin/orders');
        return response.data;
    }

    static async deleteProductAdmin(id) {
        const response = await apiClient.delete(`/api/admin/products/${id}`);
        return response.data;
    }

    static async createProductAdmin(productData) {
        const response = await apiClient.post('/api/admin/products', productData);
        return response.data;
    }

    static async updateOrderStatusAdmin(orderId, status, tracking) {
        const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, { status, tracking });
        return response.data;
    }

    static async handleOrderReturnAdmin(orderId, returnData) {
        const response = await apiClient.put(`/api/admin/orders/${orderId}/return`, returnData);
        return response.data;
    }

    static async getAdminUsers() {
        const response = await apiClient.get('/api/admin/users');
        return response.data;
    }

    static async updateUserStatusAdmin(userId, status) {
        const response = await apiClient.put(`/api/admin/users/${userId}/status`, { status });
        return response.data;
    }

    static async updateSellerActiveStatusAdmin(sellerId, isActive) {
        const response = await apiClient.put(`/api/admin/sellers/${sellerId}/active`, { isActive });
        return response.data;
    }

    static async getAdminFinanceData() {
        const response = await apiClient.get('/api/admin/finance');
        return response.data;
    }

    static async getAdminPayouts() {
        const response = await apiClient.get('/api/admin/payouts');
        return response.data;
    }

    static async approvePayoutAdmin(id, reference) {
        const response = await apiClient.post(`/api/admin/payouts/${id}/approve`, { reference });
        return response.data;
    }

    // --- Admin Notifications --- //
    static async getAdminNotifications() {
        const response = await apiClient.get('/api/admin/notifications');
        return response.data;
    }

    static async markAdminNotificationsRead() {
        const response = await apiClient.put('/api/admin/notifications/mark-read');
        return response.data;
    }

    // --- Admin Accounts Management --- //
    static async getAdminAccounts() {
        const response = await apiClient.get('/api/admin/admins');
        return response.data;
    }

    static async createAdminAccount(adminData) {
        const response = await apiClient.post('/api/admin/admins', adminData);
        return response.data;
    }

    static async deleteAdminAccount(id) {
        const response = await apiClient.delete(`/api/admin/admins/${id}`);
        return response.data;
    }

    // --- System Settings --- //
    static async getSystemSettings() {
        const response = await apiClient.get('/api/admin/settings');
        return response.data;
    }

    static async updateSystemSettings(settingsData) {
        const response = await apiClient.put('/api/admin/settings', settingsData);
        return response.data;
    }

    // --- Support: Tickets --- //
    static async getSupportStats() {
        const response = await apiClient.get('/api/admin/support/stats');
        return response.data;
    }
    static async getTickets(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/api/admin/support/tickets${query ? '?' + query : ''}`);
        return response.data;
    }
    static async getTicketById(id) {
        const response = await apiClient.get(`/api/admin/support/tickets/${id}`);
        return response.data;
    }
    static async replyToTicket(id, message) {
        const response = await apiClient.post(`/api/admin/support/tickets/${id}/reply`, { message });
        return response.data;
    }
    static async updateTicketStatus(id, status) {
        const response = await apiClient.put(`/api/admin/support/tickets/${id}/status`, { status });
        return response.data;
    }
    static async deleteTicket(id) {
        const response = await apiClient.delete(`/api/admin/support/tickets/${id}`);
        return response.data;
    }

    // --- Support: Messages --- //
    static async getMessages() {
        const response = await apiClient.get('/api/admin/support/messages');
        return response.data;
    }
    static async getMessageById(id) {
        const response = await apiClient.get(`/api/admin/support/messages/${id}`);
        return response.data;
    }
    static async replyToMessage(id, content) {
        const response = await apiClient.post(`/api/admin/support/messages/${id}/reply`, { content });
        return response.data;
    }
    static async deleteMessage(id) {
        const response = await apiClient.delete(`/api/admin/support/messages/${id}`);
        return response.data;
    }
    static async addInternalNote(id, message) {
        const response = await apiClient.post(`/api/admin/support/tickets/${id}/internal-note`, { message });
        return response.data;
    }
    static async resolveTicket(id, resolution, resolutionNote = '') {
        const response = await apiClient.post(`/api/admin/support/tickets/${id}/resolve`, { resolution, resolutionNote });
        return response.data;
    }

    // --- Content Management API ---

    // Banners
    static async getBanners() {
        const response = await apiClient.get('/api/content/banners');
        return response.data;
    }
    static async createBanner(data) {
        const isFormData = data instanceof FormData;
        const response = await apiClient.post('/api/content/banners', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    }
    static async updateBanner(id, data) {
        const isFormData = data instanceof FormData;
        const response = await apiClient.put(`/api/content/banners/${id}`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    }
    static async deleteBanner(id) {
        const response = await apiClient.delete(`/api/content/banners/${id}`);
        return response.data;
    }

    // Pages
    static async getPages() {
        const response = await apiClient.get('/api/content/pages');
        return response.data;
    }
    static async createPage(data) {
        const response = await apiClient.post('/api/content/pages', data);
        return response.data;
    }
    static async updatePage(id, data) {
        const response = await apiClient.put(`/api/content/pages/${id}`, data);
        return response.data;
    }
    static async deletePage(id) {
        const response = await apiClient.delete(`/api/content/pages/${id}`);
        return response.data;
    }

    // Announcements
    static async getAnnouncements() {
        const response = await apiClient.get('/api/content/announcements');
        return response.data;
    }
    static async createAnnouncement(data) {
        const response = await apiClient.post('/api/content/announcements', data);
        return response.data;
    }
    static async updateAnnouncement(id, data) {
        const response = await apiClient.put(`/api/content/announcements/${id}`, data);
        return response.data;
    }
    static async deleteAnnouncement(id) {
        const response = await apiClient.delete(`/api/content/announcements/${id}`);
        return response.data;
    }
}

export default AdminAPI;

// Compatibility exports
export const getAdminStats = AdminAPI.getAdminStats;
export const getAdminProducts = AdminAPI.getAdminProducts;
export const getPendingProducts = AdminAPI.getPendingProducts;
export const approveProductAdmin = AdminAPI.approveProductAdmin;
export const updateProductStatusAdmin = AdminAPI.updateProductStatusAdmin;
export const rejectProductAdmin = AdminAPI.rejectProductAdmin;
export const blockProduct = AdminAPI.blockProduct;
export const unblockProduct = AdminAPI.unblockProduct;
export const getAdminSellers = AdminAPI.getAdminSellers;
export const updateSellerStatusAdmin = AdminAPI.updateSellerStatusAdmin;
export const getAdminOrders = AdminAPI.getAdminOrders;
export const deleteProductAdmin = AdminAPI.deleteProductAdmin;
export const createProductAdmin = AdminAPI.createProductAdmin;
export const updateOrderStatusAdmin = AdminAPI.updateOrderStatusAdmin;
export const handleOrderReturnAdmin = AdminAPI.handleOrderReturnAdmin;
export const getAdminUsers = AdminAPI.getAdminUsers;
export const updateUserStatusAdmin = AdminAPI.updateUserStatusAdmin;
export const updateSellerActiveStatusAdmin = AdminAPI.updateSellerActiveStatusAdmin;
export const getAdminFinanceData = AdminAPI.getAdminFinanceData;
export const getAdminPayouts = AdminAPI.getAdminPayouts;
export const approvePayoutAdmin = AdminAPI.approvePayoutAdmin;
export const getAdminAccounts = AdminAPI.getAdminAccounts;
export const createAdminAccount = AdminAPI.createAdminAccount;
export const deleteAdminAccount = AdminAPI.deleteAdminAccount;
export const getSystemSettings = AdminAPI.getSystemSettings;
export const updateSystemSettings = AdminAPI.updateSystemSettings;
export const getSupportStats = AdminAPI.getSupportStats;
export const getTickets = AdminAPI.getTickets;
export const getTicketById = AdminAPI.getTicketById;
export const replyToTicket = AdminAPI.replyToTicket;
export const updateTicketStatus = AdminAPI.updateTicketStatus;
export const deleteTicket = AdminAPI.deleteTicket;
export const getMessages = AdminAPI.getMessages;
export const getMessageById = AdminAPI.getMessageById;
export const replyToMessage = AdminAPI.replyToMessage;
export const deleteMessage = AdminAPI.deleteMessage;
export const addInternalNote = AdminAPI.addInternalNote;
export const resolveTicket = AdminAPI.resolveTicket;
export const getBanners = AdminAPI.getBanners;
export const createBanner = AdminAPI.createBanner;
export const updateBanner = AdminAPI.updateBanner;
export const deleteBanner = AdminAPI.deleteBanner;
export const getPages = AdminAPI.getPages;
export const createPage = AdminAPI.createPage;
export const updatePage = AdminAPI.updatePage;
export const deletePage = AdminAPI.deletePage;
export const getAnnouncements = AdminAPI.getAnnouncements;
export const createAnnouncement = AdminAPI.createAnnouncement;
export const updateAnnouncement = AdminAPI.updateAnnouncement;
export const deleteAnnouncement = AdminAPI.deleteAnnouncement;
export const getAdminNotifications = AdminAPI.getAdminNotifications;
export const markAdminNotificationsRead = AdminAPI.markAdminNotificationsRead;
