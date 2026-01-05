import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Send, Users, CheckCircle, AlertCircle } from 'lucide-react';

const AdminMarketing = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchSubscribers = async () => {
            const token = localStorage.getItem('adminToken');
            try {
                const res = await fetch(`${API_BASE_URL}/admin/subscribers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSubscribers(data);
                }
            } catch (err) {
                console.error("Failed to fetch subscribers", err);
            }
        };
        fetchSubscribers();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!confirm(`Are you sure you want to send this email to ${subscribers.length} subscribers?`)) return;

        setIsSending(true);
        setStatus(null);

        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_BASE_URL}/marketing/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, content })
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', message: `Campaign sent successfully to ${data.sent_count} subscribers!` });
                setSubject('');
                setContent('');
            } else {
                setStatus({ type: 'error', message: data.detail || 'Failed to send campaign' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error occurred' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Email Marketing</h1>
                    <p className="page-subtitle">Engage with your subscribers.</p>
                </div>
            </div>

            <div className="marketing-grid">
                <div className="composer-card">
                    <div className="card-header">
                        <h3>New Campaign</h3>
                    </div>
                    <form onSubmit={handleSend} className="composer-form">
                        <div className="form-group">
                            <label>Subject Line</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Special Weekend Offer: 20% Off Cashews!"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Content (HTML)</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="<p>Hello Nut Lovers!</p><p>Check out our latest deals...</p>"
                                rows={12}
                                required
                            />
                            <small className="hint">Basic HTML tags supported for styling.</small>
                        </div>

                        {status && (
                            <div className={`status-message ${status.type}`}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {status.message}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="send-btn" disabled={isSending || subscribers.length === 0}>
                                {isSending ? 'Sending...' : (
                                    <>
                                        <Send size={18} /> Send Campaign
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="audience-card">
                    <div className="audience-header">
                        <div className="icon-box">
                            <Users size={24} color="#10b981" />
                        </div>
                        <div>
                            <span className="audience-label">Total Subscribers</span>
                            <span className="audience-count">{subscribers.length}</span>
                        </div>
                    </div>
                    <div className="subscribers-list">
                        <h4>Recent Signups</h4>
                        {subscribers.length === 0 ? (
                            <p className="empty-text">No subscribers yet.</p>
                        ) : (
                            <ul>
                                {subscribers.slice(-10).reverse().map((sub, i) => (
                                    <li key={i}>
                                        <span className="sub-email">{sub.Email}</span>
                                        <span className="sub-date">{new Date(sub.Joined_At).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .marketing-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }

                .composer-card, .audience-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }

                .card-header {
                    padding: 24px;
                    border-bottom: 1px solid #f3f4f6;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                }

                .composer-form {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 6px;
                }

                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #111827;
                    transition: border-color 0.2s;
                }
                .form-group input::placeholder, .form-group textarea::placeholder {
                    color: #9ca3af;
                }
                .form-group input:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #f59e0b;
                    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
                }

                .hint {
                    display: block;
                    margin-top: 6px;
                    font-size: 12px;
                    color: #6b7280;
                }

                .send-btn {
                    background: #111827;
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                .send-btn:hover:not(:disabled) {
                    background: #000;
                }
                .send-btn:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                .status-message {
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .status-message.success {
                    background: #ecfdf5;
                    color: #065f46;
                }
                .status-message.error {
                    background: #fef2f2;
                    color: #991b1b;
                }

                .audience-card {
                    padding: 24px;
                }
                .audience-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #f3f4f6;
                }
                .icon-box {
                    width: 48px;
                    height: 48px;
                    background: #ecfdf5;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .audience-label {
                    display: block;
                    font-size: 13px;
                    color: #6b7280;
                }
                .audience-count {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .subscribers-list h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin: 0 0 12px 0;
                }
                .subscribers-list ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .subscribers-list li {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 13px;
                }
                .subscribers-list li:last-child {
                    border-bottom: none;
                }
                .sub-email {
                    color: #111827;
                    font-weight: 500;
                    max-width: 180px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .sub-date {
                    color: #9ca3af;
                }
                .empty-text {
                    color: #9ca3af;
                    font-style: italic;
                    font-size: 13px;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminMarketing;
