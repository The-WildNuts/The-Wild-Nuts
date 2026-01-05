import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MegaMenu = ({ categories, onClose, searchQuery, onSelectCategory }) => {
    const navigate = useNavigate();

    const [activeCategory, setActiveCategory] = useState(null);

    // Filter categories that match search or have sub-categories matching search
    const filteredCategories = (categories || []).filter(cat => {
        const name = cat.name || '';
        const safeName = typeof name === 'string' ? name : String(name);
        const subcategories = cat.subcategories || [];

        return !searchQuery ||
            safeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subcategories.some(sub => String(sub).toLowerCase().includes(searchQuery.toLowerCase()));
    });

    useEffect(() => {
        if (filteredCategories && filteredCategories.length > 0) {
            const currentActiveInFiltered = filteredCategories.find(c => c.name === activeCategory);
            if (!activeCategory || !currentActiveInFiltered) {
                setActiveCategory(filteredCategories[0].name);
            }
        } else {
            setActiveCategory(null);
        }
    }, [categories, searchQuery]);

    const handleCategoryClick = (categoryName) => {
        if (onSelectCategory) {
            onSelectCategory(categoryName);
        } else {
            navigate(`/shop/${categoryName.toLowerCase().replace(/[\s\/]+/g, '-')}`);
            onClose();
        }
    };

    const activeCategoryData = (categories || []).find(cat => cat.name === activeCategory);
    const subCategories = activeCategoryData ? (activeCategoryData.subcategories || []) : [];

    const displayedSubCategories = subCategories.filter(sub => {
        const safeSub = typeof sub === 'string' ? sub : String(sub);
        return !searchQuery || safeSub.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="mega-menu" onMouseLeave={onClose}>
            <div className="mega-menu-container">
                <div className="mega-menu-grid">
                    <div className="menu-column main-categories">
                        <ul>
                            {onSelectCategory && (
                                <li
                                    className={`main-cat-item ${!activeCategory ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveCategory(null)}
                                    onClick={() => handleCategoryClick('All Categories')}
                                >
                                    All Categories
                                </li>
                            )}
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat, index) => (
                                    <li
                                        key={index}
                                        className={`main-cat-item ${activeCategory === cat.name ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveCategory(cat.name)}
                                        onClick={() => handleCategoryClick(cat.name)}
                                    >
                                        {cat.name}
                                    </li>
                                ))
                            ) : (
                                <li className="no-match">No matching categories</li>
                            )}
                        </ul>
                    </div>
                    <div className="menu-column sub-categories">
                        <ul>
                            {displayedSubCategories.length > 0 ? (
                                displayedSubCategories.map((sub, idx) => (
                                    <li
                                        key={idx}
                                        className="sub-cat-item"
                                        onClick={() => {
                                            navigate(`/shop/${String(sub).toLowerCase().replace(/[\s\/]+/g, '-')}`);
                                            onClose();
                                        }}
                                    >
                                        {sub}
                                    </li>
                                ))
                            ) : (
                                <li className="no-results">No sub-categories matching "{searchQuery}"</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .mega-menu {
                    position: absolute;
                    top: calc(100% - 10px);
                    left: -1px;
                    width: calc(100% + 2px);
                    background: transparent;
                    z-index: 1000;
                    animation: fadeIn 0.1s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .mega-menu-grid {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    background: #fff;
                    border-bottom-left-radius: 25px;
                    border-bottom-right-radius: 25px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    border: 1px solid #000;
                    border-top: none;
                    min-height: 300px;
                }
                .menu-column {
                    padding: 30px;
                    position: relative;
                }
                .main-categories {
                    padding-left: 40px;
                    border-right: 1px solid #eee;
                }
                .sub-categories {
                    padding-left: 40px;
                }
                .main-cat-item {
                    font-size: 16px;
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    list-style: none;
                }
                .main-cat-item.active, .main-cat-item:hover {
                    color: #000;
                }
                .no-match, .no-results {
                    font-size: 14px;
                    color: #999;
                    font-style: italic;
                    list-style: none;
                }
                .menu-column ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .sub-cat-item {
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 18px;
                    cursor: pointer;
                    transition: color 0.1s;
                }
                .sub-cat-item:hover {
                    color: #741d1d;
                }
            `}</style>
        </div>
    );
};

export default MegaMenu;
