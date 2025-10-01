import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: '#f5f5f5',
      padding: '20px 0',
      marginTop: 'auto',
      borderTop: '1px solid #e0e0e0',
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#006400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#333';
        }}>
          {t('pricesConditions')}
        </a>
        
        <span style={{
          color: '#999',
          fontSize: '14px',
          margin: '0 5px'
        }}>|</span>
        
        <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#006400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#333';
        }}>
          {t('imprint')}
        </a>
        
        <span style={{
          color: '#999',
          fontSize: '14px',
          margin: '0 5px'
        }}>|</span>
        
        <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#006400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#333';
        }}>
          {t('legalNotice')}
        </a>
        
        <span style={{
          color: '#999',
          fontSize: '14px',
          margin: '0 5px'
        }}>|</span>
        
        <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#006400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#333';
        }}>
          {t('consentSettings')}
        </a>
        
        <span style={{
          color: '#999',
          fontSize: '14px',
          margin: '0 5px'
        }}>|</span>
        
        <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#006400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#333';
        }}>
          {t('privacyPolicy')}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
