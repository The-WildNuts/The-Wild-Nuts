
import React, { useState, useEffect } from 'react';

const HeroBanner = () => {
  const banners = [
    { id: 1, src: "/hero-banner-wide.png", alt: "Healthy, tasty, and ready when cravings strike" },
    { id: 2, src: "/hero-branded-nuts.png", alt: "Premium Quality Nuts & Dry Fruits" },
    { id: 3, src: "/hero-branded-mixes.png", alt: "Daily Mixes for your healthy routine" },
    { id: 4, src: "/hero-branded-fruits.png", alt: "Exotic Dried Fruits Collection" },
    { id: 5, src: "/hero-branded-malt.png", alt: "Healthy Malt Drinks" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="hero-banner">
      <div className="banner-outer-container">
        <div className="banner-wrapper">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`slide ${index === currentIndex ? 'active' : ''}`}
              style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
            >
              <img src={banner.src} alt={banner.alt} className="hero-image" />
            </div>
          ))}

          <div className="pagination-dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .hero-banner {
          width: 100%;
          background: #fff;
          padding: 10px 0;
        }
        .banner-outer-container {
          width: 98%;
          max-width: 1800px;
          margin: 0 auto;
        }
        .banner-wrapper {
          position: relative;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          aspect-ratio: 16 / 6;
          background: #f0f0f0; /* Placeholder color while loading */
        }
        .slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transition: transform 0.5s ease-in-out;
            will-change: transform;
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pagination-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          align-items: center;
          z-index: 10;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .dot.active {
          background: #fff;
          width: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        @media (max-width: 768px) {
          .banner-wrapper {
            border-radius: 20px;
            aspect-ratio: 16 / 10; /* Taller on mobile */
          }
          .banner-outer-container {
            width: 95%;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
