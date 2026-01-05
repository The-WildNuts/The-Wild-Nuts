import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, content: null });

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        // Add logic to avoid duplicates if needed, for now replace current
        setToast({ message, type, duration, id: Date.now() });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const showModal = useCallback((contentProps) => {
        setModal({
            isOpen: true,
            ...contentProps
        });
    }, []);

    const hideModal = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
        // Optional: timeout to clear content after animation
        setTimeout(() => setModal({ isOpen: false, content: null }), 300);
    }, []);

    return (
        <NotificationContext.Provider value={{ showToast, hideToast, showModal, hideModal }}>
            {children}

            {/* Global Toast Container */}
            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={hideToast}
                />
            )}

            {/* Global Modal Container */}
            <Modal
                isOpen={modal.isOpen}
                onClose={hideModal}
                title={modal.title}
                blocking={modal.blocking}
                icon={modal.icon}
            >
                {modal.content || modal.description}

                {/* Render Actions if provided */}
                {modal.actions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px', width: '100%' }}>
                        {modal.actions}
                    </div>
                )}
            </Modal>
        </NotificationContext.Provider>
    );
};
