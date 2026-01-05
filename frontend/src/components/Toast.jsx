import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="var(--ns-success)" />;
            case 'warning': return <AlertTriangle size={20} color="var(--ns-warning)" />;
            case 'error': return <AlertCircle size={20} color="var(--ns-error)" />;
            default: return <CheckCircle size={20} color="var(--ns-success)" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'var(--ns-success)';
            case 'warning': return 'var(--ns-warning)';
            case 'error': return 'var(--ns-error)';
            default: return 'var(--ns-success)';
        }
    };

    const styles = {
        toast: {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#fff',
            color: 'var(--ns-text-primary)',
            padding: '16px',
            borderRadius: 'var(--ns-radius)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            zIndex: 1000,
            animation: 'ns-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            borderLeft: `4px solid ${getBorderColor()}`,
            fontFamily: 'var(--font-main)',
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--ns-text-primary)',
        },
        message: {
            fontSize: '14px',
            color: 'var(--ns-text-secondary)',
            lineHeight: '1.4',
        },
        closeButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--ns-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    };

    return (
        <div style={styles.toast} role="alert">
            <div style={{ marginTop: '0px' }}>
                {getIcon()}
            </div>
            <div style={styles.content}>
                <div style={styles.title}>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div style={styles.message}>{message}</div>
            </div>
            <button onClick={onClose} style={styles.closeButton} aria-label="Close notification">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
