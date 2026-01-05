import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { TrendingUp, Users, ShoppingBag, CreditCard, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/wild-nuts-admin';
                    return;
                }
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Format data for chart
    const chartData = stats?.recent_orders?.map(order => ({
        name: new Date(order.Created_At).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        amount: parseInt(String(order.Total_Amount).replace(/\D/g, '')) || 0
    })) || [];

    const statsCards = [
        { title: 'Total Revenue', value: stats ? `₹${stats.revenue.toLocaleString()}` : '...', icon: CreditCard, change: '+12.5%', color: '#10b981' },
        { title: 'Total Orders', value: stats?.orders_count || 0, icon: ShoppingBag, change: '+5.2%', color: '#3b82f6' },
        { title: 'Active Customers', value: stats?.customers_count || 0, icon: Users, change: '+3.1%', color: '#8b5cf6' },
        { title: 'Conversion Rate', value: `${stats?.conversion_rate || 0}%`, icon: TrendingUp, change: '+1.2%', color: '#f59e0b' },
    ];

    if (isLoading) return (
        <AdminLayout>
            <div className="skeleton-loader">Loading Dashboard...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="date-badge">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="kpi-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-title">{stat.title}</span>
                            <div className="kpi-value-row">
                                <span className="kpi-value">{stat.value}</span>
                                <span className="kpi-change">
                                    <ArrowUpRight size={14} /> {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-section">
                <div className="chart-card main-chart">
                    <div className="chart-header">
                        <h3>Revenue Trends</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 30px;
                }
                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 5px 0;
                }
                .page-subtitle {
                    color: #6B7280;
                    font-size: 14px;
                }
                .date-badge {
                    background: #fff;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 30px;
                }

                .kpi-card {
                    background: #fff;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    transition: transform 0.2s;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .kpi-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .kpi-content {
                    flex: 1;
                }

                .kpi-title {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #6B7280;
                    margin-bottom: 4px;
                }

                .kpi-value-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .kpi-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .kpi-change {
                    font-size: 12px;
                    font-weight: 500;
                    color: #10b981; /* Green for growth default */
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    background: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .charts-section {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                }

                .chart-card {
                    background: #fff;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .chart-header {
                    margin-bottom: 20px;
                }
                .chart-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }

                .skeleton-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    color: #9CA3AF;
                    font-weight: 500;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminDashboard;
