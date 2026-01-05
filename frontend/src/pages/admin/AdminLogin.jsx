import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ChevronRight } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [securityKey, setSecurityKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) navigate('/wild-nuts-admin/dashboard');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, security_key: securityKey }) // Note: security_key, not securityKey in payload
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Access Denied');
            }

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                navigate('/wild-nuts-admin/dashboard');
                // alert('ACCESS GRANTED: Secure Session Established.');
            }
        } catch (err) {
            console.error(err);
            setError('ACCESS DENIED: Invalid Credentials');
            // Shake effect logic would go here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-gateway">
            <div className="gateway-container">
                <div className="login-card">
                    <div className="icon-wrapper">
                        <div className="glow-ring"></div>
                        <ShieldCheck size={40} className="shield-icon" />
                    </div>

                    <h1 className="gateway-title">SECURE GATEWAY</h1>
                    <p className="gateway-subtitle">Restricted Access Portal</p>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label>ADMIN EMAIL</label>
                            <input
                                type="email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="name@company.com"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label>PASSWORD</label>
                            <input
                                type="password"
                                value={securityKey}
                                onChange={(e) => setSecurityKey(e.target.value)}
                                placeholder="••••••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <button
                            type="submit"
                            className={`access-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            <span>{isLoading ? 'VERIFYING...' : 'INITIATE SESSION'}</span>
                            {!isLoading && <ChevronRight size={18} />}
                        </button>
                    </form>
                </div>

                <div className="security-badge">
                    <Lock size={12} />
                    <span>256-BIT ENCRYPTED CONNECTION</span>
                </div>
            </div>

            <style jsx>{`
                .admin-gateway {
                    min-height: 100vh;
                    width: 100vw;
                    background-color: #050505;
                    background-image: 
                        radial-gradient(circle at 50% 0%, #1a1a1a 0%, transparent 60%),
                        radial-gradient(circle at 80% 90%, #0a0a0a 0%, transparent 40%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    color: #fff;
                    overflow: hidden;
                    position: relative;
                }

                /* Subtle grid overlay */
                .admin-gateway::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.5;
                    pointer-events: none;
                }

                .gateway-container {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 30px;
                    width: 100%;
                    max-width: 420px;
                    padding: 20px;
                }

                .login-card {
                    width: 100%;
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    transition: transform 0.3s ease;
                }

                .icon-wrapper {
                    position: relative;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .shield-icon {
                    color: #fff;
                    position: relative;
                    z-index: 2;
                }

                .glow-ring {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
                    filter: blur(10px);
                    z-index: 1;
                    animation: pulse 3s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 0.2; }
                    100% { transform: scale(1); opacity: 0.5; }
                }

                .gateway-title {
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 4px;
                    color: #fff;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                }

                .gateway-subtitle {
                    font-size: 13px;
                    color: #666;
                    margin: 0 0 35px 0;
                    font-weight: 400;
                }

                .login-form {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-group label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #444;
                    margin-left: 4px;
                }

                .input-group input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    font-family: 'Inter', monospace; /* Monospace for security vibe */
                }

                .input-group input:focus {
                    border-color: rgba(255, 255, 255, 0.3);
                    background: rgba(0, 0, 0, 0.5);
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
                }

                .input-group input::placeholder {
                    color: #333;
                }

                .error-msg {
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    color: #ef4444;
                    font-size: 12px;
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                }

                .access-btn {
                    margin-top: 10px;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }

                .access-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                }

                .access-btn:active {
                    transform: translateY(0);
                }

                .access-btn.loading {
                    background: #333;
                    color: #888;
                    cursor: wait;
                }

                .security-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #333;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    opacity: 0.7;
                }

            `}</style>
        </div>
    );
};

export default AdminLogin;
