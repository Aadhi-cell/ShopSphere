import { apiClient } from './axiosInstance';

const API_URL = '/api/seller/promotion';

export const createPromotionRequest = async (data) => {
    const response = await apiClient.post(`${API_URL}/request`, data);
    return response.data;
};

export const getPromotionRequests = async () => {
    const response = await apiClient.get(`${API_URL}/requests`);
    return response.data;
};

export const createPromotionCheckoutSession = async (id) => {
    const response = await apiClient.post(`${API_URL}/checkout-session/${id}`);
    return response.data;
};

export const verifyPromotionPayment = async (sessionId, requestId) => {
    const response = await apiClient.post(`${API_URL}/verify-payment`, { sessionId, requestId });
    return response.data;
};

export const payForPromotion = async (id) => {
    // Keep for mock if needed
    const response = await apiClient.post(`${API_URL}/pay/${id}`);
    return response.data;
};
