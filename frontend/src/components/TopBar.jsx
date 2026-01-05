import React from 'react';
import { Megaphone } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-container">
        <div className="promo-text-wrapper">
          <div className="promo-text">
            <Megaphone size={14} className="promo-icon" fill="#ff4081" color="#ff4081" />
            <span>Free Shipping On Orders Above ₹1499/-</span>
          </div>
        </div>
        <div className="top-links">
          <a href="#">Track Order</a>
          <a href="#">Bactopure Certificate</a>
          <a href="#">Franchise</a>
          <a href="#">Bulk Order</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
      <style jsx>{`
        .top-bar {
          background-color: #000;
          color: #fff;
          padding: 10px 0;
          height: 40px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .top-bar-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          position: relative;
        }
        .promo-text-wrapper {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .promo-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }
        .promo-icon {
          transform: rotate(-20deg);
        }
        .top-links {
          display: flex;
          gap: 25px;
          z-index: 10;
        }
        .top-links a {
          color: #fff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .top-links a:hover {
          color: #f7941d;
        }
        @media (max-width: 1100px) {
          .top-links {
            display: none;
          }
          .promo-text-wrapper {
            position: static;
            transform: none;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TopBar;
