import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  // Placeholder data
  const stats = {
    totalStudents: 1200,
    totalClasses: 50,
    totalSubjects: 30,
    pendingFees: 25,
    upcomingEvents: 3,
  };

  const shortcuts = [
    { name: 'Add Student', path: '/students', icon: 'fas fa-user-plus' },
    { name: 'View Grades', path: '/grades', icon: 'fas fa-graduation-cap' },
    { name: 'Manage Fees', path: '/fees', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Print ID Cards', path: '/id-card', icon: 'fas fa-id-card' },
  ];

  return (
    <div className="home-container">
      <header>
        {/* Placeholder for logo */}
        <img src="https://via.placeholder.com/150" alt="School Logo" />
        <h1>Welcome to Our School</h1>
      </header>

      <section className="stats">
        <div className="stat-item">
          <h2>{stats.totalStudents}</h2>
          <p>Total Students</p>
        </div>
        <div className="stat-item">
          <h2>{stats.totalClasses}</h2>
          <p>Total Classes</p>
        </div>
        <div className="stat-item">
          <h2>{stats.totalSubjects}</h2>
          <p>Total Subjects</p>
        </div>
        <div className="stat-item">
          <h2>{stats.pendingFees}</h2>
          <p>Pending Fees</p>
        </div>
        <div className="stat-item">
          <h2>{stats.upcomingEvents}</h2>
          <p>Upcoming Events</p>
        </div>
      </section>

      <section className="shortcuts">
        <h2>Quick Actions</h2>
        <div className="shortcut-buttons">
          {shortcuts.map((shortcut, index) => (
            <Link to={shortcut.path} key={index} className="shortcut-button">
              <div>
                <i className={shortcut.icon}></i>
                <p>{shortcut.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
