import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Settings from './components/Settings';
import Classes from './components/Classes';
import Subjects from './components/Subjects';
import StudentManagement from './components/StudentManagement';
import Grades from './components/Grades';
import ReportCard from './components/ReportCard';
import IdCard from './components/IdCard';
import Schedule from './components/Schedule';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/students/:studentId/grades" element={<Grades />} />
        <Route path="/students/:studentId/report-card" element={<ReportCard />} />
        <Route path="/students/:studentId/id-card" element={<IdCard />} />
      </Routes>
    </Router>
  );
}

export default App;
