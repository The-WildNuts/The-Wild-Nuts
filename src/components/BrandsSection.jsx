import React, { useState, useEffect } from 'react';
import { fetchBrands } from '../api';
import { Loader2 } from 'lucide-react';

const BrandsSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      const data = await fetchBrands();
      setBrands(data || []);
      setLoading(false);
    };
    loadBrands();
  }, []);

  return (
    <section className="brands-section">
      <div className="container">
        <h2 className="section-title">Our Brands</h2>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="brands-grid">
            {brands.length > 0 ? (
              brands.map((brand, index) => (
                <div key={index} className="brand-logo-card">
                  <img src={brand.image || '/logo-clean.png'} alt={brand.name} />
                  <span>{brand.name}</span>
                </div>
              ))
            ) : (
              <p className="no-data">Connect Google Sheets to see brands</p>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        .brands-section {
          padding: 80px 0;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-title {
          font-size: 48px;
          font-weight: 800;
          color: #000;
          text-align: center;
          margin-bottom: 50px;
          font-family: var(--font-heading);
          text-transform: capitalize;
        }
        .brands-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 40px;
          width: 100%;
          margin-top: 20px;
        }
        .brand-logo-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: transform 0.3s;
        }
        .brand-logo-card:hover {
          transform: scale(1.1);
        }
        .brand-logo-card img {
          height: 80px;
          width: 80px;
          object-fit: contain;
          filter: grayscale(100%);
          transition: filter 0.3s;
        }
        .brand-logo-card:hover img {
          filter: grayscale(0%);
        }
        .brand-logo-card span {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }
        .loader-container {
          display: flex;
          justify-content: center;
          padding: 40px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
          color: #741d1d;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-data {
          color: #888;
          font-style: italic;
        }
      `}</style>
    </section>
  );
};

export default BrandsSection;
