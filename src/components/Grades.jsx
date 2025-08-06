import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Grades() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({}); // { subject_id: grade }
  const [message, setMessage] = useState('');

  const fetchStudentData = useCallback(async () => {
    // This is not ideal, we should have a get-student-by-id handler
    // For now, we'll filter from the list of all students.
    const allStudents = await window.db.getStudents();
    const currentStudent = allStudents.find(s => s.id === parseInt(studentId));
    if (currentStudent) {
      setStudent(currentStudent);
      if (currentStudent.class_id) {
        const classSubjects = await window.db.getSubjectsForClass(currentStudent.class_id);
        setSubjects(classSubjects);
        const studentGrades = await window.db.getGradesForStudent(currentStudent.id);
        // Convert grades array to a map for easier state management
        const gradesMap = studentGrades.reduce((acc, g) => {
          acc[g.subject_id] = g.grade;
          return acc;
        }, {});
        setGrades(gradesMap);
      }
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleGradeChange = (subjectId, value) => {
    setGrades(prev => ({
      ...prev,
      [subjectId]: value === '' ? null : parseInt(value, 10),
    }));
  };

  const handleSave = async () => {
    const gradesToSave = Object.entries(grades).map(([subject_id, grade]) => ({
      subject_id: parseInt(subject_id),
      grade,
    }));

    try {
      await window.db.updateStudentGrades({ studentId: parseInt(studentId), grades: gradesToSave });
      setMessage('تم حفظ الدرجات بنجاح!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save grades:', error);
      setMessage('حدث خطأ أثناء حفظ الدرجات.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!student) {
    return <div style={{ padding: '20px' }}>جاري تحميل بيانات الطالب...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <button onClick={() => navigate('/students')}>&larr; العودة إلى قائمة الطلاب</button>
      <h2>درجات الطالب: {student.name}</h2>
      <p>الفصل: {student.class_name || 'غير محدد'}</p>

      {subjects.length > 0 ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {subjects.map(subject => (
              <div key={subject.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #ddd' }}>
                <label htmlFor={`grade-${subject.id}`} style={{ flex: 1 }}>{subject.name}:</label>
                <input
                  id={`grade-${subject.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={grades[subject.id] || ''}
                  onChange={(e) => handleGradeChange(subject.id, e.target.value)}
                  style={{ width: '100px', padding: '8px' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} style={{ padding: '10px 20px' }}>حفظ الدرجات</button>
            <button onClick={() => navigate(`/students/${studentId}/report-card`)} style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white' }}>طباعة شهادة</button>
          </div>
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        </div>
      ) : (
        <p>لا توجد مواد دراسية مرتبطة بهذا الفصل. يرجى تعيين المواد أولاً من شاشة "الفصول الدراسية".</p>
      )}
    </div>
  );
}

export default Grades;
