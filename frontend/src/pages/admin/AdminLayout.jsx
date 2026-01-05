import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Megaphone, LogOut, Settings } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/wild-nuts-admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/wild-nuts-admin');
    };

    const navItems = [
        { path: '/wild-nuts-admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/wild-nuts-admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/wild-nuts-admin/marketing', icon: Megaphone, label: 'Email Marketing' },
    ];

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="brand-dot"></div>
                    <h2>WILD NUTS<span className="subtitle">ADMIN</span></h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            <style jsx>{`
                .admin-shell {
                    display: flex;
                    height: 100vh;
                    background: #f8f9fa;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }

                .admin-sidebar {
                    width: 260px;
                    background: #1a1a1a;
                    color: #888;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #333;
                }

                .sidebar-header {
                    padding: 30px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid #333;
                }

                .brand-dot {
                    width: 10px;
                    height: 10px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }

                .sidebar-header h2 {
                    color: #fff;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-header .subtitle {
                    font-size: 10px;
                    color: #666;
                    letter-spacing: 2px;
                    margin-top: 2px;
                }

                .sidebar-nav {
                    padding: 20px 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 30px;
                    color: #888;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    width: 100%;
                }

                .nav-item:hover, .nav-item.active {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.03);
                    border-left-color: #fff;
                }

                .nav-item.logout {
                    color: #ef4444;
                }
                .nav-item.logout:hover {
                    color: #dc2626;
                    border-left-color: #dc2626;
                    background: rgba(220, 38, 38, 0.05);
                }

                .admin-content {
                    flex: 1;
                    overflow-y: auto;
                    background: #f4f5f7;
                }

                .content-wrapper {
                    padding: 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
