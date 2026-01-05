import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api';
import { Loader2, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const Shop = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { search } = useLocation();
    const query = new URLSearchParams(search).get('search');
    const { addToCart } = useCart();
    const { showToast } = useNotification();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedWeights, setSelectedWeights] = useState({}); // Track selected weight for each product

    // Safety timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setErrorMsg('Request timed out. Please check your connection or try again.');
            }
        }, 15000); // 15 seconds
        return () => clearTimeout(timer);
    }, [loading]);

    const categoryImageMap = {
        'almond': '/premium_almond.png',
        'almonds': '/premium_almond.png',
        'walnut': '/premium_walnut.png',
        'walnuts': '/premium_walnut.png',
        'cashew': '/premium_cashew.png',
        'cashews': '/premium_cashew.png',
        'pistachio': '/premium_pista.png',
        'pistachios': '/premium_pista.png',
        'date': '/premium_dates.png',
        'dates': '/premium_dates.png',
        'mix': '/premium_mixes.png',
        'mixes': '/premium_mixes.png',
        'malt': '/premium_malt.png'
    };
    // Mock data removed. Relying strictly on API.


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [productData, categoryData] = await Promise.all([
                    fetchProducts(),
                    fetchCategories()
                ]);
                console.log("Shop: API data received", {
                    products: Array.isArray(productData) ? productData.length : 'not arrays',
                    categories: Array.isArray(categoryData) ? categoryData.length : 'not array'
                });

                // STRICT MODE: Only use API items.
                let items = Array.isArray(productData) ? productData : [];

                // Filter by search query
                if (query) {
                    const q = query.toLowerCase().trim();
                    items = items.filter(p =>
                        (p.name || '').toLowerCase().includes(q) ||
                        (p.description || '').toLowerCase().includes(q)
                    );
                }

                // Filter by category
                if (category) {
                    let cleanParamCat = category.toLowerCase().replace(/[-\/]/g, ' ').trim();

                    // Normalize the category param to match product categories
                    if (cleanParamCat.includes('almond')) cleanParamCat = 'almond';
                    else if (cleanParamCat.includes('cashew')) cleanParamCat = 'cashew';
                    else if (cleanParamCat.includes('walnut')) cleanParamCat = 'walnut';
                    else if (cleanParamCat.includes('pistachio') || cleanParamCat.includes('pista')) cleanParamCat = 'pista';
                    else if (cleanParamCat.includes('date')) cleanParamCat = 'date';
                    else if (cleanParamCat.includes('fig') || cleanParamCat.includes('anjeer')) cleanParamCat = 'fig';
                    else if (cleanParamCat.includes('raisin')) cleanParamCat = 'raisin';
                    else if (cleanParamCat.includes('seed')) cleanParamCat = 'seed';
                    else if (cleanParamCat.includes('mix')) cleanParamCat = 'mix';
                    else if (cleanParamCat.includes('malt') || cleanParamCat.includes('abc')) cleanParamCat = 'malt';
                    else if (cleanParamCat.includes('dried') && cleanParamCat.includes('fruit')) cleanParamCat = 'dried fruit';

                    items = items.filter(p => {
                        const pCat = (p.category || '').toLowerCase().replace(/[-\/]/g, ' ').trim();
                        const pName = (p.name || '').toLowerCase();

                        // Special handling for specific groups
                        if (cleanParamCat === 'malt') {
                            return pCat.includes('malt') || pCat.includes('abc') || pName.includes('malt');
                        }
                        if (cleanParamCat === 'mix') {
                            return pCat.includes('mix') || pCat.includes('daily') || pName.includes('mix');
                        }

                        // General matching: check if normalized URL cat matches product category or name
                        return pCat.includes(cleanParamCat) || pName.includes(cleanParamCat);
                    });
                }

                console.log(`Shop: Filtered down to ${items.length} items. Mapping images...`);

                let finalItems = items.map(p => {
                    const cat = (p.category || '').toLowerCase().trim();
                    const nameLower = (p.name || '').toLowerCase();
                    const displayNameLower = (p.displayName || '').toLowerCase();
                    const combinedName = nameLower + ' ' + displayNameLower;

                    let img = p.image;
                    let mappedImg = null;

                    // Map based on category and name
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

                    // ALWAYS prefer mapped imagery if found
                    if (mappedImg) {
                        img = mappedImg;
                    } else if (!img || (!img.startsWith('/') && !img.startsWith('http'))) {
                        img = img || '/logo-clean.png';
                    }

                    return { ...p, image: img };
                });

                console.log("Shop: Mapping complete. Setting state.");
                setProducts(finalItems);
                setCategories(categoryData || []);
            } catch (error) {
                console.error("ShopError: Error in loadData", error);
                setProducts([]);
            }
            console.log("Shop: Finishing loadData (setLoading false)");
            setLoading(false);
        };
        loadData();
    }, [category, query]);

    const getCategoryDetails = (catName) => {
        const details = {
            'walnuts': {
                fullName: 'Walnuts',
                description: 'Buy Premium Walnuts (Akhrot) Online at Best Price, perfect for all your snacking and cooking needs. Sweet seeds in taste with a tough shell outside, walnuts (Akhrot) are widely-consumed dry fruits known for their brain-boosting properties. They are rich in Omega-3 fatty acids and antioxidants.',
                bannerTitle: 'Walnuts',
                bannerImage: '/banner_walnuts.png'
            },
            'almonds': {
                fullName: 'Almonds (Badam)',
                description: 'Premium Quality Almonds, handpicked for taste and health. Rich in protein, fiber, and vitamin E, our almonds are perfect for a healthy heart and glowing skin.',
                bannerTitle: 'Almonds',
                bannerImage: '/banner_almonds.png'
            },
            'cashews': {
                fullName: 'Cashews',
                description: 'Creamy and crunchy Cashews, a perfect snack for every occasion. Rich in essential minerals, these cashews are great for energy and bone health.',
                bannerTitle: 'Cashews',
                bannerImage: '/banner_cashews.png'
            },
            'pistachios': {
                fullName: 'Pistachios',
                description: 'Roasted and salted Pistachios, a delightful treat for your taste buds. Packed with protein and healthy fats, these pistachios are a guilt-free snack.',
                bannerTitle: 'Pistachios',
                bannerImage: '/banner_pistachios.png'
            },
            'dates': {
                fullName: 'Premium Dates',
                description: 'Natural energy boosters, our Dates are soft, sweet, and full of fiber. Perfect for a quick snack or a healthy dessert.',
                bannerTitle: 'Dates',
                bannerImage: '/banner_dates.png'
            },
            'mixes': {
                fullName: 'Daily Mix',
                description: 'A perfect blend of nuts and berries for your daily nutrition. Convenient, healthy, and delicious.',
                bannerTitle: 'Daily Mix',
                bannerImage: '/banner_mixes.png'
            },
            'malt': {
                fullName: 'ABC Malt/Drink',
                description: 'Pure Apple, Beetroot, and Carrot dry powder. A powerful health drink mix for vitality and immunity.',
                bannerTitle: 'ABC Malt',
                bannerImage: '/banner_abc_malt.png'
            },
            'figs': {
                fullName: 'Premium Figs',
                description: 'Naturally sweet and nutritious dried figs, perfect for healthy snacking anytime.',
                bannerTitle: 'Figs',
                bannerImage: '/banner_figs.png'
            },
            'seeds': {
                fullName: 'Super Seeds',
                description: 'Nutrient-dense seeds packed with protein, fiber, and healthy fats.',
                bannerTitle: 'Seeds',
                bannerImage: '/banner_seeds.png'
            },
            'raisins': {
                fullName: 'Premium Raisins',
                description: 'Sweet and juicy raisins, perfect for baking, cooking, or snacking.',
                bannerTitle: 'Raisins',
                bannerImage: '/banner_raisins.png'
            },
            'dried fruits': {
                fullName: 'Exotic Dried Fruits',
                description: 'A variety of delicious dried fruits to satisfy your sweet cravings naturally.',
                bannerTitle: 'Dried Fruits',
                bannerImage: '/banner_dried_fruits.png'
            }
        };

        // Handle variations (singular vs plural, etc.)
        let key = catName?.toLowerCase().trim();
        if (key.includes('almond')) key = 'almonds';
        else if (key.includes('cashew')) key = 'cashews';
        else if (key.includes('walnut')) key = 'walnuts';
        else if (key.includes('pista')) key = 'pistachios';
        else if (key.includes('date')) key = 'dates';
        else if (key.includes('mix')) key = 'mixes';
        else if (key.includes('malt') || key.includes('abc')) key = 'malt';
        else if (key.includes('fig') || key.includes('anjeer')) key = 'figs';
        else if (key.includes('seed')) key = 'seeds';
        else if (key.includes('raisin') || key.includes('kishmish')) key = 'raisins';
        else if (key.includes('dried') && key.includes('fruit')) key = 'dried fruits';

        return details[key] || {
            fullName: catName ? catName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Products',
            description: `Quality ${catName?.replace(/-/g, ' ')} selected for the best taste and nutrition.`,
            bannerTitle: catName ? catName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Products',
            bannerImage: '/hero-banner-wide.png'
        };
    };

    const catDetails = getCategoryDetails(category);

    return (
        <div className="shop-page">
            {category && (
                <div className="category-header">
                    <div
                        className="category-banner"
                        style={{
                            backgroundImage: `url('${catDetails.bannerImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="banner-content" style={{ textAlign: 'center' }}>
                            <h1 className="banner-title" style={{ color: '#5d2b1a', fontSize: '5rem', margin: 0, lineHeight: 1, fontWeight: '800' }}>{catDetails.bannerTitle}</h1>
                            <span className="banner-subtitle" style={{ display: 'block', color: '#741d1d', fontSize: '1.2rem', fontWeight: '600', letterSpacing: '4px', marginTop: '10px', textTransform: 'uppercase' }}>Premium Quality</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="shop-container">
                <nav className="breadcrumb">
                    <Link to="/">Home</Link> &gt; <span>{catDetails.fullName}</span>
                </nav>

                {category && (
                    <div className="category-info">
                        <h2>{catDetails.fullName}</h2>
                        <div className="description">
                            <p>{catDetails.description}</p>
                        </div>
                    </div>
                )}

                <div className="spacer-sm" style={{ height: '20px' }}></div>

                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="animate-spin" size={50} />
                    </div>
                ) : errorMsg ? (
                    <div className="no-products-msg">
                        <h3>{errorMsg}</h3>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                ) : (
                    <div className="product-list-view">
                        {products && products.length > 0 ? (
                            products.map((product, index) => {
                                // Get selected weight for this product, default to first available weight
                                const availableWeights = [];
                                if (product.prices) {
                                    if (product.prices['100g']) availableWeights.push('100g');
                                    if (product.prices['250g']) availableWeights.push('250g');
                                    if (product.prices['500g']) availableWeights.push('500g');
                                    if (product.prices['1kg']) availableWeights.push('1kg');
                                }
                                const selectedWeight = selectedWeights[product.id] || availableWeights[0] || '250g';
                                const currentPrice = product.prices?.[selectedWeight] || product.price || 0;
                                const mrpPrice = Math.round(currentPrice * 1.10);
                                const saveAmount = mrpPrice - currentPrice;

                                return (
                                    <div key={index} className="product-item-row" onClick={() => navigate(`/product/${product.id}`)}>
                                        <div className="item-image-box">
                                            <span className="badge-promo">BESTSELLER</span>
                                            <img
                                                src={product.image || '/logo-clean.png'}
                                                alt={product.displayName || product.name || 'Product'}
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/logo-clean.png'; }}
                                            />
                                        </div>
                                        <div className="item-details-box">
                                            <h3 className="item-name">{product.displayName || product.name || 'Unnamed Product'}</h3>
                                            <p className="item-desc">{product.description || 'No description available.'}</p>

                                            {product.benefits && (
                                                <div className="item-benefits">
                                                    {product.benefits.split('\n').slice(0, 3).map((benefit, idx) => (
                                                        benefit.trim() && (
                                                            <div key={idx} className="benefit-item-small">
                                                                <span className="benefit-check">✓</span>
                                                                <span>{benefit.trim()}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            <div className="item-pricing">
                                                <span className="price-now">₹{currentPrice}</span>
                                                <span className="price-mrp line-through">₹{mrpPrice}</span>
                                                <span className="save-tag">SAVE ₹{saveAmount}</span>
                                            </div>

                                            <div className="item-weights">
                                                {(() => {
                                                    const weights = [];
                                                    if (product.prices) {
                                                        if (product.prices['100g']) weights.push('100g');
                                                        if (product.prices['250g']) weights.push('250g');
                                                        if (product.prices['500g']) weights.push('500g');
                                                        if (product.prices['1kg']) weights.push('1kg');
                                                    }
                                                    // Fallback if no prices object
                                                    if (weights.length === 0) {
                                                        weights.push('100g', '250g', '500g', '1kg');
                                                    }
                                                    return weights.map(w => (
                                                        <span
                                                            key={w}
                                                            className={`weight-btn ${selectedWeight === w ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent navigation to product page
                                                                setSelectedWeights(prev => ({
                                                                    ...prev,
                                                                    [product.id]: w
                                                                }));
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {w}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>

                                            <div className="item-actions">
                                                <button
                                                    className="btn-cart"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product, 1, selectedWeight);
                                                        showToast('Added to cart!', 'success');
                                                    }}
                                                >
                                                    ADD TO CART
                                                </button>
                                                <button
                                                    className="btn-buy"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product, 1, selectedWeight);
                                                        navigate('/cart');
                                                    }}
                                                >
                                                    BUY IT NOW
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-products-msg">
                                <h3>No products found for this selection.</h3>
                                <button onClick={() => navigate('/shop')}>Show All Products</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .shop-page {
                    min-height: 100vh;
                    background: #fdfdfd;
                    padding-bottom: 80px;
                }
                .shop-container {
                    max-width: 1300px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .category-header {
                    width: 100%;
                    padding: 20px;
                    background: #fff;
                }
                .category-banner {
                    width: 100%;
                    height: 250px;
                    border-radius: 12px;
                    background-size: 100% 100%;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                }
                .banner-title {
                    font-size: 48px;
                    font-weight: 800;
                    color: #741d1d;
                    margin: 0;
                }
                .breadcrumb { font-size: 11px; color: #999; margin: 15px 0; }
                .shop-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                .category-chips { display: flex; gap: 10px; overflow-x: auto; }
                .chip {
                    padding: 8px 20px;
                    border-radius: 30px;
                    background: #f0f0f0;
                    color: #444;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .chip.active { background: #a44d4d; color: #fff; }

                .product-list-view {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                .product-item-row {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 40px;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 15px;
                    padding: 25px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .product-item-row:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .item-image-box {
                    position: relative;
                    background: #fdfdfd;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }
                .item-image-box img { max-width: 80%; max-height: 80%; object-fit: contain; }
                .badge-promo {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: #a44d4d;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 4px;
                }

                .item-name { font-size: 22px; font-weight: 700; color: #333; margin: 0 0 10px 0; }
                .item-rating { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
                .stars-gold { color: #fab005; }
                .rating-text { color: #999; font-size: 13px; }
                .item-desc { color: #666; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }

                .item-benefits { margin-bottom: 20px; }
                .benefit-item-small { 
                    display: flex; 
                    align-items: flex-start; 
                    gap: 8px; 
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: #555;
                }
                .benefit-check { 
                    color: #4CAF50; 
                    font-weight: bold; 
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .item-pricing { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .price-now { font-size: 28px; font-weight: 800; color: #a44d4d; }
                .price-mrp { color: #999; font-size: 14px; }
                .line-through { text-decoration: line-through; }
                .save-tag { background: #e8f5e9; color: #2e7d32; padding: 3px 10px; font-size: 11px; font-weight: 700; border-radius: 4px; }

                .item-weights { display: flex; gap: 10px; margin-bottom: 30px; }
                .weight-btn { padding: 6px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-weight: 600; }
                .weight-btn.active { border-color: #a44d4d; color: #a44d4d; }

                .item-actions { display: flex; gap: 15px; }
                .btn-cart { flex: 1; padding: 15px; background: #a44d4d; color: #fff; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; }
                .btn-buy { flex: 1; padding: 15px; background: #fff; color: #333; border: 2px solid #a44d4d; border-radius: 4px; font-weight: 700; cursor: pointer; }

                .loader-container { display: flex; justify-content: center; padding: 100px; }
                .animate-spin { animation: spin 1s linear infinite; color: #a44d4d; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .no-products-msg { text-align: center; padding: 60px; }
            `}</style>
        </div>
    );
};

export default Shop;
