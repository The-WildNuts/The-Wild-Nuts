import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, MapPin, Edit2, LogOut, Save } from 'lucide-react';

const Account = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser, loading: authLoading } = useAuth();
    const { clearCart } = useCart();
    const [profileData, setProfileData] = useState(null); // Local state for fresh profile data
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
            } else {
                fetchUserData();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]);

    const fetchUserData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            setDataLoading(true);
            setError(null);

            // Fetch user profile
            const profileResponse = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (profileResponse.ok) {
                const userData = await profileResponse.json();

                // Update local profile data state
                setProfileData(userData);

                // Sync to global context immediately
                updateUser({
                    username: userData.username,
                    full_name: userData.full_name,
                    phone: userData.phone,
                    city: userData.city,
                    state: userData.state,
                    address: userData.address,
                    pincode: userData.pincode
                });

                setFormData({
                    username: userData.username || '',
                    full_name: userData.full_name || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    city: userData.city || '',
                    state: userData.state || '',
                    pincode: userData.pincode || ''
                });

                // Auto-edit if profile incomplete
                if (!userData.profile_complete) {
                    setIsEditing(true);
                }
            } else if (profileResponse.status === 401 || profileResponse.status === 404) {
                localStorage.clear();
                navigate('/login');
                return;
            } else {
                let errorMsg = 'Failed to load profile data';
                try {
                    const errorData = await profileResponse.json();
                    if (errorData.detail) errorMsg = errorData.detail;
                } catch (e) {
                    console.error('Failed to parse error response', e);
                }
                setError(errorMsg);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Network error. Please try again.');
        } finally {
            setDataLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        clearCart();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Profile Updated Successfully!');
                setIsEditing(false);
                fetchUserData(); // Refresh user data
                // Update global context
                updateUser({
                    username: formData.username,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    city: formData.city,
                    state: formData.state,
                    address: formData.address,
                    pincode: formData.pincode
                });
            } else {
                const data = await response.json();
                alert(data.detail || 'Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile.');
        }
    };

    if (authLoading || dataLoading) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
            }}>
                <h2 style={{ color: '#741d1d' }}>{error}</h2>
                <button
                    onClick={fetchUserData}
                    style={{
                        padding: '10px 20px',
                        background: '#5d2b1a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Profile Card */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                marginBottom: '30px'
            }}>
                <div style={{
                    backgroundColor: '#5d2b1a',
                    padding: '30px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#5d2b1a',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={40} />}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
                                {user.username || user.full_name || 'Member'}
                            </h1>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>
                                {user.username ? `@${user.username}` : user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>Personal Details</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    background: 'none',
                                    border: '1px solid #ddd',
                                    padding: '8px 15px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#555'
                                }}
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="1234567890"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="Maharashtra"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>Pincode</label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                                    placeholder="400001"
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', minHeight: '80px' }}
                                    placeholder="Street address, apartment, etc."
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#A8E6A3',
                                        color: '#2e5c33',
                                        border: 'none',
                                        padding: '12px 25px',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <Save size={18} /> Save Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        padding: '12px 25px',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Email</label>
                                <div style={{
                                    fontSize: '1.1rem',
                                    color: '#333',
                                    fontWeight: '500',
                                    wordBreak: 'break-all',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>{profileData?.email || user.email}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Username</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{profileData?.username || user.username || '-'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Phone</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{profileData?.phone || user.phone || '-'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>City</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{profileData?.city || user.city || '-'}</div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Address</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <MapPin size={18} color="#5d2b1a" style={{ marginTop: '3px' }} />
                                    {profileData?.address || user.address || 'No address added'}
                                    {/* Construct full address string if available */}
                                    {(profileData?.city || user.city) && (profileData?.state || user.state) && `, ${profileData?.city || user.city}, ${profileData?.state || user.state}`}
                                    {(profileData?.pincode || user.pincode) && ` - ${profileData?.pincode || user.pincode}`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;
