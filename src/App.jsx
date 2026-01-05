import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import HeroBanner from './components/HeroBanner';
import CategoryShelf from './components/CategoryShelf';
import Footer from './components/Footer';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMarketing from './pages/admin/AdminMarketing';
import Orders from './pages/Orders';
import ProfileSetup from './pages/ProfileSetup';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import OrderTracking from './components/OrderTracking';
import { CartProvider } from './context/CartContext';

const Home = () => (
    <>
        <AnnouncementBar />
        <main>
            <HeroBanner />
            <CategoryShelf />
        </main>
    </>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="app-container">
                        <div className="sticky-header-wrapper">
                            <Header />
                            <Navbar />
                        </div>

                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop/:category?" element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/profile-setup" element={<ProfileSetup />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/tracking" element={<OrderTracking />} />
                            <Route path="/wild-nuts-admin" element={<AdminLogin />} />
                            <Route path="/wild-nuts-admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/wild-nuts-admin/orders" element={<AdminOrders />} />
                            <Route path="/wild-nuts-admin/marketing" element={<AdminMarketing />} />
                        </Routes>

                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
