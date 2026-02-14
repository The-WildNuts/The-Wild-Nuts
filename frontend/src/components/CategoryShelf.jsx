import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchCategories } from '../api';

const CategoryShelf = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const mockCategories = [
    { name: 'Almond', image: '/almond.png', color: '#9a7b70' },
    { name: 'Cashew', image: '/cashew.png', color: '#2c7a8b' },
    { name: 'Pista', image: '/pista.png', color: '#7a8b70' },
    { name: 'Walnut', image: '/walnut.png', color: '#8b2c3d' },
    { name: 'Raisin', image: '/raisin.png', color: '#b88a5d' },
    { name: 'Fig', image: '/fig.png', color: '#8b6e60' },
    { name: 'Dates', image: '/dates.png', color: '#7d2a14' },
    { name: 'Blueberry', image: '/blueberry.png', color: '#3e3e4a' },
    { name: 'Cranberry', image: '/cranberry.png', color: '#7a1d35' },
    { name: 'Apricot', image: '/apricot.png', color: '#f7941d' },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Scroll by 400px
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      const imageMap = {
        'almonds': { image: '/almond.png', color: '#9a7b70' },
        'almond': { image: '/almond.png', color: '#9a7b70' },
        'cashew': { image: '/cashew.png', color: '#2c7a8b' },
        'cashews': { image: '/cashew.png', color: '#2c7a8b' },
        'pistachios': { image: '/pista.png', color: '#7a8b70' },
        'pistachio': { image: '/pista.png', color: '#7a8b70' },
        'walnuts': { image: '/walnut.png', color: '#8b2c3d' },
        'walnut': { image: '/walnut.png', color: '#8b2c3d' },
        'raisins': { image: '/raisin.png', color: '#b88a5d' },
        'raisin': { image: '/raisin.png', color: '#b88a5d' },
        'figs': { image: '/fig.png', color: '#8b6e60' },
        'fig': { image: '/fig.png', color: '#8b6e60' },
        'dates': { image: '/dates.png', color: '#7d2a14' },
        'blueberries': { image: '/blueberry.png', color: '#3e3e4a' },
        'blueberry': { image: '/blueberry.png', color: '#3e3e4a' },
        'cranberries': { image: '/cranberry.png', color: '#7a1d35' },
        'cranberry': { image: '/cranberry.png', color: '#7a1d35' },
        'apricots': { image: '/apricot.png', color: '#f7941d' },
        'apricot': { image: '/apricot.png', color: '#f7941d' },
        'mixes': { image: '/card_daily_mix.png', color: '#a0522d' },
        'mix': { image: '/card_daily_mix.png', color: '#a0522d' },
        'malt': { image: '/card_malt.png', color: '#5d2b1a' },
        'malt/drink': { image: '/card_malt.png', color: '#5d2b1a' },
        'seeds': { image: '/card_seeds.png', color: '#8bc34a' },
        'seed': { image: '/card_seeds.png', color: '#8bc34a' },
        'dried fruits': { image: '/card_dried_fruits.png', color: '#e67e22' },
        'dried fruit': { image: '/card_dried_fruits.png', color: '#e67e22' },
        'daily mixes': { image: '/card_daily_mix.png', color: '#d35400' },
        'daily mix': { image: '/card_daily_mix.png', color: '#d35400' },
        'white': { image: '/pouch_sesame_seeds.png', color: '#f5f5f5' }, // Original backend name
        'sesame': { image: '/pouch_sesame_seeds.png', color: '#f5f5f5' }, // New display name
        'berries': { image: '/blueberry.png', color: '#3e3e4a' }
      };

      if (data && data.length > 0) {
        const enrichedData = data.map(cat => {
          let name = cat.name;
          // Rename White to Sesame
          if (name === 'White') {
            name = 'Sesame';
          }

          const key = (name || '').toLowerCase().trim();
          return {
            ...cat,
            name: name, // Use the renamed name
            image: imageMap[key]?.image || imageMap[cat.name.toLowerCase()]?.image || '/walnut.png',
            color: imageMap[key]?.color || '#5d2b1a'
          };
        });
        setCategories(enrichedData);
      } else {
        setCategories(mockCategories);
      }
      setLoading(false);
    };
    loadCategories();
  }, []);

  return (
    <section className="category-shelf">
      <div className="shelf-container">
        <button className="nav-btn left" onClick={() => scroll('left')}>
          <ChevronLeft size={30} />
        </button>
        <div className="shelf-scroll-wrapper" ref={scrollRef}>
          {loading ? (
            <div className="loader-container">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : (
            <div className="shelf-grid">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="category-card"
                  style={{ backgroundColor: cat.color || '#5d2b1a' }}
                  onClick={() => navigate(`/shop/${cat.name.toLowerCase().replace(/[\s\/]+/g, '-')}`)}
                >
                  <div className="card-image-wrapper">
                    <img src={cat.image} alt={cat.name} className="card-image" />
                  </div>
                  <div className="card-overlay">
                    <h3 className="card-title">{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="nav-btn right" onClick={() => scroll('right')}>
          <ChevronRight size={30} />
        </button>
      </div>
      <style jsx>{`
        .category-shelf {
          padding: 40px 0;
          background: #fff;
        }
        .shelf-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 0 20px;
        }
        .shelf-scroll-wrapper {
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .shelf-scroll-wrapper::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .shelf-grid {
          display: flex;
          gap: 15px;
          padding: 10px 0;
        }
        .category-card {
          border-radius: 20px;
          flex-shrink: 0;
          min-width: 230px;
          height: 280px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .card-image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 20px;
          background: linear-gradient(transparent, rgba(0,0,0,0.5));
          pointer-events: none;
        }
        .card-title {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-family: var(--font-heading);
        }
        .nav-btn {
          color: #333;
          opacity: 0.5;
          transition: all 0.2s;
          background: #f5f5f5;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }
        .nav-btn:hover {
          opacity: 1;
          background: #eee;
          transform: scale(1.1);
        }
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 280px;
          width: 100%;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
          color: #741d1d;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          /* The shelf-grid is now a flex container, so this rule is no longer needed */
          /* .shelf-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          } */
          .category-card {
            height: 250px;
          }
        }
        @media (max-width: 768px) {

          .shelf-container {
            padding: 0 15px;
            display: block;
          }

          .shelf-scroll-wrapper {
            overflow-x: visible; /* remove horizontal scroll */
          }

          .shelf-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .category-card { 
            min-width: 100%;
            height: 200px;
          }

          .nav-btn {
            display: none;
          }

          .card-title {
            font-size: 18px;
          }

        }
        
        @media (max-width: 480px) {
          .shelf-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            height: 180px;
          }
        }


      `}</style>
    </section>
  );
};

export default CategoryShelf;
