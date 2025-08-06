import React, { useState, useEffect, useMemo } from 'react';

// Constants for the schedule grid
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [1, 2, 3, 4, 5, 6]; // 6 periods per day

function Schedule() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState({}); // { 'day-period': subject_id }
  const [schoolName, setSchoolName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const allClasses = await window.db.getClasses();
      setClasses(allClasses);
      const name = await window.db.getSetting('schoolName');
      setSchoolName(name);
    };
    fetchInitialData();
  }, []);

  // Fetch subjects and schedule when a class is selected
  useEffect(() => {
    if (!selectedClassId) {
        setSubjects([]);
        setSchedule({});
        return;
    };

    const fetchClassData = async () => {
      const classSubjects = await window.db.getSubjectsForClass(selectedClassId);
      setSubjects(classSubjects);
      const classSchedule = await window.db.getScheduleForClass(selectedClassId);
      // Convert schedule array to a map for easier state management
      const scheduleMap = classSchedule.reduce((acc, slot) => {
        acc[`${slot.day_of_week}-${slot.period}`] = slot.subject_id;
        return acc;
      }, {});
      setSchedule(scheduleMap);
    };
    fetchClassData();
  }, [selectedClassId]);

  const handleScheduleChange = (dayIndex, period, subjectId) => {
    setSchedule(prev => ({
      ...prev,
      [`${dayIndex}-${period}`]: subjectId,
    }));
  };

  const handleSave = async () => {
    const scheduleToSave = Object.entries(schedule)
      .filter(([, subject_id]) => subject_id) // Only save slots that have a subject
      .map(([key, subject_id]) => {
        const [day_of_week, period] = key.split('-');
        return {
          class_id: parseInt(selectedClassId),
          day_of_week: parseInt(day_of_week),
          period: parseInt(period),
          subject_id: parseInt(subject_id),
        };
      });

    try {
      await window.db.updateScheduleForClass({ classId: selectedClassId, schedule: scheduleToSave });
      setMessage('تم حفظ الجدول بنجاح!');
      setTimeout(() => setMessage(''), 3000);
    } catch(error) {
      console.error('Failed to save schedule:', error);
      setMessage('حدث خطأ أثناء حفظ الجدول.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePrint = () => window.print();

  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

  return (
    <>
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; text-align: center; }
      }
    `}</style>
    <div className="no-print" style={{ padding: '20px' }}>
      <h2>إدارة الجدول الأسبوعي</h2>
      <div>
        <label htmlFor="class-select">اختر الفصل: </label>
        <select id="class-select" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
          <option value="">--</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {selectedClassId && (
        <div style={{ marginTop: '20px' }}>
            <button onClick={handleSave}>حفظ الجدول</button>
            <button onClick={handlePrint} style={{ marginRight: '10px' }}>طباعة الجدول</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
      )}
    </div>

    {selectedClassId && (
        <div id="print-area" style={{ padding: '20px', direction: 'rtl' }}>
            <h3 style={{textAlign: 'center'}}>{schoolName}</h3>
            <h4 style={{textAlign: 'center'}}>الجدول الأسبوعي لفصل: {classes.find(c => c.id == selectedClassId)?.name}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>الحصة</th>
                        {DAYS.map(day => <th key={day} style={{border: '1px solid #ddd', padding: '8px'}}>{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {PERIODS.map(period => (
                        <tr key={period}>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>الحصة {period}</strong></td>
                            {DAYS.map((day, dayIndex) => (
                                <td key={dayIndex} style={{border: '1px solid #ddd', padding: '8px'}}>
                                    <div className="no-print">
                                        <select
                                            value={schedule[`${dayIndex}-${period}`] || ''}
                                            onChange={e => handleScheduleChange(dayIndex, period, e.target.value)}
                                            style={{width: '100%'}}
                                        >
                                            <option value="">--</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <span className="print-only">
                                        {subjectsMap.get(parseInt(schedule[`${dayIndex}-${period}`])) || '---'}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
    </>
  );
}

export default Schedule;
