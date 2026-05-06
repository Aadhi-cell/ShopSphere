import { apiClient } from './axiosInstance';

const API_URL = '/api/admin/promotion';

export const getAdminPromotionRequests = async () => {
    const response = await apiClient.get(`${API_URL}/requests`);
    return response.data;
};

export const verifyPromotionRequest = async (id, isVerified, verificationNotes) => {
    const response = await apiClient.put(`${API_URL}/requests/${id}/verify`, { isVerified, verificationNotes });
    return response.data;
};

export const createPromotionBanner = async (formData) => {
    const response = await apiClient.post(`${API_URL}/create-banner`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
};

export const deletePromotionRequest = async (id) => {
    const response = await apiClient.delete(`${API_URL}/requests/${id}`);
    return response.data;
};
