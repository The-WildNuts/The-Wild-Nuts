
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

const Orders = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
            } else {
                fetchOrders();
            }
        }
    }, [authLoading, user]);

    const fetchOrders = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/user/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading Orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#741d1d'
            }}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Package size={64} color="#ccc" />
                    <h3 style={{ marginTop: '20px', color: '#555' }}>No orders found</h3>
                    <p style={{ color: '#777', marginBottom: '20px' }}>Looks like you haven't placed any orders yet.</p>
                    <button
                        onClick={() => navigate('/shop')}
                        style={{
                            padding: '12px 30px',
                            background: '#5d2b1a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((order, idx) => (
                        <div key={idx} style={{
                            backgroundColor: '#fff',
                            padding: '25px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '20px',
                            borderLeft: `6px solid ${order.Status === 'Pending' ? '#ffc107' : order.Status === 'Delivered' ? '#28a745' : '#17a2b8'}`
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', fontSize: '1.1rem' }}>
                                    {order.Order_ID || `Order #${idx + 1}`}
                                </div>
                                <div style={{ fontSize: '0.95rem', color: '#777', marginBottom: '4px' }}>
                                    Placed on: {order.Created_At || order.Date || 'Date N/A'}
                                </div>
                                <div style={{ fontSize: '1rem' }}>
                                    <span style={{ fontWeight: '700', color: '#5d2b1a' }}>₹{order.Total_Amount}</span>
                                    <span style={{ margin: '0 10px', color: '#ddd' }}>|</span>
                                    <span style={{
                                        color: order.Status === 'Pending' ? '#b8860b' : order.Status === 'Delivered' ? '#28a745' : '#17a2b8',
                                        fontWeight: '500'
                                    }}>
                                        {order.Status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/tracking', { state: { orderId: order.Order_ID, isNew: false } })}
                                style={{
                                    backgroundColor: '#5d2b1a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px 25px',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#741d1d'}
                                onMouseOut={(e) => e.target.style.background = '#5d2b1a'}
                            >
                                <Package size={18} /> Track Order
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
