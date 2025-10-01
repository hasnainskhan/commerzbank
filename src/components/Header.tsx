import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Header.css';

const Header: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const [customerType, setCustomerType] = useState('Private customers');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Commerzbank website
    window.open('https://www.commerzbank.de/', '_blank', 'noopener,noreferrer');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.querySelector('.mobile-menu');
      const hamburgerButton = document.querySelector('.hamburger-menu');
      
      // Check if click is outside the mobile menu and hamburger button
      if (isMenuOpen && 
          mobileMenu && 
          !mobileMenu.contains(target) && 
          hamburgerButton && 
          !hamburgerButton.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      {/* Top utility section */}
      <div className="header-top">
        <div className="header-container">
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
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
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="utility-link">{t('group')}</a>
            <span className="separator">|</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as 'English' | 'Deutsch')}
              className="language-select"
            >
              <option value="English">English</option>
              <option value="Deutsch">Deutsch</option>
            </select>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="utility-link">{t('profileSettings')}</a>
          </div>
        </div>
      </div>

      {/* Main header section */}
      <div className="header-main">
        <div className="header-container">
          <div className="branding-section">
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="logo" style={{ textDecoration: 'none' }}>
              <span className="logo-text">COMMERZBANK</span>
              <img 
                src="/commerz.png" 
                alt="Commerz Logo" 
                className="logo-image"
              />
            </a>
            <button className="hamburger-menu" onClick={toggleMenu}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          </div>

          <div className="customer-type-section">
            <button 
              className={`customer-type-btn ${customerType === 'Private customers' ? 'active' : ''}`}
              onClick={() => setCustomerType('Private customers')}
            >
              {t('privateCustomers')}
            </button>
            <button 
              className={`customer-type-btn ${customerType === 'Business customers' ? 'active' : ''}`}
              onClick={() => setCustomerType('Business customers')}
            >
              {t('businessCustomers')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="header-navigation">
        <div className="header-container">
          <nav className="main-navigation">
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('home')}</a>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('accountsCards')}</a>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('depotOrder')}</a>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('analysis')}</a>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('service')}</a>
            <span className="separator">|</span>
            <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="nav-link">{t('productsKnowledge')}</a>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="mobile-menu-content">
            {/* Search Section */}
            <div className="mobile-search-section">
              <form onSubmit={handleSearch} className="mobile-search-form">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mobile-search-input"
                />
                <button type="submit" className="mobile-search-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>

            {/* Utility Links */}
            <div className="mobile-utility-links">
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-utility-link">{t('group')}</a>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Deutsch')}
                className="mobile-language-select"
              >
                <option value="English">English</option>
                <option value="Deutsch">Deutsch</option>
              </select>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-utility-link">{t('profileSettings')}</a>
            </div>

            {/* Customer Type Buttons */}
            <div className="mobile-customer-type-section">
              <button 
                className={`mobile-customer-type-btn ${customerType === 'Private customers' ? 'active' : ''}`}
                onClick={() => setCustomerType('Private customers')}
              >
                {t('privateCustomers')}
              </button>
              <button 
                className={`mobile-customer-type-btn ${customerType === 'Business customers' ? 'active' : ''}`}
                onClick={() => setCustomerType('Business customers')}
              >
                {t('businessCustomers')}
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="mobile-main-navigation">
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('home')}</a>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('accountsCards')}</a>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('depotOrder')}</a>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('analysis')}</a>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('service')}</a>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{t('productsKnowledge')}</a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
