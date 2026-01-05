import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Search, ChevronDown, ChevronUp, Copy, Truck, CheckCircle, Package, AlertCircle, XCircle } from 'lucide-react';
import AdminOrderCatalog from './AdminOrderCatalog';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimistic update
                setOrders(orders.map(o =>
                    o.Order_ID === orderId ? { ...o, Tracking_Stage: newStatus } : o
                ));
                alert(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const copyWhatsAppUpdate = (order) => {
        const message = `Hello ${order.User_Name}, update on your order *${order.Order_ID}*:%0a` +
            `Current Status: *${order.Tracking_Stage}* 🚚%0a` +
            `We will keep you posted!`;
        const url = `https://wa.me/${order.Phone_Number || ''}?text=${message}`;

        navigator.clipboard.writeText(url).then(() => {
            alert("WhatsApp URL copied to clipboard!");
        });
        window.open(url, '_blank');
    };

    const toggleRow = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.Order_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.User_Email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const steps = ['Order Placed', 'Confirmed', 'Picked', 'Shipped', 'Delivered'];

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Order Management</h1>
                    <p className="page-subtitle">Track and update customer orders.</p>
                </div>
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Order Catalog Section */}
            <AdminOrderCatalog />

            {/* Orders Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <React.Fragment key={order.Order_ID}>
                                <tr className={`order-row ${expandedRow === order.Order_ID ? 'expanded' : ''}`} onClick={() => toggleRow(order.Order_ID)}>
                                    <td className="font-mono">{order.Order_ID}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <span className="name">{order.User_Name || 'Guest'}</span>
                                            <span className="email">{order.User_Email}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(order.Created_At).toLocaleDateString()}</td>
                                    <td className="font-bold">₹{order.Total_Amount}</td>
                                    <td>
                                        <span className={`status-pill ${order.Tracking_Stage?.toLowerCase().replace(' ', '-')}`}>
                                            {order.Tracking_Stage}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-btn">
                                            {expandedRow === order.Order_ID ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === order.Order_ID && (
                                    <tr className="details-row">
                                        <td colSpan="6">
                                            <div className="details-panel">
                                                <div className="stepper-section">
                                                    <h3>Order Progress</h3>
                                                    <div className="stepper">
                                                        {steps.map((step, idx) => {
                                                            const currentIdx = steps.indexOf(order.Tracking_Stage || 'Order Placed');
                                                            const isCompleted = idx <= currentIdx;
                                                            return (
                                                                <div
                                                                    key={step}
                                                                    className={`step ${isCompleted ? 'completed' : ''}`}
                                                                    onClick={() => handleStatusUpdate(order.Order_ID, step)}
                                                                >
                                                                    <div className="step-circle">
                                                                        {isCompleted && <CheckCircle size={14} />}
                                                                    </div>
                                                                    <span className="step-label">{step}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="actions-section">
                                                    <button className="action-btn whatsapp" onClick={(e) => { e.stopPropagation(); copyWhatsAppUpdate(order); }}>
                                                        <Copy size={16} /> Copy WhatsApp
                                                    </button>
                                                    <button className="action-btn cancel" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.Order_ID, 'Cancelled'); }}>
                                                        <XCircle size={16} /> Cancel Order
                                                    </button>
                                                </div>

                                                <div className="items-section">
                                                    <h3>Items</h3>
                                                    <div className="items-grid">
                                                        {JSON.parse(order.Items || '[]').map((item, i) => (
                                                            <div key={i} className="item-card">
                                                                <img src={item.image} alt={item.name} />
                                                                <div>
                                                                    <p className="item-name">{item.name}</p>
                                                                    <p className="item-meta">{item.quantity} x {item.variant}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }
                .page-subtitle {
                    color: #666;
                    font-size: 14px;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    padding: 10px 16px;
                    border-radius: 50px;
                    border: 1px solid #e1e1e1;
                    gap: 8px;
                    width: 300px;
                }
                .search-bar input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                }

                .orders-table-container {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                .orders-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .orders-table th {
                    text-align: left;
                    padding: 16px;
                    background: #f9fafb;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .order-row {
                    border-bottom: 1px solid #f3f4f6;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .order-row:hover {
                    background: #f9fafb;
                }
                .order-row.expanded {
                    background: #f0fdf4;
                }
                .orders-table td {
                    padding: 16px;
                    font-size: 14px;
                    color: #111827;
                }

                .customer-cell {
                    display: flex;
                    flex-direction: column;
                }
                .customer-cell .name {
                    font-weight: 500;
                }
                .customer-cell .email {
                    font-size: 12px;
                    color: #6b7280;
                }

                .status-pill {
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-pill.order-placed { background: #dbeafe; color: #1e40af; }
                .status-pill.confirmed { background: #d1fae5; color: #065f46; }
                .status-pill.shipped { background: #fef3c7; color: #92400e; }
                .status-pill.delivered { background: #ecfdf5; color: #047857; }
                .status-pill.cancelled { background: #fee2e2; color: #b91c1c; }

                .details-row {
                    background: #f9fafb;
                }
                .details-panel {
                    padding: 20px;
                    display: grid;
                    gap: 24px;
                }

                .stepper {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    margin-top: 10px;
                }
                .stepper::before {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #e5e7eb;
                    z-index: 0;
                }
                .step {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: all 0.2s;
                }
                .step.completed {
                    opacity: 1;
                }
                .step-circle {
                    width: 24px;
                    height: 24px;
                    background: #fff;
                    border: 2px solid #e5e7eb;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 10px;
                }
                .step.completed .step-circle {
                    background: #10b981;
                    border-color: #10b981;
                }
                .step-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #4b5563;
                }

                .actions-section {
                    display: flex;
                    gap: 12px;
                }
                .action-btn {
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .action-btn.whatsapp {
                    background: #25D366;
                    color: #fff;
                }
                .action-btn.cancel {
                    background: #fee2e2;
                    color: #b91c1c;
                }

                .items-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                }
                .item-card {
                    background: #fff;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .item-card img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 6px;
                }
                .item-name {
                    font-size: 13px;
                    font-weight: 500;
                    margin: 0;
                }
                .item-meta {
                    font-size: 11px;
                    color: #6b7280;
                    margin: 2px 0 0 0;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminOrders;
