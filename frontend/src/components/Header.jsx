import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Store, ChevronDown, ShoppingBag, ShieldCheck } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../api';
import MegaMenu from './MegaMenu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { wishlist, user } = useAuth();
  const { getCartCount } = useCart();

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim() || selectedCategory) {
        let path = '/shop';
        const params = new URLSearchParams();

        if (selectedCategory) {
          path = `/shop/${selectedCategory.toLowerCase().replace(/[\s\/]+/g, '-')}`;
        }

        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const queryString = params.toString();
        navigate(`${queryString ? path + '?' + queryString : path}`);
        setIsMenuOpen(false);
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const newSuggestions = [];

      // Category Suggestions
      categories.forEach(cat => {
        const catName = (cat.name || '').toLowerCase();
        if (catName.includes(query)) {
          newSuggestions.push({ name: cat.name, type: 'category' });
        }
        (cat.subcategories || []).forEach(sub => {
          const subName = String(sub).toLowerCase();
          if (subName.includes(query)) {
            newSuggestions.push({ name: String(sub), type: 'subcategory' });
          }
        });
      });

      // Product Suggestions
      products.forEach(prod => {
        const pName = (prod.displayName || prod.name || '').toLowerCase();
        if (pName.includes(query)) {
          newSuggestions.push({ name: prod.displayName || prod.name, type: 'product', id: prod.id });
        }
      });

      // Remove duplicates and limit to top 10
      const uniqueSuggestions = Array.from(new Map(newSuggestions.map(s => [s.name, s])).values()).slice(0, 10);
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, categories, products]);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product' && suggestion.id) {
      navigate(`/product/${suggestion.id}`);
    } else {
      navigate(`/shop/${suggestion.name.toLowerCase().replace(/[\s\/]+/g, '-')}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, prodData] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);

        if (catData && catData.length > 0) setCategories(catData);
        else setCategories([]);

        if (prodData && prodData.length > 0) setProducts(prodData);
        else setProducts([]);

      } catch (error) {
        console.error("Error loading header data:", error);
      }
    };
    loadData();
  }, []);

  return (
    <header className="main-header">
      <div className="header-top-container">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo-clean.png" alt="The WildNuts Logo" className="logo" />
        </div>

        <div className="search-section">
          <div className="search-bar-inner">
            <div
              className="category-dropdown"
              onMouseEnter={() => setIsMenuOpen(true)}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {selectedCategory || 'All Categories'} <ChevronDown size={14} className={`chevron ${isMenuOpen ? 'rotate' : ''}`} />
            </div>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder={selectedCategory ? `Search in ${selectedCategory}` : "Search For Mixes"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              />
              <Search className="search-icon" size={20} onClick={handleSearch} />

              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search size={14} />
                      <span>{suggestion.name} <span style={{ fontSize: '10px', color: '#999', marginLeft: '5px' }}>({suggestion.type})</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isMenuOpen && (
              <MegaMenu
                categories={categories}
                onClose={() => setIsMenuOpen(false)}
                searchQuery={searchQuery}
                onSelectCategory={(cat) => {
                  const val = cat === 'All Categories' ? null : cat;
                  setSelectedCategory(val);
                  setIsMenuOpen(false);
                  if (val) {
                    navigate(`/shop/${val.toLowerCase().replace(/[\s\/]+/g, '-')}`);
                  } else {
                    navigate('/shop');
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="actions-section">
          <div className="action-item" onClick={() => navigate('/account')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={24} strokeWidth={1.5} />
            {user && (
              <span style={{ fontSize: '14px', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username || user.full_name || 'Member'}
              </span>
            )}
          </div>
          {user && (user.email === 'connectwiththewildnuts@gmail.com' || user.email === 'admin@thewildnuts.com') && (
            <div className="action-item" onClick={() => navigate('/wild-nuts-admin/dashboard')} title="Admin Dashboard" style={{ cursor: 'pointer' }}>
              <ShieldCheck size={24} strokeWidth={1.5} color="#d97706" />
            </div>
          )}
          <div className="action-item" onClick={() => navigate('/wishlist')} style={{ cursor: 'pointer', position: 'relative' }}>
            <Heart size={24} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="badge">{wishlist.length}</span>
            )}
          </div>
          <div className="action-item cart-item" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
            <ShoppingCart size={24} strokeWidth={1.5} />
            <span className="badge">{getCartCount()}</span>
          </div>
          <div className="action-item" onClick={() => navigate('/orders')} title="My Orders" style={{ cursor: 'pointer' }}>
            <ShoppingBag size={24} strokeWidth={1.5} />
          </div>
          <div
            className="action-item location-item"
            style={{ position: 'relative' }}
          >
            <div className="icon-wrapper">
              <Store size={24} strokeWidth={1.5} />
            </div>

            <div className="location-dropdown">
              <div className="location-content">
                <p className="address-text">
                  <strong>The Wild Nuts</strong><br />
                  21/4 Upputhottam, Annur,<br />
                  Coimbatore - 641653
                </p>
                <a
                  href="https://maps.app.goo.gl/kRvN5CTuFW42tXmd8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direction-btn"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .main-header {
          padding: 15px 0;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
        }
        .header-top-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .logo-section {
          flex: 0 0 auto;
        }
        .logo {
          height: 70px;
          max-width: 200px;
          object-fit: contain;
          mix-blend-mode: multiply;
          display: block;
        }
        .search-section {
          flex: 0 1 700px;
          margin: 0 40px 0 0;
          position: relative;
        }
        .search-bar-inner {
          display: flex;
          align-items: center;
          border: 1px solid #000;
          border-radius: 40px;
          height: 42px;
          width: 100%;
          background: #fff;
          position: relative;
        }
        .category-dropdown {
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          border-right: 1px solid #000;
          height: 100%;
          color: #333;
          background: #fdfdfd;
          border-top-left-radius: 40px;
          border-bottom-left-radius: 40px;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chevron {
          color: #741d1d;
          transition: transform 0.3s;
        }
        .chevron.rotate {
          transform: rotate(180deg);
        }
        .search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 100%;
        }
        .search-input-wrapper input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 15px;
          color: #666;
          background: transparent;
        }
        .search-icon {
          color: #000;
          cursor: pointer;
        }
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: #fff;
          border: 1px solid #ddd;
          border-top: none;
          border-bottom-left-radius: 15px;
          border-bottom-right-radius: 15px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          z-index: 1001;
          overflow: hidden;
        }
        .suggestion-item {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
          color: #333;
        }
        .suggestion-item:hover {
          background: #f8f8f8;
          color: #741d1d;
        }
        .suggestion-item :global(svg) {
          color: #999;
        }
        .actions-section {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 25px;
        }
        .action-item {
          color: #1a1a1a;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .action-item:hover {
          color: #f7941d;
        }
        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #741d1d;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        @media (max-width: 1200px) {
          .search-section {
            margin: 0 20px;
          }
          .logo {
            height: 70px;
          }
        }
        @media (max-width: 992px) {
          .header-top-container {
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
          }
          .search-section {
            order: 3;
            flex: 0 0 100%;
            max-width: none;
            margin: 10px 0 0;
          }
        }

        
        /* Location Dropdown Styles */
        .location-item:hover .location-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .location-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          padding-top: 15px; /* Gap text */
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .location-content {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          width: 250px;
          border: 1px solid #eee;
          position: relative;
        }
        
        /* Little triangle */
        .location-content::before {
          content: '';
          position: absolute;
          top: -6px;
          right: 10px;
          width: 12px;
          height: 12px;
          background: white;
          transform: rotate(45deg);
          border-left: 1px solid #eee;
          border-top: 1px solid #eee;
        }
        
        .address-text {
          font-size: 0.9rem;
          color: #555;
          line-height: 1.5;
          margin-bottom: 15px;
          text-align: left;
        }
        
        .address-text strong {
          color: #333;
          font-size: 1rem;
          display: block;
          margin-bottom: 5px;
        }
        
        .direction-btn {
          display: block;
          width: 100%;
          text-align: center;
          background-color: #5d2b1a;
          color: white;
          padding: 8px 0;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }
        
        .direction-btn:hover {
          background-color: #741d1d;
        }

      `}</style>
    </header>
  );
};

export default Header;
