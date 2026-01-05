import React, { useState } from 'react';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube, Linkedin, Heart, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscriberEmail, setSubscriberEmail] = useState('');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success || res.ok) {
                setSubscriberEmail(email);
                setShowPopup(true);
                e.target.reset();

                // Auto redirect to home after 3 seconds
                setTimeout(() => {
                    setShowPopup(false);
                    navigate('/');
                }, 3000);
            } else {
                alert(data.detail || 'Subscription failed. Please try again.');
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Success Popup Modal */}
            {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setShowPopup(false)}>
                            <X size={20} />
                        </button>
                        <div className="popup-icon">
                            <CheckCircle size={64} color="#10b981" />
                        </div>
                        <h2>Welcome to The Wild Nuts Family! 🎉</h2>
                        <p className="popup-message">
                            Thank you for subscribing, <strong>{subscriberEmail}</strong>!
                        </p>
                        <p className="popup-submessage">
                            You'll now receive exclusive updates on new products, special offers, and nutty deals directly to your inbox.
                        </p>
                        <div className="popup-redirect">
                            Redirecting to home page...
                        </div>
                    </div>
                </div>
            )}

            <footer className="main-footer">
                <div className="newsletter-section">
                    <div className="footer-container">
                        <div className="newsletter-content">
                            <h3>Subscribe to our newsletter for updates and special offers!</h3>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Enter Your Email"
                                    required
                                    disabled={isSubmitting}
                                />
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="footer-main">
                    <div className="footer-container">
                        <div className="footer-grid">
                            <div className="footer-brand">
                                <div className="footer-logo">
                                    <h2 className="logo-text">THE WILD NUTS</h2>
                                    <p className="logo-tagline">PASSION FOR NUTRITION</p>
                                    <p className="since-text">SINCE 2024</p>
                                </div>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <MapPin size={18} />
                                        <span>21/4 Upputhottam, Annur, Coimbatore - 641653</span>
                                    </div>
                                    <div className="contact-item">
                                        <Phone size={18} />
                                        <span>+91 877-8699084</span>
                                    </div>
                                    <div className="contact-item">
                                        <Mail size={18} />
                                        <span>connectwiththewildnuts@gmail.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="footer-links">
                                <div className="link-column">
                                    <h4>Shop & Account</h4>
                                    <ul>
                                        <li><a href="/">Home</a></li>
                                        <li><a href="/shop">Shop All Products</a></li>
                                        <li><a href="/account">My Profile</a></li>
                                        <li><a href="/orders">My Orders</a></li>
                                        <li><a href="/wishlist">Wishlist</a></li>
                                        <li><a href="/cart">Shopping Cart</a></li>
                                    </ul>
                                </div>
                                <div className="link-column">
                                    <h4>Follow Us</h4>
                                    <ul>
                                        <li>
                                            <a href="https://www.instagram.com/the_wildnuts?igsh=NDBzbWF0b205emp1&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Instagram size={18} /> Instagram
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-legal">
                    <div className="footer-container">
                        <div className="legal-content">
                            <p>© 2024 The Wild Nuts - All rights reserved.</p>
                            <p className="made-with">Made with <Heart size={14} fill="#ff4081" color="#ff4081" /> in India</p>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                .main-footer {
                    background-color: #000;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }
                .footer-container {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 40px;
                }
                .newsletter-section {
                    background-color: #000;
                    padding: 40px 0;
                    border-bottom: 1px solid #333;
                }
                .newsletter-content {
                    text-align: center;
                }
                .newsletter-content h3 {
                    font-size: 20px;
                    font-weight: 500;
                    margin-bottom: 25px;
                }
                .newsletter-form {
                    display: flex;
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #fff;
                    border-radius: 50px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                }
                .newsletter-form input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 15px 30px;
                    font-size: 16px;
                }
                .newsletter-form button {
                    background-color: #fff;
                    color: #000;
                    border: none;
                    padding: 15px 40px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .newsletter-form button:hover {
                    background-color: #f7941d;
                    color: #fff;
                }

                .footer-main {
                    padding: 60px 0;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 3fr;
                    gap: 60px;
                    margin-bottom: 40px;
                }
                .footer-brand .logo-text {
                    font-size: 32px;
                    font-weight: 900;
                    margin-bottom: 5px;
                    letter-spacing: 2px;
                }
                .footer-brand .logo-tagline {
                    font-size: 14px;
                    letter-spacing: 3px;
                    color: #888;
                }
                .footer-brand .since-text {
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                    margin-bottom: 30px;
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    color: #ccc;
                    font-size: 14px;
                }
                .contact-item span {
                    line-height: 1.4;
                }

                .footer-links {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                }
                .link-column h4 {
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 25px;
                    color: #fff;
                }
                .link-column ul {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .link-column a {
                    color: #aaa;
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.3s;
                }
                .link-column a:hover {
                    color: #fff;
                    padding-left: 5px;
                }

                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #333;
                    margin-top: 40px;
                    padding-top: 40px;
                }
                .certifications {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .fssai-badge {
                    border: 2px solid #fff;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-weight: 900;
                    font-style: italic;
                    font-size: 14px;
                }
                .fssai-text p {
                    font-size: 12px;
                    color: #888;
                    margin: 2px 0;
                }
                .social-links {
                    display: flex;
                    gap: 20px;
                }
                .social-links a {
                    color: #888;
                    transition: all 0.3s;
                }
                .social-links a:hover {
                    color: #fff;
                    transform: translateY(-3px);
                }

                .footer-legal {
                    padding: 20px 0;
                    background-color: #111;
                    border-top: 1px solid #222;
                }
                .legal-content {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    color: #666;
                }
                .made-with {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .footer-links {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .footer-container {
                        padding: 0 20px;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        gap: 30px;
                        text-align: center;
                    }
                    .newsletter-form {
                        flex-direction: column;
                        border-radius: 20px;
                    }
                    .newsletter-form button {
                        width: 100%;
                    }
                }

                /* Popup Modal Styles */
                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .popup-content {
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s ease;
                }
                .popup-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 5px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .popup-close:hover {
                    background: #f3f4f6;
                    color: #000;
                }
                .popup-icon {
                    margin-bottom: 20px;
                    animation: scaleIn 0.5s ease 0.2s both;
                }
                .popup-content h2 {
                    color: #111;
                    font-size: 24px;
                    margin-bottom: 15px;
                    font-weight: 700;
                }
                .popup-message {
                    color: #374151;
                    font-size: 16px;
                    margin-bottom: 10px;
                    line-height: 1.6;
                }
                .popup-message strong {
                    color: #10b981;
                }
                .popup-submessage {
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }
                .popup-redirect {
                    color: #9ca3af;
                    font-size: 13px;
                    font-style: italic;
                    animation: pulse 1.5s ease infinite;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                    }
                    to {
                        transform: scale(1);
                    }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            </footer>
        </>
    );
};

export default Footer;
