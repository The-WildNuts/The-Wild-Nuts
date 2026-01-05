import React from 'react';
import { MessageCircle, HelpCircle } from 'lucide-react';

const FloatingActions = () => {
    return (
        <div className="floating-actions">
            <div className="action-button support-button">
                <HelpCircle size={24} />
            </div>
            <div className="action-button whatsapp-button">
                <MessageCircle size={30} fill="currentColor" />
            </div>
            <style jsx>{`
        .floating-actions {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          z-index: 2000;
        }
        .action-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .action-button:hover {
          transform: scale(1.1);
        }
        .support-button {
          background-color: #25d366; /* Note: In the image one is green, one is whatsapp logo */
          color: white;
          background: #00bf8f;
        }
        .whatsapp-button {
          background-color: #25d366;
          color: white;
          width: 60px;
          height: 60px;
        }
      `}</style>
        </div>
    );
};

export default FloatingActions;
