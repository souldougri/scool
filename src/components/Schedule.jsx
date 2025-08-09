import React, { useState, useEffect, useMemo } from 'react';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [1, 2, 3, 4, 5, 6];

function Schedule() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [schoolName, setSchoolName] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'success' });

  useEffect(() => {
    const fetchInitialData = async () => {
      const allClasses = await window.db.getClasses();
      setClasses(allClasses);
      const name = await window.db.getSetting('schoolName');
      setSchoolName(name);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      setSchedule({});
      return;
    }

    const fetchClassData = async () => {
      const classSubjects = await window.db.getSubjectsForClass(selectedClassId);
      setSubjects(classSubjects);
      const classSchedule = await window.db.getScheduleForClass(selectedClassId);
      const scheduleMap = classSchedule.reduce((acc, slot) => {
        acc[`${slot.day_of_week}-${slot.period}`] = slot.subject_id;
        return acc;
      }, {});
      setSchedule(scheduleMap);
    };
    fetchClassData();
  }, [selectedClassId]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
  };

  const handleScheduleChange = (dayIndex, period, subjectId) => {
    setSchedule(prev => ({
      ...prev,
      [`${dayIndex}-${period}`]: subjectId,
    }));
  };

  const handleSave = async () => {
    const scheduleToSave = Object.entries(schedule)
      .filter(([, subject_id]) => subject_id)
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
      showMessage('تم حفظ الجدول بنجاح!');
    } catch(error) {
      console.error('Failed to save schedule:', error);
      showMessage('حدث خطأ أثناء حفظ الجدول.', 'error');
    }
  };

  const handlePrint = () => window.print();

  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const selectedClassName = useMemo(() => classes.find(c => c.id == selectedClassId)?.name, [classes, selectedClassId]);

  return (
    <div className="container">
      <div className="page-header no-print">
        <h2>إدارة الجدول الأسبوعي</h2>
        <div className="actions">
          <select id="class-select" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
            <option value="">اختر فصلاً...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedClassId && (
            <>
              <button onClick={handleSave}>حفظ الجدول</button>
              <button onClick={handlePrint} className="secondary">طباعة</button>
            </>
          )}
        </div>
      </div>

      {message.text && <div className={`message no-print ${message.type}`}>{message.text}</div>}

      {selectedClassId ? (
        <div id="print-area">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3>{schoolName}</h3>
            <h4>الجدول الأسبوعي لفصل: {selectedClassName}</h4>
          </div>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>الحصة</th>
                {DAYS.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td><strong>الحصة {period}</strong></td>
                  {DAYS.map((day, dayIndex) => (
                    <td key={dayIndex}>
                      <div className="no-print">
                        <select
                          value={schedule[`${dayIndex}-${period}`] || ''}
                          onChange={e => handleScheduleChange(dayIndex, period, e.target.value)}
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
      ) : (
        <div className="message">الرجاء اختيار فصل لعرض أو تعديل جدوله.</div>
      )}
    </div>
  );
}

export default Schedule;
