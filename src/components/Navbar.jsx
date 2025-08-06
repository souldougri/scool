import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const navStyle = {
    background: '#333',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem',
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>الإعدادات</Link>
      <Link to="/classes" style={linkStyle}>الفصول الدراسية</Link>
      <Link to="/subjects" style={linkStyle}>المواد الدراسية</Link>
      <Link to="/students" style={linkStyle}>الطلاب</Link>
      <Link to="/schedule" style={linkStyle}>الجدول الأسبوعي</Link>
    </nav>
  );
}

export default Navbar;
