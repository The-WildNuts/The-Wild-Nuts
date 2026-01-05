import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const OrderTracking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, isNew } = location.state || {};

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (!orderId) {
            // Redirect if accessed directly without an order
            navigate('/');
            return;
        }

        // Fetch order status from backend
        fetchOrderStatus();
    }, [orderId, navigate]);

    const fetchOrderStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

            if (!response.ok) {
                throw new Error('Order not found');
            }

            const data = await response.json();
            const order = data.order;

            // Map tracking stage to step index
            const trackingStage = order.Tracking_Stage || 'Order Placed';

            // Check if order is cancelled
            if (trackingStage.toLowerCase() === 'cancelled') {
                setIsCancelled(true);
                setCurrentStep(0);
            } else {
                const stepMapping = {
                    'Order Placed': 0,
                    'Order Confirmed': 1,
                    'Confirmed': 1,
                    'Order Picked': 2,
                    'Picked': 2,
                    'On the Way': 3,
                    'Shipped': 3,
                    'Delivered': 4
                };
                setCurrentStep(stepMapping[trackingStage] || 0);
                setIsCancelled(false);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching order status:', err);
            setError('Unable to load order status');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { label: "Order Placed", icon: "fa-clipboard-check", desc: "We have received your order." },
        { label: "Order Confirmed", icon: "fa-user-check", desc: "Our team has verified your selection via WhatsApp." },
        { label: "Order Picked", icon: "fa-box-open", desc: "Hand-picked for quality." },
        { label: "On the Way", icon: "fa-truck-fast", desc: "Out for delivery to your doorstep." },
        { label: "Delivered", icon: "fa-house-circle-check", desc: "Enjoy your Wild Nuts!" }
    ];

    // For demo purposes, if it's a new order, we stay at step 0. 
    // In future, fetch actual status from API.

    const isStepActive = (index) => index <= currentStep;
    const isStepCurrent = (index) => index === currentStep;

    // Loading state
    if (loading) {
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#636e72' }}>Loading order status...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
                <div style={{
                    background: '#fee2e2',
                    padding: '20px',
                    borderRadius: '12px',
                    color: '#b91c1c'
                }}>
                    <h2>{error}</h2>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#b91c1c',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Cancelled order UI
    if (isCancelled) {
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
                <div style={{
                    background: '#fee2e2',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <XCircle size={64} color="#dc2626" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ color: '#991b1b', marginBottom: '15px' }}>Order Cancelled</h2>
                    <p style={{ color: '#7f1d1d', fontSize: '1.1rem', marginBottom: '20px' }}>
                        Order ID: <strong>{orderId}</strong>
                    </p>
                    <p style={{ color: '#991b1b', marginBottom: '10px' }}>
                        This order has been cancelled.
                    </p>
                    <p style={{ color: '#7f1d1d', fontSize: '0.9rem' }}>
                        If you made a payment, a full refund will be processed within 5-7 business days.
                    </p>
                    <p style={{ color: '#7f1d1d', fontSize: '0.9rem', marginTop: '10px' }}>
                        You should have received a cancellation email with more details.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '25px',
                            padding: '12px 30px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>

            {/* Header Card */}
            <div style={{
                background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
                padding: '30px',
                borderRadius: '24px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px', height: '60px', background: '#e3f9e5',
                    borderRadius: '50%', margin: '0 auto 15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#28a745', fontSize: '1.5rem'
                }}>
                    <i className="fa-solid fa-check"></i>
                </div>
                <h1 style={{ color: '#2d3436', fontSize: '1.8rem', marginBottom: '5px' }}>Order Successfully Placed!</h1>
                <p style={{ color: '#636e72' }}>Order ID: <span style={{ fontWeight: 'bold' }}>{orderId}</span></p>
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#888' }}>
                    <i className="fa-brands fa-whatsapp" style={{ marginRight: '5px', color: '#25D366' }}></i>
                    Details sent to admin
                </div>
            </div>

            {/* Stepper Container */}
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                {steps.map((step, index) => (
                    <div key={index} style={{ marginBottom: '30px', display: 'flex', position: 'relative' }}>

                        {/* Connecting Line */}
                        {index < steps.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                left: '19px',
                                top: '40px',
                                bottom: '-30px', // Extend to next
                                width: '2px',
                                background: isStepActive(index + 1) ? '#28a745' : '#e0e0e0',
                                borderLeft: isStepActive(index + 1) ? 'none' : '2px dashed #ccc', // Solid if passed, dashed if future
                                zIndex: 0
                            }}></div>
                        )}

                        {/* Icon Node */}
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            background: isStepActive(index) ? '#28a745' : '#fff',
                            border: `2px solid ${isStepActive(index) ? '#28a745' : '#ccc'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isStepActive(index) ? '#fff' : '#ccc',
                            fontSize: '1rem',
                            zIndex: 1,
                            marginRight: '20px',
                            boxShadow: isStepCurrent(index) ? '0 0 0 5px rgba(40, 167, 69, 0.2)' : 'none', // Pulse effect
                            transition: 'all 0.3s ease'
                        }}>
                            <i className={`fa-solid ${step.icon}`}></i>
                        </div>

                        {/* Content */}
                        <div style={{ paddingTop: '5px' }}>
                            <h3 style={{
                                margin: '0 0 5px',
                                color: isStepActive(index) ? '#2d3436' : '#b2bec3',
                                fontWeight: isStepCurrent(index) ? '700' : '500'
                            }}>
                                {step.label}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#636e72' }}>{step.desc}</p>

                            {/* Live Note Box for "Order Picked" */}
                            {step.label === "Order Picked" && isStepActive(index) && (
                                <div style={{
                                    marginTop: '15px',
                                    background: '#fffdf5', // Light cream
                                    borderLeft: '4px solid #fdcb6e', // Golden accent
                                    padding: '12px 15px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: '#5d5d5d',
                                    fontStyle: 'italic',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                }}>
                                    <i className="fa-solid fa-quote-left" style={{ color: '#fdcb6e', marginRight: '8px' }}></i>
                                    Your nuts are being hand-picked and quality-checked at our facility right now. We're getting them ready for the journey to you!
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 30px',
                        borderRadius: '30px',
                        border: '1px solid #ccc',
                        background: '#fff',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '0.95rem'
                    }}
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderTracking;
