import React, { useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [language, setLanguage] = useState('English');
  const [customerType, setCustomerType] = useState('Private customers');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchText);
    // Add search functionality here
  };

  return (
    <header className="header">
      {/* Top utility section */}
      <div className="header-top">
        <div className="header-container">
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Your search text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
          
          <div className="utility-links">
            <a href="#" className="utility-link">Group</a>
            <span className="separator">|</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="English">English</option>
              <option value="Deutsch">Deutsch</option>
            </select>
            <span className="separator">|</span>
            <a href="#" className="utility-link">Profile & Settings</a>
          </div>
        </div>
      </div>

      {/* Main header section */}
      <div className="header-main">
        <div className="header-container">
          <div className="branding-section">
            <div className="logo">
              <span className="logo-text">COMMERZBANK</span>
              <img 
                src="/commerz.png" 
                alt="Commerz Logo" 
                className="logo-image"
              />
            </div>
          </div>

          <div className="customer-type-section">
            <button 
              className={`customer-type-btn ${customerType === 'Private customers' ? 'active' : ''}`}
              onClick={() => setCustomerType('Private customers')}
            >
              Private customers
            </button>
            <button 
              className={`customer-type-btn ${customerType === 'Business customers' ? 'active' : ''}`}
              onClick={() => setCustomerType('Business customers')}
            >
              Business customers
            </button>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="header-navigation">
        <div className="header-container">
          <nav className="main-navigation">
            <a href="#" className="nav-link">Home</a>
            <span className="separator">|</span>
            <a href="#" className="nav-link">Accounts & Cards</a>
            <span className="separator">|</span>
            <a href="#" className="nav-link">Depot & Order</a>
            <span className="separator">|</span>
            <a href="#" className="nav-link">Analysis</a>
            <span className="separator">|</span>
            <a href="#" className="nav-link">Service</a>
            <span className="separator">|</span>
            <a href="#" className="nav-link">Products & Knowledge</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
