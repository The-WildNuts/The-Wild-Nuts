import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../api';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const iconMap = {
    'Home': '🏠',
    'Dry Fruits': '🌟',
    'Walnuts': '🌟',
    'Dry Nuts': '💪',
    'Almonds': '💪',
    'Cashews': '🥥',
    'Cashew': '🥥',
    'Dates': '🌴',
    'Combos': '🏷️',
    'Seeds': '🌱',
    'Berries': '🍇',
    'Mixes': '🥥',
    'Malt': '🥤',
    'Malt/Drink': '🥤',
    'Pistachios': '🟢',
    'Pistachio': '🟢'
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  const DISPLAY_ORDER = [
    'Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Dates',
    'Fig', 'Raisins', 'Seeds', 'Berries', 'Dried Fruits',
    'Mixes', 'Daily Mixes', 'Malt', 'Malt/Drink'
  ];

  const visibleCategories = categories
    .filter(cat => {
      const name = (cat.name || '').trim();
      return DISPLAY_ORDER.some(
        allowed => allowed.toLowerCase() === name.toLowerCase()
      );
    })
    .sort((a, b) => {
      const nameA = (a.name || '').trim().toLowerCase();
      const nameB = (b.name || '').trim().toLowerCase();
      return (
        DISPLAY_ORDER.findIndex(x => x.toLowerCase() === nameA) -
        DISPLAY_ORDER.findIndex(x => x.toLowerCase() === nameB)
      );
    });

  const menuItems = [
    { name: 'Home', icon: iconMap['Home'], path: '/' },
    ...visibleCategories.map(cat => {
      let name = cat.name || 'Category';
      if (name === 'Malt') name = 'Malt/Drink';
      const safeName = String(name);
      return {
        name: safeName,
        icon:
          iconMap[safeName] ||
          iconMap[safeName.split('/')[0]] ||
          '📦',
        path: `/shop/${safeName
          .toLowerCase()
          .replace(/[\s\/]+/g, '-')}`
      };
    })
  ];

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <li className="nav-item">
                  <Link to={item.path}>
                    {item.icon && (
                      <span className="item-icon">{item.icon}</span>
                    )}
                    {item.name}
                  </Link>
                </li>
                {index < menuItems.length - 1 && (
                  <li className="nav-dot">•</li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="mobile-nav">
        <div className="mobile-header">
          <button
            className="hamburger"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
          <span className="mobile-title">Categories</span>
        </div>

        {isOpen && (
          <div className="mobile-menu">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* STYLES */}
      <style jsx>{`
        .main-nav {
          background: #000;
          color: #fff;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 15px;
        }

        .nav-list {
          display: flex;
          overflow-x: auto;
          gap: 15px;
          padding: 15px 5px;
          list-style: none;
          margin: 0;
          scrollbar-width: none;
        }

        .nav-list::-webkit-scrollbar {
          display: none;
        }

        .nav-item {
          flex-shrink: 0;
        }

        .nav-item :global(a) {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-item :global(a:hover) {
          color: #f7941d;
        }

        .item-icon {
          font-size: 16px;
        }

        .nav-dot {
          opacity: 0.5;
          flex-shrink: 0;
        }

        /* MOBILE NAV */
        .mobile-nav {
          display: none;
          background: #000;
          color: #fff;
          padding: 10px 15px;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hamburger {
          font-size: 22px;
          background: none;
          border: none;
          color: white;
        }

        .mobile-title {
          font-weight: 600;
        }

        .mobile-menu {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .mobile-menu a {
          padding: 12px 0;
          text-decoration: none;
          color: white;
          border-bottom: 1px solid #333;
        }

        .mobile-menu a:hover {
          color: #f7941d;
        }

        /* RESPONSIVE SWITCH */
        @media (max-width: 768px) {
          .main-nav {
            display: none;
          }

          .mobile-nav {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
