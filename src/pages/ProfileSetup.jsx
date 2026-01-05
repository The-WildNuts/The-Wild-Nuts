import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, ArrowRight } from 'lucide-react';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // user.token should be available if we are here
        const token = user?.token;

        if (!token) {
            // Should be handled by useEffect, but double check
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userName', formData.username);
                localStorage.setItem('profileComplete', 'true');
                alert('Profile setup complete!');
                navigate('/');  // Redirect to home page
            } else {
                setError(data.detail || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile Update Error:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: '20px'
        }}>
            <div style={{ marginBottom: '30px' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#A8E6A3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <User size={50} color="#2e5c33" />
                </div>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Complete Your Profile
            </h1>
            <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center', maxWidth: '400px' }}>
                Help us personalize your shopping experience
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                {error && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                            Username *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="johndoe"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="1234567890"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                        Address
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address, apartment, etc."
                        rows="2"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1rem',
                            outline: 'none',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Mumbai"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                            State
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Maharashtra"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                            Pincode
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="400001"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
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
                    {loading ? 'Saving...' : 'Complete Setup'}
                    {!loading && <ArrowRight size={20} />}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <span
                        onClick={() => navigate('/')}
                        style={{ color: '#666', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                    >
                        Skip for now
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ProfileSetup;
