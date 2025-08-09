import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Settings from './components/Settings';
import Classes from './components/Classes';
import Subjects from './components/Subjects';
import StudentManagement from './components/StudentManagement';
import Grades from './components/Grades';
import ReportCard from './components/ReportCard';
import IdCard from './components/IdCard';
import Schedule from './components/Schedule';
import FeeManagement from './components/FeeManagement';
import PaymentReceipt from './components/PaymentReceipt';
import FeeReport from './components/FeeReport';
import './App.css'; // Import the new stylesheet

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Settings />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/students/:studentId/grades" element={<Grades />} />
            <Route path="/students/:studentId/report-card" element={<ReportCard />} />
            <Route path="/students/:studentId/id-card" element={<IdCard />} />
            <Route path="/students/:studentId/fees" element={<FeeManagement />} />
            <Route path="/students/:studentId/receipt/:paymentId" element={<PaymentReceipt />} />
            <Route path="/reports/fees" element={<FeeReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
