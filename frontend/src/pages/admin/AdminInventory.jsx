import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Tag, Search, Check, X } from 'lucide-react';

// Use same product fetching logic as Shop but simplified
const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Using public endpoint for now, ideally an admin specific one
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleOffer = async (id, currentStatus) => {
        const token = localStorage.getItem('adminToken');
        try {
            const newStatus = !currentStatus;

            // Optimistic update
            setProducts(products.map(p =>
                p.id === id ? { ...p, is_offer: newStatus } : p
            ));

            const response = await fetch(`${API_BASE_URL}/products/${id}/offer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_offer: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update');

        } catch (error) {
            alert('Failed to update offer status');
            fetchProducts(); // Revert
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory & Offers</h1>
                    <p className="page-subtitle">Manage product catalog and special offers.</p>
                </div>
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className={`product-card ${product.is_offer ? 'active-offer' : ''}`}>
                        <div className="offer-badge-wrapper">
                            {product.is_offer && <span className="offer-badge">SPECIAL OFFER</span>}
                        </div>
                        <img src={product.image} alt={product.name} className="product-image" />

                        <div className="product-info">
                            <h3>{product.displayName}</h3>
                            <p className="category">{product.category}</p>

                            <div className="price-row">
                                <span className="price">₹{product.price}</span>
                                <span className="variant-label">Base Price</span>
                            </div>

                            <div className="actions">
                                <button
                                    className={`toggle-btn ${product.is_offer ? 'on' : 'off'}`}
                                    onClick={() => toggleOffer(product.id, product.is_offer)}
                                >
                                    <Tag size={16} />
                                    {product.is_offer ? 'Active Offer' : 'Set Offer'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .page-title { margin: 0; font-size: 24px; font-weight: 700; }
                .page-subtitle { color: #666; font-size: 14px; }

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
                .search-bar input { border: none; outline: none; width: 100%; font-size: 14px; }

                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 20px;
                }

                .product-card {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                    position: relative;
                    border: 1px solid transparent;
                }
                .product-card.active-offer {
                    border-color: #f59e0b;
                    background: #fffbf0;
                }
                .product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }

                .offer-badge-wrapper {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 2;
                    height: 20px;
                }
                .offer-badge {
                    background: #f59e0b;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 4px;
                    letter-spacing: 0.5px;
                }

                .product-image {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                    background: #f3f4f6;
                }

                .product-info {
                    padding: 16px;
                }

                .product-info h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .category {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0 0 12px 0;
                    text-transform: capitalize;
                }

                .price-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .price {
                    font-weight: 700;
                    color: #111827;
                }
                .variant-label {
                    font-size: 10px;
                    color: #9ca3af;
                }

                .actions {
                    display: flex;
                }

                .toggle-btn {
                    flex: 1;
                    padding: 8px;
                    border-radius: 6px;
                    border: none;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .toggle-btn.off {
                    background: #f3f4f6;
                    color: #4b5563;
                }
                .toggle-btn.off:hover {
                    background: #e5e7eb;
                }

                .toggle-btn.on {
                    background: #fef3c7;
                    color: #b45309;
                }
                .toggle-btn.on:hover {
                    background: #fde68a;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminInventory;
