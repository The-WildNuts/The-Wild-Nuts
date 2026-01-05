import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login', 'forgot', 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login(email, password);

            if (result.success) {
                alert('Login Successful!');
                if (!result.profileComplete) {
                    navigate('/profile-setup');
                } else {
                    navigate('/');
                }
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Login failed. Please check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                setMode('reset');
                alert(`OTP sent to ${email} (Check console in test mode)`);
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to send OTP.');
            }
        } catch (error) {
            console.error('OTP Request Error:', error);
            alert('Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                    new_password: newPassword
                })
            });

            if (response.ok) {
                alert('Password Reset Successfully! Please Login.');
                setMode('login');
                setPassword('');
                setOtp('');
                setNewPassword('');
            } else {
                const err = await response.json();
                alert(err.detail || 'Reset failed.');
            }
        } catch (error) {
            console.error(error);
            alert('Error resetting password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: '20px'
        }}>

            <div style={{ marginBottom: '30px' }}>
                <img
                    src="/login-illustration.png"
                    alt="Login Security"
                    style={{ width: '250px', height: 'auto', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                {mode === 'login' ? 'Login' : (mode === 'forgot' ? 'Forgot Password?' : 'Reset Password')}
            </h1>
            <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
                {mode === 'login' ? 'Enter your email and password' :
                    (mode === 'forgot' ? 'Enter your email to receive OTP' : 'Enter OTP and new password')}
            </p>

            <form onSubmit={
                mode === 'login' ? handleLogin :
                    (mode === 'forgot' ? handleRequestReset : handleResetPassword)
            } style={{ width: '100%', maxWidth: '400px' }}>

                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="email"
                        placeholder="Email Id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
                        required
                    />
                </div>

                {mode === 'login' && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
                                required
                            />
                            <Lock size={18} color="#999" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <span
                                onClick={() => setMode('forgot')}
                                style={{ color: '#5d2b1a', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>
                )}

                {mode === 'reset' && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', textAlign: 'center', letterSpacing: '4px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                required
                            />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#A8E6A3',
                        color: '#2e5c33',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    {loading ? 'Processing...' : (
                        mode === 'login' ? 'Login' :
                            (mode === 'forgot' ? 'Request OTP' : 'Reset & Login')
                    )}
                    {!loading && <ArrowRight size={20} />}
                </button>

                {mode === 'forgot' && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <span onClick={() => setMode('login')} style={{ color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>
                            Back to Login
                        </span>
                    </div>
                )}

                {mode === 'login' && (
                    <div style={{ marginTop: '25px', textAlign: 'center' }}>
                        <span style={{ color: '#666' }}>Don't have an account? </span>
                        <Link to="/signup" style={{ color: '#5d2b1a', fontWeight: '600', textDecoration: 'none' }}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </form>

            <p style={{ marginTop: '40px', fontSize: '0.8rem', color: '#888', textAlign: 'center', maxWidth: '350px' }}>
                By logging in, you accept our <a href="#" style={{ color: '#333' }}>Privacy Policy</a>.
            </p>
        </div>
    );
};

export default Login;
