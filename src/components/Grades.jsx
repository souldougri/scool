import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Grades() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({}); // { subject_id: grade }
  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchStudentData = useCallback(async () => {
    const currentStudent = await window.db.getStudentById(parseInt(studentId));
    if (currentStudent) {
      setStudent(currentStudent);
      if (currentStudent.class_id) {
        const classSubjects = await window.db.getSubjectsForClass(currentStudent.class_id);
        setSubjects(classSubjects);
        const studentGrades = await window.db.getGradesForStudent(currentStudent.id);
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

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
  };

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
      showMessage('تم حفظ الدرجات بنجاح!');
    } catch (error) {
      console.error('Failed to save grades:', error);
      showMessage('حدث خطأ أثناء حفظ الدرجات.', 'error');
    }
  };

  if (!student) {
    return <div className="container">جاري تحميل بيانات الطالب...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>درجات الطالب: {student.name}</h2>
        <button onClick={() => navigate('/students')} className="secondary">&larr; العودة إلى الطلاب</button>
      </div>

      <div className="student-info-grid">
        <p><strong>تاريخ الميلاد:</strong> {student.dob}</p>
        <p><strong>مكان الميلاد:</strong> {student.place_of_birth || '-'}</p>
        <p><strong>رقم الهاتف:</strong> {student.phone_number || '-'}</p>
        <p><strong>السنة الدراسية:</strong> {student.academic_year || '-'}</p>
        <p><strong>الفصل:</strong> {student.class_name || 'غير محدد'}</p>
      </div>

      {subjects.length > 0 ? (
        <>
          <div className="grades-grid">
            {subjects.map(subject => (
              <div key={subject.id} className="grade-item">
                <label htmlFor={`grade-${subject.id}`}>{subject.name}:</label>
                <input
                  id={`grade-${subject.id}`}
                  type="number"
                  min="0"
                  max="20"
                  value={grades[subject.id] ?? ''}
                  onChange={(e) => handleGradeChange(subject.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button onClick={handleSave}>حفظ الدرجات</button>
            <button onClick={() => navigate(`/students/${studentId}/report-card`)} className="secondary">طباعة شهادة</button>
          </div>
          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        </>
      ) : (
        <div className="message">
            لا توجد مواد دراسية مرتبطة بهذا الفصل. يرجى تعيين المواد أولاً من شاشة "الفصول الدراسية".
        </div>
      )}
    </div>
  );
}

export default Grades;
