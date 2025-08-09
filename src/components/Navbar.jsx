import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [schoolName, setSchoolName] = useState('School Name');
  const [schoolLogo, setSchoolLogo] = useState(null);

  const fetchSchoolInfo = async () => {
    const name = await window.db.getSetting('schoolName');
    const logo = await window.db.getLogo();
    if (name) setSchoolName(name);
    if (logo) setSchoolLogo(logo);
  };

  useEffect(() => {
    fetchSchoolInfo();

    // This is a simple way to listen for updates from the settings page.
    // A more robust solution might use a global state manager.
    const handleSettingsUpdate = () => {
        fetchSchoolInfo();
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => {
        window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {schoolLogo && <img src={schoolLogo} alt="School Logo" className="navbar-logo" />}
        <h1 className="navbar-school-name">{schoolName}</h1>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")} end>الإعدادات</NavLink>
        <NavLink to="/students" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>الطلاب</NavLink>
        <NavLink to="/classes" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>الفصول الدراسية</NavLink>
        <NavLink to="/subjects" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>المواد الدراسية</NavLink>
        <NavLink to="/schedule" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>الجدول الأسبوعي</NavLink>
        <NavLink to="/reports/fees" className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>تقرير الرسوم</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
