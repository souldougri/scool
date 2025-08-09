import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ReportCard() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({ name: '', logo: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const studentData = await window.db.getStudentById(parseInt(studentId));
        if (!studentData) {
          setLoading(false);
          return;
        }
        setStudent(studentData);

        const subjectsData = await window.db.getSubjectsForClass(studentData.class_id);
        setSubjects(subjectsData);

        const gradesData = await window.db.getGradesForStudent(studentData.id);
        setGrades(gradesData);

        const schoolName = await window.db.getSetting('schoolName');
        const schoolLogo = await window.db.getLogo();
        setSchoolInfo({ name: schoolName, logo: schoolLogo });
      } catch (error) {
        console.error("Failed to fetch report card data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [studentId]);

  const reportData = useMemo(() => {
    if (!student || subjects.length === 0) return null;

    const gradesMap = new Map(grades.map(g => [g.subject_id, g.grade]));
    let totalMarks = 0;
    const details = subjects.map(subject => {
      const grade = gradesMap.get(subject.id) || 0;
      totalMarks += grade;
      return { subjectName: subject.name, grade };
    });

    const average = subjects.length > 0 ? totalMarks / subjects.length : 0;
    const result = average >= 50 ? 'ناجح' : 'راسب';

    return { details, totalMarks, average, result };
  }, [student, subjects, grades]);

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const result = await window.db.exportToPdf({ pageSize: 'A4', printBackground: true });
    if (result.success) {
      alert(`تم حفظ الشهادة بنجاح في: ${result.path}`);
    } else {
      alert(`حدث خطأ: ${result.error}`);
    }
  };

  if (loading) {
    return <div className="container">جاري تحميل البيانات...</div>;
  }

  if (!student) {
    return <div className="container">لم يتم العثور على الطالب.</div>;
  }

  if (!reportData) {
    return <div className="container">لا توجد مواد أو درجات لعرضها.</div>;
  }

  return (
    <div className="container">
        <div className="page-header no-print">
            <h2>شهادة الطالب: {student.name}</h2>
            <div className="actions">
                <button onClick={() => navigate(`/students/${studentId}/grades`)} className="secondary">&larr; العودة إلى الدرجات</button>
                <button onClick={handlePrint}>طباعة</button>
                <button onClick={handleExportPdf} className="secondary">حفظ كـ PDF</button>
            </div>
        </div>

      <div id="print-area" className="report-card">
        <header className="report-card-header">
          {schoolInfo.logo && <img src={schoolInfo.logo} alt="School Logo" />}
          <h1>{schoolInfo.name}</h1>
          <h2>شهادة نتائج نهاية العام الدراسي</h2>
        </header>

        <section className="report-card-student-info">
          <p><strong>اسم الطالب:</strong> {student.name}</p>
          <p><strong>الفصل الدراسي:</strong> {student.class_name}</p>
          <p><strong>تاريخ الميلاد:</strong> {student.dob}</p>
        </section>

        <table>
          <thead>
            <tr>
              <th>المادة الدراسية</th>
              <th>الدرجة (من 100)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((item, index) => (
              <tr key={index}>
                <td>{item.subjectName}</td>
                <td>{item.grade}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
                <td><strong>المجموع</strong></td>
                <td><strong>{reportData.totalMarks}</strong></td>
            </tr>
            <tr>
                <td><strong>المعدل</strong></td>
                <td><strong>{reportData.average.toFixed(2)}%</strong></td>
            </tr>
          </tfoot>
        </table>

        <footer className="report-card-footer">
          <p className="report-card-result">
            النتيجة النهائية: <span className={reportData.result === 'ناجح' ? 'success' : 'fail'}>{reportData.result}</span>
          </p>
          <div className="report-card-signatures">
            <p>توقيع مدير المدرسة</p>
            <p>الختم الرسمي</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ReportCard;
