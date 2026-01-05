import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../api';

const Navbar = () => {
  const [categories, setCategories] = useState([]);

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
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  /* Curated list of categories to display in the header nav to keep it clean */
  const DISPLAY_ORDER = [
    'Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Dates',
    'Fig', 'Raisins', 'Seeds', 'Berries', 'Dried Fruits',
    'Mixes', 'Daily Mixes', 'Malt', 'Malt/Drink'
  ];

  /* Filter and Sort categories based on DISPLAY_ORDER */
  const visibleCategories = categories.filter(cat => {
    const name = (cat.name || '').trim();
    // Check if this category matches any in our display list (partial or exact match logic if needed, but exact is safer for "White")
    // We use case-insensitive matching against our allowed list
    return DISPLAY_ORDER.some(allowed => allowed.toLowerCase() === name.toLowerCase());
  }).sort((a, b) => {
    const nameA = (a.name || '').trim().toLowerCase();
    const nameB = (b.name || '').trim().toLowerCase();
    const indexA = DISPLAY_ORDER.findIndex(allowed => allowed.toLowerCase() === nameA);
    const indexB = DISPLAY_ORDER.findIndex(allowed => allowed.toLowerCase() === nameB);
    // If both found, sort by index. If one not found (shouldn't happen due to filter), put at end.
    return indexA - indexB;
  });

  const menuItems = [
    { name: 'Home', icon: iconMap['Home'], path: '/' },
    ...visibleCategories.map(cat => {
      let name = cat.name || 'Category';
      if (name === 'Malt') name = 'Malt/Drink';
      const safeName = typeof name === 'string' ? name : String(name);
      return {
        name: safeName,
        icon: iconMap[safeName] || iconMap[safeName.split('/')[0]] || '📦',
        path: `/shop/${safeName.toLowerCase().replace(/[\s\/]+/g, '-')}`
      };
    })
  ];

  return (
    <nav className="main-nav">
      <div className="container">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <li className="nav-item">
                <Link to={item.path}>
                  {item.icon && <span className="item-icon">{item.icon}</span>}
                  {item.name}
                </Link>
              </li>
              {index < menuItems.length - 1 && <li className="nav-dot">•</li>}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .main-nav {
          background: #000;
          color: #fff;
          border-top: 1px solid #333;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 15px; /* Use more space */
        }
        .nav-list {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          justify-content: flex-start;
          align-items: center;
          gap: 15px;
          padding: 15px 5px;
          list-style: none;
          margin: 0;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE 10+ */
        }
        .nav-list::-webkit-scrollbar { 
          display: none; /* Chrome/Safari */
        }
        @media (min-width: 1200px) {
           /* Keep flex-start to ensure all items are visible */
        }
        .nav-item {
          display: flex;
          align-items: center;
          flex-shrink: 0; /* Prevent shrinking */
        }
        .nav-item :global(a) {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          transition: color 0.2s;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap !important;
        }
        .nav-item :global(a:hover) {
          color: #f7941d;
        }
        .item-icon {
          font-size: 16px;
          display: inline-block;
          margin-right: 5px;
        }
        .nav-dot {
          color: #fff;
          font-size: 14px;
          opacity: 0.5;
          flex-shrink: 0;
        }
        @media (max-width: 1200px) {
          .nav-list {
            gap: 10px;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 12px 10px;
          }
          .nav-item :global(a) {
            font-size: 12px;
            white-space: nowrap;
          }
        }
        @media (max-width: 768px) {
          .main-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
