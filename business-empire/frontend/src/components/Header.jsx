// frontend/src/components/Header.jsx
import React from 'react';

export default function Header({ coins, passiveIncome }) {
  return (
    <div className="header">
      <div className="header-item">
        <span className="header-icon">💰</span>
        <span className="header-value">{Math.floor(coins)}</span>
      </div>
      <div className="header-item passive">
        <span className="header-icon">📈</span>
        <span className="header-value">+{passiveIncome}/мин</span>
      </div>
    </div>
  );
}
