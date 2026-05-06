import axios from 'axios'
import { getToken } from '../auth'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'

export const apiClient = axios.create({
	baseURL,
	headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
	config => {
		const isSellerApi = config.url.includes('/api/seller')
		const isPublicContent = config.url.includes('/api/content/banners/active') || config.url.includes('/api/content/pages') || config.url.includes('/api/content/announcements/active')
		const isAdminApi = (config.url.includes('/api/admin') || config.url.includes('/api/content')) && !isPublicContent

		let token = null;
		if (isSellerApi) {
			token = localStorage.getItem('sellerToken') || getToken()
		} else if (isAdminApi) {
			token = sessionStorage.getItem('admin_token') || getToken()
		} else {
			token = getToken()
		}

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}

		if (config.data instanceof FormData) {
			delete config.headers['Content-Type'];
		}

		return config
	},
	error => Promise.reject(error)
)

apiClient.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			const isSellerApi = error.config?.url?.includes('/api/seller')
			const isAdminApi = error.config?.url?.includes('/api/admin') || error.config?.url?.includes('/api/content')

			if (isSellerApi) {
				localStorage.removeItem('sellerToken')
			} else if (isAdminApi) {
				sessionStorage.removeItem('admin_token')
				sessionStorage.removeItem('admin_user')
			} else {
				localStorage.removeItem('shopsphere_token')
				localStorage.removeItem('shopsphere_user')
			}

			window.dispatchEvent(new Event('auth-change'))
			window.dispatchEvent(new Event('seller-auth-change'))
		}

		return Promise.reject(error)
	}
)

