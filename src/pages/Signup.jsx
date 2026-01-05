
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Mail, Lock } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Determine next step based on response
                // If API returns a token, we could auto-login, but typically we might ask them to login or complete profile
                alert('Registration Successful! Please complete your profile.');

                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('profileComplete', 'false'); // Usually string from backend
                    navigate('/profile-setup');
                } else {
                    navigate('/login');
                }
            } else {
                setError(data.detail || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup Error:', err);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page" style={{
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
                    alt="Join The Wild Nuts"
                    style={{ width: '200px', height: 'auto', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Create Account
            </h1>
            <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
                Join us for exclusive offers and faster checkout
            </p>

            <form onSubmit={handleSignup} style={{ width: '100%', maxWidth: '400px' }}>
                {error && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
                            required
                        />
                        <Mail size={18} color="#999" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
                            required
                        />
                        <Lock size={18} color="#999" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
                            required
                        />
                        <Lock size={18} color="#999" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#5d2b1a',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 10px rgba(93, 43, 26, 0.2)'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                    {!loading && <UserPlus size={20} />}
                </button>

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <span style={{ color: '#666' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: '#5d2b1a', fontWeight: '600', textDecoration: 'none' }}>
                        Login here
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Signup;
