import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { fetchProducts } from '../api';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlist, removeFromWishlist } = useAuth();
    const { addToCart } = useCart();
    const { showToast } = useNotification();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlistProducts();
    }, [wishlist]);

    const loadWishlistProducts = async () => {
        setLoading(true);
        try {
            const allProducts = await fetchProducts();

            // Filter products that are in the wishlist
            const wishlistProductIds = wishlist.map(item => item.product_id);
            const wishlistProducts = allProducts.filter(product =>
                wishlistProductIds.includes(String(product.id))
            );

            // Map images for each product (same logic as ProductDetails)
            const productsWithImages = wishlistProducts.map(product => {
                const cat = (product.category || '').toLowerCase().trim();
                const nameLower = (product.name || '').toLowerCase();
                const displayNameLower = (product.displayName || '').toLowerCase();
                const combinedName = nameLower + ' ' + displayNameLower;

                let imageUrl = product.image || '/logo-clean.png';

                // Image mapping logic
                if (cat.includes('almond') || combinedName.includes('almond')) {
                    imageUrl = '/premium_almond.png';
                } else if (cat.includes('cashew') || combinedName.includes('cashew')) {
                    imageUrl = '/premium_cashew.png';
                } else if (cat.includes('pista') || combinedName.includes('pista')) {
                    imageUrl = '/premium_pista.png';
                } else if (cat.includes('walnut') || combinedName.includes('walnut')) {
                    imageUrl = '/premium_walnut.png';
                } else if (cat.includes('date') || combinedName.includes('date')) {
                    imageUrl = '/premium_dates.png';
                } else if (cat.includes('fig') || combinedName.includes('fig')) {
                    imageUrl = '/fig.png';
                } else if (cat.includes('raisin') || combinedName.includes('raisin')) {
                    imageUrl = '/raisin.png';
                } else if (cat.includes('blueberr') || combinedName.includes('blueberr')) {
                    imageUrl = '/blueberry.png';
                } else if (cat.includes('cranberr') || combinedName.includes('cranberr')) {
                    imageUrl = '/cranberry.png';
                } else if (cat.includes('apricot') || combinedName.includes('apricot')) {
                    imageUrl = '/apricot.png';
                } else if (cat.includes('mix') || combinedName.includes('mix')) {
                    imageUrl = '/premium_mixes.png';
                } else if (cat.includes('malt') || combinedName.includes('malt')) {
                    imageUrl = '/premium_abc_malt.png';
                }

                return {
                    ...product,
                    image: imageUrl
                };
            });

            setProducts(productsWithImages);
        } catch (error) {
            console.error('Error loading wishlist products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        await removeFromWishlist(productId);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa'
            }}>
                <Loader2 className="animate-spin" size={40} color="#5d2b1a" />
            </div>
        );
    }

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header removed as per user request */}

            {products.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
                }}>
                    <Heart size={64} color="#e0e0e0" style={{ marginBottom: '20px' }} />
                    <h2 style={{
                        color: '#333',
                        marginBottom: '10px',
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '2rem'
                    }}>
                        Your wishlist is light as air
                    </h2>
                    <p style={{ color: '#888', marginBottom: '30px', fontSize: '1.1rem' }}>
                        Add items you love to keep them close.
                    </p>
                    <button
                        onClick={() => navigate('/shop')}
                        style={{
                            backgroundColor: '#5d2b1a',
                            color: 'white',
                            border: 'none',
                            padding: '12px 35px',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(93, 43, 26, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {products.map(product => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <button
                                className="remove-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(product.id);
                                }}
                                title="Remove from wishlist"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="card-content">
                                <div className="image-container">
                                    <img
                                        src={product.image || '/logo-clean.png'}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/logo-clean.png';
                                        }}
                                    />
                                </div>

                                <h3>{product.displayName || product.name}</h3>

                                <div className="price-row">
                                    <span className="price">
                                        ₹{product.price || product.prices?.['250g'] || 0}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="original-price">
                                            ₹{product.originalPrice}
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="cart-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product, 1, '250g');
                                        showToast('Added to cart!', 'success');
                                    }}
                                >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                :global(body) {
                    background-color: #fafafa;
                }
                .wishlist-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 32px;
                }
                .product-card {
                    background-color: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05); /* Soft, large radius shadow */
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    border: none; /* No heavy borders */
                }
                .product-card:hover {
                    transform: translateY(-8px) scale(1.02); /* Lift and slight scale */
                    box-shadow: 0 30px 60px rgba(0,0,0,0.08); /* Deepen shadow */
                }
                .remove-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background-color: transparent;
                    border: 1px solid #eee;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    color: #999;
                    transition: all 0.2s;
                }
                .remove-btn:hover {
                    background-color: #fff0f0;
                    border-color: #ff4444;
                    color: #ff4444;
                    transform: scale(1.1);
                }
                .card-content {
                    padding: 20px;
                }
                .image-container {
                    width: 100%;
                    aspect-ratio: 1 / 1; /* Square ratio */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #fff; /* Match seamless look */
                    border-radius: 12px;
                    margin-bottom: 20px;
                    padding: 10px;
                }
                .image-container img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }
                .product-card:hover .image-container img {
                    transform: scale(1.05);
                }
                h3 {
                    font-size: 1.15rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 15px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2; /* Truncate 2 lines */
                    -webkit-box-orient: vertical;
                    min-height: 2.5em; /* Maintain aligned height */
                    font-family: 'Inter', sans-serif;
                    line-height: 1.3;
                }
                .price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .price {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #2e7d32; /* Deep forest green */
                    font-family: 'Outfit', sans-serif;
                }
                .original-price {
                    font-size: 0.95rem;
                    color: #999;
                    text-decoration: line-through;
                }
                .cart-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #5d2b1a 0%, #741d1d 100%); /* Gradient brand color */
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 50px; /* Pill shape */
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(116, 29, 29, 0.2);
                }
                .cart-btn:hover {
                    box-shadow: 0 6px 20px rgba(116, 29, 29, 0.3);
                    transform: translateY(-2px);
                }

                @media (max-width: 1200px) {
                    .wishlist-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 900px) {
                    .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .wishlist-grid { grid-template-columns: 1fr; }
                    h1 { font-size: 2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Wishlist;
