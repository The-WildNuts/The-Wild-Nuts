import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { LogIn, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';

const NotificationShowcase = () => {
    const { showToast, showModal, hideModal } = useNotification();

    const handleLoginModal = () => {
        showModal({
            title: "Authentication Required",
            description: "Please log in to access your account and view your order history.",
            blocking: true,
            icon: <AlertTriangle size={48} color="var(--ns-warning)" />,
            actions: (
                <>
                    <button
                        style={{
                            padding: '12px',
                            backgroundColor: 'var(--ns-primary-green)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            hideModal();
                            showToast("Logged in successfully!", "success");
                        }}
                    >
                        Log In
                    </button>
                    <button
                        style={{
                            padding: '12px',
                            backgroundColor: 'transparent',
                            color: 'var(--ns-text-secondary)',
                            border: 'none',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                        onClick={hideModal}
                    >
                        Cancel
                    </button>
                </>
            )
        });
    };

    const handleSuccessModal = () => {
        showModal({
            title: "Order Placed Successfully!",
            description: "Thank you for your purchase. You will receive a confirmation email shortly.",
            blocking: true,
            icon: <CheckCircle size={48} color="var(--ns-success)" />,
            actions: (
                <button
                    style={{
                        padding: '12px',
                        backgroundColor: 'var(--ns-primary-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        hideModal();
                    }}
                >
                    Return to Shop
                </button>
            )
        });
    };

    const handleAddToCartToast = () => {
        showToast("Premium Cashews added to your cart", "success");
    };

    const handleErrorToast = () => {
        showToast("Failed to update profile", "error");
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', marginBottom: '16px' }}>
                    Notification System Showcase
                </h1>
                <p style={{ color: 'var(--ns-text-secondary)' }}>
                    Test the Modal and Toast components below.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1px))', gap: '24px' }}>
                {/* Modals Section */}
                <div style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Modals</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={handleLoginModal}
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--ns-background)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <LogIn size={20} />
                            <div>
                                <div style={{ fontWeight: '600' }}>Login Required</div>
                                <div style={{ fontSize: '12px', color: 'var(--ns-text-secondary)' }}>Blocking modal example</div>
                            </div>
                        </button>

                        <button
                            onClick={handleSuccessModal}
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--ns-background)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <CheckCircle size={20} color="var(--ns-success)" />
                            <div>
                                <div style={{ fontWeight: '600' }}>Order Success</div>
                                <div style={{ fontSize: '12px', color: 'var(--ns-text-secondary)' }}>Success confirmation modal</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Toasts Section */}
                <div style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Toasts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={handleAddToCartToast}
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--ns-background)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <ShoppingBag size={20} />
                            <div>
                                <div style={{ fontWeight: '600' }}>Add to Cart</div>
                                <div style={{ fontSize: '12px', color: 'var(--ns-text-secondary)' }}>Success toast message</div>
                            </div>
                        </button>

                        <button
                            onClick={handleErrorToast}
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--ns-background)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <AlertTriangle size={20} color="var(--ns-error)" />
                            <div>
                                <div style={{ fontWeight: '600' }}>Error Message</div>
                                <div style={{ fontSize: '12px', color: 'var(--ns-text-secondary)' }}>Error toast example</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationShowcase;
