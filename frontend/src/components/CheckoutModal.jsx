import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose, items, total }) => {
    if (!isOpen) return null;

    const { user } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleConfirmOrder = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('authToken');

        try {
            // 1. Save Order to Backend
            const orderData = {
                items: items,
                total_amount: total
            };

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Order creation failed');

            const result = await response.json();
            const orderId = result.order_id;

            // 2. Prepare WhatsApp Message
            const itemDetails = items.map(item =>
                `• ${item.quantity}x ${item.name} (${item.variant || 'Standard'})`
            ).join('%0a');

            const message = `*New Order: ${orderId}* %0a%0a` +
                `Hello, I would like to confirm my order:%0a` +
                `*Customer:* ${user.full_name || user.username || user.email}%0a` +
                `*Phone:* ${user.phone || 'N/A'}%0a` +
                `*Address:* ${user.address || ''}, ${user.city || ''}, ${user.state || ''} - ${user.pincode || ''}%0a%0a` +
                `*Items:*%0a${itemDetails}%0a` +
                `*Total Value:* ₹${total}%0a%0a` +
                `Please confirm my order.`;

            const whatsappUrl = `https://wa.me/918778699084?text=${message}`; // Updated Admin Number

            // 3. Clear Cart & Redirect to Tracking
            await clearCart();

            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');

            // Navigate to Account page (Orders section) or specialized Tracking page
            // As per request, we should show tracking UI. For now, let's route to a new tracking page.
            onClose();
            navigate('/tracking', { state: { orderId: orderId, isNew: true } });

        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Something went wrong processing your order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(5px)', // Glassmorphism background blur
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                textAlign: 'center',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
                }}>×</button>

                <h2 style={{ marginBottom: '1rem', color: '#333' }}>Confirm Your Order</h2>

                <div style={{
                    textAlign: 'left',
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span>{item.quantity}x {item.name}</span>
                            <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total Payble</span>
                        <span>₹{total}</span>
                    </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                    Clicking below will open WhatsApp to send your order details directly to our team for confirmation.
                </p>

                <button
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#25D366', // WhatsApp Green
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: isProcessing ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
                    }}
                >
                    {isProcessing ? 'Processing...' : (
                        <>
                            <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                            Send Order via WhatsApp
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;
