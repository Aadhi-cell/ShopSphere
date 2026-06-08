import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/user/Home.jsx'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProductDetails from './pages/user/ProductDetails'
import Cart from './pages/user/Cart'
import BuyNow from './pages/user/BuyNow'
import Checkout from './pages/user/Checkout'
import OrderSuccess from './pages/user/OrderSuccess'
import PaymentFailure from './pages/user/PaymentFailure'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerLogin from './pages/seller/SellerLogin'
import SellerRegister from './pages/seller/SellerRegister'
import AddProduct from './pages/seller/AddProduct'
import EditProduct from './pages/seller/EditProduct'
import MyProducts from './pages/seller/MyProducts'
import RequestPromotion from './pages/seller/RequestPromotion'
import Orders from './pages/user/Orders'
import Search from './pages/user/Search'
import Wishlist from './pages/user/Wishlist'
import Profile from './pages/user/Profile'
import Review from './pages/user/Review'
import Help from './pages/Help'
import MyTickets from './pages/MyTickets'
import Returns from './pages/Returns'
import PrivacyPolicy from './pages/PrivacyPolicy'
import UserAgreement from './pages/UserAgreement'
import NotFound from './pages/NotFound'
import PrivateRoute from './routes/PrivateRoute'
import SellerRoute from './routes/SellerRoute'
import AdminRoute from './routes/AdminRoute'
import { CartProvider } from './contexts/CartContext'
import { SellerAuthProvider } from './contexts/SellerAuthContext'
import './styles/style.css'

import CMSPage from './pages/CMSPage'

const router = createBrowserRouter([
	{ path: '/login', element: <Login /> },
	{ path: '/signup', element: <Register /> },
	{
		path: '/',
		element: <PrivateRoute />,
		errorElement: <NotFound />,
		children: [
			{
				path: '/',
				element: <App />,
				children: [
					{ index: true, element: <Home /> },
					{ path: 'products/:id', element: <ProductDetails /> },
					{ path: 'cart', element: <Cart /> },
					{ path: 'buy-now', element: <BuyNow /> },
					{ path: 'checkout', element: <Checkout /> },
					{ path: 'order-success/:orderId', element: <OrderSuccess /> },
					{ path: 'payment-failure', element: <PaymentFailure /> },
					{ path: 'search', element: <Search /> },
					{ path: 'orders', element: <Orders /> },
					{ path: 'wishlist', element: <Wishlist /> },
					{ path: 'profile', element: <Profile /> },
					{ path: 'help', element: <Help /> },
					{ path: 'my-tickets', element: <MyTickets /> },
					{ path: 'returns', element: <Returns /> },
					{ path: 'privacy-policy', element: <PrivacyPolicy /> },
					{ path: 'user-agreement', element: <UserAgreement /> },
					{ path: 'review/:productId', element: <Review /> },
					{ path: 'page/:slug', element: <CMSPage /> },
				],
			},
		],
	},
	{
		path: '/admin',
		element: <AdminRoute />,
		children: [
			{ index: true, element: <AdminDashboard /> },
		],
	},
	{
		path: '/seller',
		element: <SellerRoute />,
		children: [
			{ index: true, element: <SellerDashboard /> },
			{ path: 'add-product', element: <AddProduct /> },
			{ path: 'edit-product/:id', element: <EditProduct /> },
			{ path: 'my-products', element: <MyProducts /> },
			{ path: 'request-promotion', element: <RequestPromotion /> },
		],
	},
	{ path: '/seller-login', element: <SellerLogin /> },
	{ path: '/seller/login', element: <SellerLogin /> },
	{ path: '/seller-register', element: <SellerRegister /> },
	{ path: '/seller/register', element: <SellerRegister /> },
	{ path: '/admin/login', element: <AdminLogin /> },
])

ReactDOM.createRoot(document.getElementById('app')).render(
	<React.StrictMode>
		<SellerAuthProvider>
			<CartProvider>
				<RouterProvider router={router} />
			</CartProvider>
		</SellerAuthProvider>
	</React.StrictMode>
)


