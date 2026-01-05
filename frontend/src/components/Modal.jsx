import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    blocking = false,
    icon = null
}) => {
    const modalRef = useRef(null);
    const previousFocus = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement;
            // Simple focus trap
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
            document.body.style.overflow = 'hidden';
        } else {
            if (previousFocus.current) {
                previousFocus.current.focus();
            }
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !blocking) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, blocking]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !blocking) {
            onClose();
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'ns-fade-in 0.2s ease-out',
        },
        modal: {
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: '380px', // 320-380px requirement
            padding: '24px',
            borderRadius: 'var(--ns-radius)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            margin: '20px',
            transformOrigin: 'center',
            animation: 'ns-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
        },
        header: {
            marginBottom: '16px',
        },
        iconWrapper: {
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
        },
        title: {
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--ns-text-primary)',
            marginBottom: '8px',
        },
        closeButton: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ns-text-secondary)',
            padding: '4px',
            borderRadius: '4px',
            display: blocking ? 'none' : 'flex',
        }
    };

    return createPortal(
        <div style={styles.overlay} onClick={handleOverlayClick} role="presentation">
            <div
                style={styles.modal}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {!blocking && (
                    <button style={styles.closeButton} onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                )}

                {icon && (
                    <div style={styles.iconWrapper}>
                        {icon}
                    </div>
                )}

                <div style={styles.header}>
                    <h2 id="modal-title" style={styles.title}>{title}</h2>
                </div>

                <div style={{ width: '100%', color: 'var(--ns-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
