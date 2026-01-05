import React, { useState, useEffect } from 'react';
import { MessageCircle, Edit2, Clock, Calendar, TrendingUp, Package, ChevronDown, ChevronUp } from 'lucide-react';

const AdminOrderCatalog = () => {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: []
    });
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [editingOrder, setEditingOrder] = useState(null);
    const [isListCollapsed, setIsListCollapsed] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Extract orders array from response
                const ordersArray = data.orders || data || [];
                groupOrdersByTime(ordersArray);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const groupOrdersByTime = (allOrders) => {
        const now = new Date();

        // Get start of today (midnight) in local timezone
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        // Get start of yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get start of last week (7 days ago)
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Get start of last month (30 days ago)
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);

        const grouped = {
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: []
        };

        allOrders.forEach(order => {
            // Parse the order date
            const orderDate = new Date(order.Created_At);

            // Reset time to start of day for accurate comparison
            const orderDayStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 0, 0, 0, 0);

            // Use getTime() for accurate comparison
            const orderTime = orderDayStart.getTime();
            const todayTime = today.getTime();
            const yesterdayTime = yesterday.getTime();
            const lastWeekTime = lastWeek.getTime();
            const lastMonthTime = lastMonth.getTime();

            if (orderTime >= todayTime) {
                grouped.today.push(order);
            } else if (orderTime >= yesterdayTime) {
                grouped.yesterday.push(order);
            } else if (orderTime >= lastWeekTime) {
                grouped.lastWeek.push(order);
            } else if (orderTime >= lastMonthTime) {
                grouped.lastMonth.push(order);
            }
        });

        setGroupedOrders(grouped);
        setOrders(allOrders);
    };

    const handleStatusToggle = async (orderId, currentStatus) => {
        const newStatus = currentStatus === 'Delivered' ? 'Order Placed' : 'Delivered';
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
                fetchOrders();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getWhatsAppLink = (phone, name, orderId) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Hi ${name}, this is The WildNuts confirming your order ${orderId}. Thank you for choosing us!`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower === 'delivered') return '#10b981';
        if (statusLower === 'cancelled') return '#ef4444';
        return '#fcd34d';
    };

    const periods = [
        { key: 'today', label: "Today's Orders", icon: Clock, color: '#10b981' },
        { key: 'yesterday', label: 'Yesterday', icon: Calendar, color: '#3b82f6' },
        { key: 'lastWeek', label: 'Last Week', icon: TrendingUp, color: '#8b5cf6' },
        { key: 'lastMonth', label: 'Last Month', icon: Package, color: '#f59e0b' }
    ];

    const OrderRow = ({ order }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const status = order.Tracking_Stage || 'Order Placed';
        const isCompleted = status.toLowerCase() === 'delivered';

        if (!isExpanded) {
            // Compact row - click to expand
            return (
                <div
                    className="order-row-compact"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="compact-left">
                        <span className="compact-name">{order.Name || 'Customer'}</span>
                        <span className="compact-time">
                            {new Date(order.Created_At).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="compact-right">
                        <span className="compact-id">#{order.Order_ID}</span>
                        <span className="compact-amount">₹{order.Total_Amount}</span>
                        <span
                            className="compact-status"
                            style={{ background: getStatusColor(status) }}
                        >
                            {isCompleted ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>
            );
        }

        // Expanded full box - click to collapse
        return (
            <div className="order-row-expanded">
                <div className="order-header">
                    <div className="customer-info">
                        <span className="customer-name">{order.Name || 'Customer'}</span>
                        <span className="order-time">
                            {new Date(order.Created_At).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    <div className="order-preview">
                        <span className="order-id-preview">#{order.Order_ID}</span>
                        <span className="order-amount-preview">₹{order.Total_Amount}</span>
                        <button
                            className="close-btn"
                            onClick={() => setIsExpanded(false)}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="order-details-box">
                    <div className="order-actions">
                        <a
                            href={getWhatsAppLink(order.Phone || '', order.Name || '', order.Order_ID)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-btn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MessageCircle size={16} />
                            <span>{order.Phone || 'N/A'}</span>
                        </a>

                        <button
                            className={`status-toggle ${isCompleted ? 'completed' : 'pending'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusToggle(order.Order_ID, status);
                            }}
                            style={{ background: getStatusColor(status) }}
                        >
                            {isCompleted ? 'Completed' : 'Pending'}
                        </button>

                        <button
                            className="edit-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingOrder(order);
                            }}
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const selectedOrders = groupedOrders[selectedPeriod] || [];

    return (
        <div className="order-catalog">
            <div className="catalog-header">
                <h2>Order Catalog</h2>
                <p>Manage and track orders by time period</p>
            </div>

            {/* Period Cards */}
            <div className="period-cards">
                {periods.map((period) => {
                    const count = groupedOrders[period.key]?.length || 0;
                    const isActive = selectedPeriod === period.key;

                    return (
                        <div
                            key={period.key}
                            className={`period-card ${isActive ? 'active' : ''}`}
                        >
                            <div
                                className="period-card-content"
                                onClick={() => {
                                    setSelectedPeriod(period.key);
                                    setIsListCollapsed(false); // Show orders when switching period
                                }}
                            >
                                <div className="period-icon" style={{ background: `${period.color}20`, color: period.color }}>
                                    <period.icon size={24} />
                                </div>
                                <div className="period-content">
                                    <span className="period-label">{period.label}</span>
                                    <div className="period-value-row">
                                        <span className="period-value">{count}</span>
                                        <span className="period-change">orders</span>
                                    </div>
                                </div>
                            </div>
                            {isActive && (
                                <button
                                    className="card-collapse-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsListCollapsed(!isListCollapsed);
                                    }}
                                    title={isListCollapsed ? "Show orders" : "Hide orders"}
                                >
                                    {isListCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Orders List */}
            {!isListCollapsed && (
                <div className="orders-section">
                    <div className="section-header">
                        <h3>{periods.find(p => p.key === selectedPeriod)?.label}</h3>
                        <span className="order-count">{selectedOrders.length} orders</span>
                    </div>

                    <div className="orders-list">
                        {selectedOrders.length === 0 ? (
                            <div className="empty-state">No orders in this period</div>
                        ) : (
                            selectedOrders.map(order => (
                                <OrderRow key={order.Order_ID} order={order} />
                            ))
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .order-catalog {
                    margin-top: 30px;
                }

                .catalog-header {
                    margin-bottom: 24px;
                }

                .catalog-header h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px 0;
                }

                .catalog-header p {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0;
                }

                .period-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 30px;
                }

                .period-card {
                    background: #fff;
                    padding: 20px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                    position: relative;
                }

                .period-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .period-card.active {
                    border-color: #10b981;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
                }

                .period-card-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    cursor: pointer;
                }

                .card-collapse-btn {
                    background: #f3f4f6;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #6b7280;
                    transition: all 0.2s;
                    align-self: flex-end;
                }

                .card-collapse-btn:hover {
                    background: #10b981;
                    color: white;
                }

                .period-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .period-content {
                    flex: 1;
                }

                .period-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .period-value-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .period-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .period-change {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                }

                .orders-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .section-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }

                .order-count {
                    background: #e5e7eb;
                    color: #6b7280;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* Compact Row Styles */
                .order-row-compact {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .order-row-compact:hover {
                    background: #fff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    transform: translateX(4px);
                }

                .compact-left {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .compact-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #111827;
                }

                .compact-time {
                    font-size: 12px;
                    color: #9ca3af;
                }

                .compact-right {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .compact-id {
                    font-size: 12px;
                    color: #6b7280;
                    font-family: monospace;
                }

                .compact-amount {
                    font-size: 14px;
                    font-weight: 700;
                    color: #10b981;
                }

                .compact-status {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #111827;
                }

                /* Expanded Row Styles */
                .order-row-expanded {
                    background: #fff;
                    border: 2px solid #10b981;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
                    animation: expandBox 0.3s ease-out;
                }

                @keyframes expandBox {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f0fdf4;
                }

                .customer-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .customer-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                }

                .order-time {
                    font-size: 13px;
                    color: #6b7280;
                }

                .order-preview {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .order-id-preview {
                    font-size: 13px;
                    color: #6b7280;
                    font-family: monospace;
                }

                .order-amount-preview {
                    font-size: 15px;
                    font-weight: 700;
                    color: #10b981;
                }

                .close-btn {
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    margin-left: 12px;
                }

                .close-btn:hover {
                    background: #dc2626;
                    color: white;
                    transform: scale(1.1);
                }

                .order-details-box {
                    padding: 16px;
                    background: #fff;
                    border-top: 1px solid #e5e7eb;
                }

                .order-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .whatsapp-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: #25d366;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .whatsapp-btn:hover {
                    background: #20ba5a;
                }

                .status-toggle {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #111827;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .status-toggle:hover {
                    opacity: 0.9;
                    transform: scale(1.05);
                }

                .edit-btn {
                    padding: 8px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .edit-btn:hover {
                    background: #e5e7eb;
                    color: #111827;
                }

                .empty-state {
                    text-align: center;
                    padding: 48px;
                    color: #9ca3af;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default AdminOrderCatalog;
