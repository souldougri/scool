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
      <Link to="/" style={linkStyle}><i className="fas fa-home"></i> الرئيسية</Link>
      <Link to="/classes" style={linkStyle}><i className="fas fa-school"></i> الفصول الدراسية</Link>
      <Link to="/subjects" style={linkStyle}><i className="fas fa-book"></i> المواد الدراسية</Link>
      <Link to="/students" style={linkStyle}><i className="fas fa-users"></i> الطلاب</Link>
      <Link to="/schedule" style={linkStyle}><i className="fas fa-calendar-alt"></i> الجدول الأسبوعي</Link>
      <Link to="/settings" style={linkStyle}><i className="fas fa-cog"></i> الإعدادات</Link>
    </nav>
  );
}

export default Navbar;
