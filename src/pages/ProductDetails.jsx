import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProducts } from '../api';
import { Loader2, Plus, Minus, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(0);

    const [variants, setVariants] = useState([]);

    // Wishlist functionality
    const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            alert('Please login to save products to your wishlist');
            navigate('/login');
            return;
        }

        if (isInWishlist(id)) {
            await removeFromWishlist(id);
        } else {
            await addToWishlist(id);
        }
    };

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            const productsData = await fetchProducts();

            // Merge mocks with sheet data
            // STRICT MODE: Only use API items
            let allProducts = [];
            if (Array.isArray(productsData)) {
                allProducts = productsData;
            }
            const foundProduct = allProducts.find(p => String(p.id) === id);

            if (foundProduct) {
                // Generate variants from product prices
                const v = [];
                const addVariant = (size, price) => {
                    v.push({
                        size,
                        salePrice: price,
                        originalPrice: Math.round(price * 1.10)
                    });
                };

                if (foundProduct.prices['100g']) addVariant('100g', foundProduct.prices['100g']);
                if (foundProduct.prices['250g']) addVariant('250g', foundProduct.prices['250g']);
                if (foundProduct.prices['500g']) addVariant('500g', foundProduct.prices['500g']);
                if (foundProduct.prices['1kg']) addVariant('1kg', foundProduct.prices['1kg']);

                // Fallback if no specific prices found
                if (v.length === 0) {
                    addVariant('250g', foundProduct.price);
                }

                setVariants(v);

                // Image Mapping Logic
                const cat = (foundProduct.category || '').toLowerCase().trim();
                const nameLower = (foundProduct.name || '').toLowerCase();
                const displayNameLower = (foundProduct.displayName || '').toLowerCase();
                const combinedName = nameLower + ' ' + displayNameLower;

                let mappedImg = null;
                if (cat.includes('almond') || combinedName.includes('almond')) {
                    mappedImg = '/pouch_almond.png';
                } else if (cat.includes('walnut') || combinedName.includes('walnut')) {
                    mappedImg = '/pouch_walnut.png';
                } else if (cat.includes('cashew') || combinedName.includes('cashew')) {
                    mappedImg = '/pouch_cashew.png';
                } else if (cat.includes('pistachio') || cat.includes('pista') || combinedName.includes('pista')) {
                    mappedImg = '/pouch_pista.png';
                } else if (cat.includes('date') || combinedName.includes('date')) {
                    // Specific Dates Logic
                    if (combinedName.includes('black')) {
                        mappedImg = '/pouch_dates_black.png';
                    } else if (combinedName.includes('dry') || combinedName.includes('yellow')) {
                        mappedImg = '/pouch_dates_dry.png';
                    } else if (combinedName.includes('seedless')) {
                        mappedImg = '/pouch_dates.png';
                    } else {
                        mappedImg = '/pouch_dates.png';
                    }
                } else if (cat.includes('fig') || cat.includes('injeer') || cat.includes('anjeer') || combinedName.includes('fig')) {
                    // Specific Fig Logic
                    if (combinedName.includes('honey')) {
                        mappedImg = '/pouch_fig_honey.png';
                    } else {
                        mappedImg = '/pouch_fig_dry.png';
                    }
                } else if (cat.includes('raisin') || cat.includes('kishmish') || combinedName.includes('raisin') || combinedName.includes('kissmiss')) {
                    // Check if it's black raisins
                    if (combinedName.includes('black')) {
                        mappedImg = '/pouch_raisins_black.png';
                    } else {
                        mappedImg = '/pouch_raisins.png';
                    }
                } else if (combinedName.includes('makhana') || combinedName.includes('fox nut') || combinedName.includes('foxnut')) {
                    mappedImg = '/pouch_makhana.png';
                } else if (combinedName.includes('pumpkin')) {
                    mappedImg = '/pouch_pumpkin_seeds.png';
                } else if (combinedName.includes('sunflower')) {
                    mappedImg = '/pouch_sunflower_seeds.png';
                } else if (combinedName.includes('watermelon')) {
                    mappedImg = '/pouch_watermelon_seeds.png';
                } else if (combinedName.includes('flax') || combinedName.includes('flex')) {
                    mappedImg = '/pouch_flax_seeds.png';
                } else if (combinedName.includes('chia')) {
                    mappedImg = '/pouch_chia_seeds.png';
                } else if (combinedName.includes('sesame') || combinedName.includes('til')) {
                    mappedImg = '/pouch_sesame_seeds.png';
                } else if (combinedName.includes('melon') && combinedName.includes('seed')) {
                    mappedImg = '/pouch_melon_seeds.png';
                } else if (combinedName.includes('cucumber')) {
                    mappedImg = '/pouch_melon_seeds.png';
                } else if (cat.includes('mix') || combinedName.includes('mix')) {
                    // Differentiate between dry fruits mix and dry nuts mix
                    if (combinedName.includes('fruit')) {
                        mappedImg = '/pouch_dry_fruits_mixed.png';
                    } else if (combinedName.includes('nut')) {
                        mappedImg = '/pouch_dry_nuts_mixed.png';
                    } else {
                        mappedImg = '/pouch_mixes.png'; // Generic mix fallback
                    }
                } else if (cat.includes('abc') || cat.includes('malt') || combinedName.includes('malt')) {
                    mappedImg = '/premium_abc_malt.png';
                } else if (combinedName.includes('kiwi')) {
                    mappedImg = '/pouch_kiwi.png';
                } else if (combinedName.includes('pineapple')) {
                    mappedImg = '/pouch_pineapple.png';
                } else if (combinedName.includes('mango')) {
                    mappedImg = '/pouch_mango.png';
                } else if (combinedName.includes('papaya')) {
                    mappedImg = '/pouch_papaya.png';
                } else if (combinedName.includes('strawberry')) {
                    mappedImg = '/pouch_strawberry.png';
                } else if (combinedName.includes('blueberry')) {
                    mappedImg = '/pouch_blueberry.png';
                } else if (combinedName.includes('apricot')) {
                    mappedImg = '/pouch_apricot.png';
                }

                let img = foundProduct.image;
                // ANY mapped premium imagery takes priority during this phase
                if (mappedImg) {
                    img = mappedImg;
                } else if (!img || (!img.startsWith('/') && !img.startsWith('http'))) {
                    img = img || '/logo-clean.png';
                }
                foundProduct.image = img;

                setProduct(foundProduct);
            }
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="loader-container">
                <Loader2 className="animate-spin" size={50} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="no-product">
                <h2>Product not found.</h2>
                <button onClick={() => navigate('/shop')}>Back to Shop</button>
            </div>
        );
    }

    const currentVariant = variants[selectedVariant];
    const savings = currentVariant.originalPrice - currentVariant.salePrice;

    return (
        <div className="product-details-page">
            <div className="product-container">
                <nav className="breadcrumb">
                    <Link to="/">Home</Link> &nbsp;&gt;&nbsp;
                    <Link to={`/shop/${product.category?.toLowerCase()}`}>
                        {product.category}{product.category?.toLowerCase().includes('almond') ? ' (Badam)' : ''}
                    </Link> &nbsp;&gt;&nbsp;
                    <span>{product.name}</span>
                </nav>

                <div className="product-grid">
                    <div className="image-section">
                        <div className="main-image-wrapper">
                            <span className="bestseller-badge">BESTSELLER</span>
                            <img
                                src={product.image || '/logo-clean.png'}
                                alt={product.name}
                                onError={(e) => { e.target.onerror = null; e.target.src = '/logo-clean.png'; }}
                            />
                            <div className="wishlist-btn-corner" onClick={handleWishlistToggle} style={{ cursor: 'pointer' }}>
                                <Heart
                                    size={20}
                                    fill={isInWishlist(id) ? '#ff4444' : 'none'}
                                    color={isInWishlist(id) ? '#ff4444' : '#666'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="title-row">
                            <h1>{product.displayName || product.name}</h1>
                            <div className="share-btn"><Share2 size={20} /></div>
                        </div>

                        {/* Description and Benefits - Moved here */}
                        {product.description && (
                            <div className="info-block-inline">
                                <h3 className="info-title-small">Description</h3>
                                <p className="info-text">{product.description}</p>
                            </div>
                        )}

                        {product.benefits && (
                            <div className="info-block-inline">
                                <h3 className="info-title-small">Benefits</h3>
                                <div className="benefits-list-inline">
                                    {product.benefits.split('\n').map((benefit, idx) => (
                                        benefit.trim() && (
                                            <div key={idx} className="benefit-item-inline">
                                                <span className="benefit-icon">✓</span>
                                                <span>{benefit.trim()}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pricing-section">
                            <div className="sale-price">₹{currentVariant.salePrice}</div>
                            <div className="mrp strike">₹{currentVariant.originalPrice}</div>
                            <div className="discount-badge">SAVE ₹{savings}</div>
                        </div>
                        <div className="tax-info" style={{ marginBottom: '20px', color: '#888', fontSize: '12px' }}>incl. of all taxes</div>

                        <div className="variants-section">
                            <label>Quantity</label>
                            <div className="variants-grid">
                                {variants.map((v, idx) => (
                                    <div
                                        key={idx}
                                        className={`variant-card ${selectedVariant === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedVariant(idx)}
                                    >
                                        <div className="variant-size">{v.size}</div>
                                        <div className="variant-prices">
                                            <span className="v-old">₹{v.originalPrice}</span>
                                            <span className="v-new">₹{v.salePrice}</span>
                                        </div>
                                        {selectedVariant === idx && <div className="selected-indicator" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="purchase-panel">
                            <div className="q-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="q-btn"><Minus size={14} /></button>
                                <span className="q-val">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="q-btn"><Plus size={14} /></button>
                            </div>
                            <button
                                className="add-to-cart-btn"
                                onClick={() => {
                                    addToCart(product, quantity, currentVariant.size);
                                    alert('Added to cart!');
                                }}
                            >
                                Add To Cart
                            </button>
                            <button
                                className="buy-now-btn"
                                onClick={() => {
                                    addToCart(product, quantity, currentVariant.size);
                                    navigate('/cart');
                                }}
                            >
                                Buy It Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Old Description and Benefits Section - REMOVED */}
            </div>

            <style jsx>{`
                .product-details-page {
                    padding: 20px 0 80px;
                    background: #fff;
                    min-height: 100vh;
                }
                .product-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .breadcrumb {
                    font-size: 11px;
                    color: #999;
                    margin-bottom: 20px;
                }
                .breadcrumb a { color: #999; text-decoration: none; }
                .breadcrumb span { color: #666; }

                .product-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 50px;
                }

                /* Image Section */
                .main-image-wrapper {
                    position: relative;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 500px;
                }
                .main-image-wrapper img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                .bestseller-badge {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #a44d4d;
                    color: #fff;
                    padding: 5px 15px;
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .wishlist-btn-corner {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    color: #666;
                    cursor: pointer;
                }
                .thumbnail-gallery {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                .thumb {
                    width: 70px;
                    height: 70px;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 5px;
                    cursor: pointer;
                }
                .thumb.active { border-color: #741d1d; }
                .thumb img { width: 100%; height: 100%; object-fit: contain; }

                /* Info Section */
                .title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }
                .info-section h1 {
                    font-size: 26px;
                    font-weight: 700;
                    color: #333;
                    margin: 0;
                    line-height: 1.3;
                }
                .share-btn {
                    color: #666;
                    cursor: pointer;
                }

                /* Inline Description and Benefits */
                .info-block-inline {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 8px;
                    border-left: 3px solid #5d2b1a;
                }

                .info-title-small {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #5d2b1a;
                    margin: 0 0 10px 0;
                }

                .info-text {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #555;
                    margin: 0;
                }

                .benefits-list-inline {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .benefit-item-inline {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 0.95rem;
                    color: #555;
                }

                .benefit-icon {
                    color: #4CAF50;
                    font-weight: bold;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .rating-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 25px;
                }
                .stars {
                    background: #741d1d;
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    gap: 2px;
                }
                .rating-text { font-weight: 700; color: #333; }
                .review-count { font-size: 12px; color: #888; border-left: 1px solid #ddd; padding-left: 10px; }

                .pricing-section {
                    display: flex;
                    align-items: baseline;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                }
                .mrp { font-size: 14px; color: #666; }
                .strike { text-decoration: line-through; }
                .sale-price { font-size: 32px; font-weight: 800; color: #741d1d; }
                .tax-info { font-size: 12px; color: #888; }
                .discount-badge {
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 3px 8px;
                    font-size: 12px;
                    font-weight: 700;
                    border-radius: 4px;
                }
                .price-per-weight { font-size: 13px; color: #666; }
                .savings-highlight {
                    font-size: 15px;
                    font-weight: 700;
                    color: #2e7d32;
                    margin-bottom: 30px;
                }

                .variants-section label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 15px;
                }
                .variants-grid {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 25px;
                }
                .variant-card {
                    flex: 1;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                    transition: border-color 0.2s;
                }
                .variant-card.active { border-color: #741d1d; background: #fff; }
                .variant-size { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 5px; }
                .variant-prices { font-size: 13px; font-weight: 700; color: #333; }
                .v-old { text-decoration: line-through; color: #999; margin-right: 5px; font-size: 11px; }

                .purchase-panel {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .q-selector {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    height: 48px;
                }
                .q-btn { padding: 0 15px; color: #333; }
                .q-val { width: 30px; text-align: center; font-size: 14px; font-weight: 700; }
                
                .add-to-cart-btn {
                    flex: 2;
                    height: 48px;
                    background: #a44d4d;
                    color: #fff;
                    font-weight: 700;
                    border: none;
                    border-radius: 4px;
                    font-size: 15px;
                    cursor: pointer;
                    text-transform: uppercase;
                }
                .buy-now-btn {
                    flex: 2;
                    height: 48px;
                    border: 2px solid #a44d4d;
                    color: #333;
                    background: #fff;
                    font-weight: 700;
                    border-radius: 4px;
                    font-size: 15px;
                    cursor: pointer;
                    text-transform: uppercase;
                }

                .delivery-timer {
                    border-top: 1px solid #eee;
                    padding-top: 25px;
                    margin-top: 20px;
                }
                .timer-text { font-weight: 700; color: #333; font-size: 13px; margin-bottom: 20px; text-transform: none; }
                
                .countdown-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                }
                .count-box {
                    background: #5d2b1a;
                    color: #fff;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 700;
                    border-radius: 4px;
                }
                .count-sep { font-size: 20px; font-weight: 700; color: #5d2b1a; }
                .time-labels {
                    position: absolute;
                    bottom: -18px;
                    left: 0;
                    width: 140px;
                    display: flex;
                    justify-content: space-around;
                    font-size: 9px;
                    color: #5d2b1a;
                    font-weight: 700;
                }

                .loader-container { height: 60vh; display: flex; align-items: center; justify-content: center; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Description and Benefits Section */
                .product-info-section {
                    max-width: 1200px;
                    margin: 40px auto 0;
                    padding: 0 20px;
                }

                .info-block {
                    background: #f9f9f9;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 20px;
                }

                .info-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #5d2b1a;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #5d2b1a;
                    padding-bottom: 10px;
                }

                .info-content {
                    font-size: 1rem;
                    line-height: 1.8;
                    color: #333;
                }

                .benefits-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .benefit-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    font-size: 1rem;
                    color: #333;
                }

                .benefit-icon {
                    color: #4CAF50;
                    font-weight: bold;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                @media (max-width: 900px) {
                    .product-grid { grid-template-columns: 1fr; }
                    .main-image-wrapper { height: 350px; }
                    .info-block { padding: 20px; }
                    .info-title { font-size: 1.3rem; }
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
