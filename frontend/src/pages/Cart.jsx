import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { showToast } = useNotification();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const totalAmount = getCartTotal();
    const shipping = totalAmount > 500 ? 0 : 50; // Example shipping logic

    if (cart.length === 0) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
                background: '#fafafa'
            }}>
                <ShoppingBag size={64} color="#e0e0e0" style={{ marginBottom: '20px' }} />
                <h2 style={{
                    color: '#333',
                    marginBottom: '10px',
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '2rem'
                }}>
                    Your cart is light as air
                </h2>
                <p style={{ color: '#888', marginBottom: '30px', fontSize: '1.1rem' }}>
                    Add items to start your collection.
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
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div style={{
            padding: '60px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: 'Inter, sans-serif',
            minHeight: '80vh'
        }}>
            <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '40px',
                color: '#5d2b1a',
                fontFamily: '"Playfair Display", serif',
                fontWeight: '700',
                borderBottom: '1px solid #eee',
                paddingBottom: '20px'
            }}>
                Shopping Cloud
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px', alignItems: 'start' }} className="cart-layout">
                {/* Cart Items List */}
                {/* Cart Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {cart.map((item) => {
                        // Image mapping logic (replicated from Shop.jsx for consistency)
                        const getMappedImage = (p) => {
                            const cat = (p.category || '').toLowerCase().trim();
                            const nameLower = (p.name || '').toLowerCase();
                            const displayNameLower = (p.displayName || '').toLowerCase();
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
                                if (combinedName.includes('black')) mappedImg = '/pouch_dates_black.png';
                                else if (combinedName.includes('dry') || combinedName.includes('yellow')) mappedImg = '/pouch_dates_dry.png';
                                else mappedImg = '/pouch_dates.png';
                            } else if (cat.includes('fig') || cat.includes('anjeer') || combinedName.includes('fig')) {
                                if (combinedName.includes('honey')) mappedImg = '/pouch_fig_honey.png';
                                else mappedImg = '/pouch_fig_dry.png';
                            } else if (cat.includes('raisin') || cat.includes('kishmish') || combinedName.includes('raisin')) {
                                if (combinedName.includes('black')) mappedImg = '/pouch_raisins_black.png';
                                else mappedImg = '/pouch_raisins.png';
                            } else if (combinedName.includes('makhana')) mappedImg = '/pouch_makhana.png';
                            else if (combinedName.includes('pumpkin')) mappedImg = '/pouch_pumpkin_seeds.png';
                            else if (combinedName.includes('sunflower')) mappedImg = '/pouch_sunflower_seeds.png';
                            else if (combinedName.includes('watermelon')) mappedImg = '/pouch_watermelon_seeds.png';
                            else if (combinedName.includes('flax') || combinedName.includes('flex')) mappedImg = '/pouch_flax_seeds.png';
                            else if (combinedName.includes('chia')) mappedImg = '/pouch_chia_seeds.png';
                            else if (combinedName.includes('sesame')) mappedImg = '/pouch_sesame_seeds.png';
                            else if (combinedName.includes('melon')) mappedImg = '/pouch_melon_seeds.png';
                            else if (combinedName.includes('cucumber')) mappedImg = '/pouch_melon_seeds.png';
                            else if (cat.includes('mix') || combinedName.includes('mix')) {
                                if (combinedName.includes('fruit')) mappedImg = '/pouch_dry_fruits_mixed.png';
                                else if (combinedName.includes('nut')) mappedImg = '/pouch_dry_nuts_mixed.png';
                                else mappedImg = '/pouch_mixes.png';
                            } else if (cat.includes('abc') || cat.includes('malt') || combinedName.includes('malt')) {
                                mappedImg = '/premium_abc_malt.png';
                            } else if (combinedName.includes('kiwi')) mappedImg = '/pouch_kiwi.png';
                            else if (combinedName.includes('pineapple')) mappedImg = '/pouch_pineapple.png';
                            else if (combinedName.includes('mango')) mappedImg = '/pouch_mango.png';
                            else if (combinedName.includes('papaya')) mappedImg = '/pouch_papaya.png';
                            else if (combinedName.includes('strawberry')) mappedImg = '/pouch_strawberry.png';
                            else if (combinedName.includes('blueberry')) mappedImg = '/pouch_blueberry.png';
                            else if (combinedName.includes('apricot')) mappedImg = '/pouch_apricot.png';

                            return mappedImg;
                        };

                        const displayImage = getMappedImage(item) || item.image || '/logo-clean.png';

                        return (
                            <div key={`${item.id}-${item.variant}`} className="cart-item-card">
                                <div className="item-image">
                                    <img
                                        src={displayImage}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = '/logo-clean.png'; }}
                                    />
                                </div>

                                <div className="item-info">
                                    <h3 className="item-title">{item.displayName || item.name}</h3>
                                    <p className="item-variant">Variant: {item.variant} • <span className="item-price-unit">₹{item.price}</span></p>
                                </div>

                                <div className="item-controls">
                                    <div className="quantity-pill">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="q-btn"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="q-val">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                                            className="q-btn"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id, item.variant)}
                                    className="remove-btn"
                                    title="Remove Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                    <h2 className="summary-title">Order Summary</h2>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? <span className="free-shipping">Free</span> : `₹${shipping}`}</span>
                    </div>

                    <div className="divider"></div>

                    <div className="total-row">
                        <span>Total</span>
                        <span>₹{totalAmount + shipping}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                showToast('Please login to place an order', 'warning');
                                navigate('/login');
                                return;
                            }
                            setIsCheckoutOpen(true);
                        }}
                        className="checkout-btn"
                    >
                        Place Order via WhatsApp <ArrowRight size={18} />
                    </button>
                    <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                        No payment needed now. Pay on delivery or via UPI after confirmation.
                    </p>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={cart}
                total={totalAmount + shipping}
            />

            <style jsx>{`
                :global(body) {
                    background-color: #fafafa;
                }
                .cart-item-card {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    padding: 30px;
                    background-color: #fff;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04); /* Soft shadow */
                    position: relative;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .cart-item-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.06);
                }
                
                .item-image {
                    width: 100px;
                    height: 100px;
                    background-color: #fcfcfc;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                }
                .item-image img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .item-info {
                    flex: 1;
                }
                .item-title {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 1.15rem;
                    font-weight: 600;
                    font-family: 'Playfair Display', serif;
                }
                .item-variant {
                    margin: 0;
                    color: #888;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .item-price-unit {
                    font-weight: 600;
                    color: #5d2b1a;
                }

                .item-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                }

                .quantity-pill {
                    display: flex;
                    align-items: center;
                    background-color: #f5f5f5;
                    border-radius: 50px;
                    padding: 4px;
                    gap: 5px;
                }
                .q-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: #fff;
                    color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    transition: background 0.2s;
                }
                .q-btn:hover { background: #f0f0f0; }
                .q-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .q-val {
                    min-width: 24px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #333;
                }

                .item-total {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #2e7d32; /* Forest green */
                    font-family: 'Outfit', sans-serif;
                }

                .remove-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: transparent;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    padding: 5px;
                    transition: color 0.2s;
                }
                .remove-btn:hover { color: #ff4444; }

                /* Order Summary */
                .order-summary {
                    background-color: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                    border: 1px solid rgba(255,255,255,0.5);
                    position: sticky;
                    top: 100px;
                }
                .summary-title {
                    font-size: 1.5rem;
                    margin-bottom: 25px;
                    color: #333;
                    font-family: 'Playfair Display', serif;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    color: #666;
                    font-size: 1rem;
                }
                .free-shipping {
                    color: #2e7d32;
                    font-weight: 600;
                }
                .divider {
                    height: 1px;
                    background-color: #eee;
                    margin: 25px 0;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #5d2b1a; /* Dark Earth */
                    font-family: 'Playfair Display', serif;
                }
                .checkout-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #5d2b1a 0%, #8b4513 100%);
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    box-shadow: 0 8px 20px rgba(93, 43, 26, 0.25);
                }
                .checkout-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 25px rgba(93, 43, 26, 0.35);
                }

                @media (max-width: 900px) {
                    .cart-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .order-summary {
                        position: static;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;
