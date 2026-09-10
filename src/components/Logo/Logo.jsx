import React from 'react';
import './Logo.scss';
import { Link } from 'react-router-dom';
export default function Logo({ variant = 'header', className = '' }) {
  return (
    <Link to="/" className={`rebook-logo variant-${variant} ${className}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="book-svg">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      </div>
      <span className="logo-text">Rebook</span>
    </Link>
  );
}
