import React from 'react';

const AnnouncementBar = () => {
    return (
        <div className="announcement-bar">
            <div className="scrolling-text">
                <span>✨ New Year Sale: Up to 60% Off on Dry Fruits! ✨</span>
                <span>🛍️ Buy 3 @ ₹999 | Buy 4 @ ₹1399 🛍️</span>
                <span>🥜 Extra 10% OFF on Jumbo Nuts 🥜</span>
                <span>✨ New Year Sale: Up to 60% Off on Dry Fruits! ✨</span>
            </div>
            <style jsx>{`
        .announcement-bar {
          background-color: #741d1d;
          color: #fff;
          padding: 8px 0;
          overflow: hidden;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
        }
        .scrolling-text {
          display: inline-block;
          animation: scroll 30s linear infinite;
          padding-left: 100%;
        }
        .scrolling-text span {
          margin-right: 50px;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
};

export default AnnouncementBar;
