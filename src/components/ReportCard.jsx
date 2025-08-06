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

    const average = totalMarks / subjects.length;
    const result = average >= 50 ? 'ناجح' : 'راسب';

    return { details, totalMarks, average, result };
  }, [student, subjects, grades]);

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const result = await window.db.exportToPdf({ pageSize: 'A4' });
    if (result.success) {
      alert(`تم حفظ الشهادة بنجاح في: ${result.path}`);
    } else {
      alert(`حدث خطأ: ${result.error}`);
    }
  };

  if (loading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  if (!student) {
    return <div>لم يتم العثور على الطالب.</div>;
  }

  if (!reportData) {
      return <div>لا توجد مواد أو درجات لعرضها.</div>
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="no-print" style={{ padding: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate(`/students/${studentId}/grades`)}>&larr; العودة إلى صفحة الدرجات</button>
          <button onClick={handlePrint} style={{ margin: '0 10px' }}>طباعة</button>
          <button onClick={handleExportPdf}>حفظ كـ PDF</button>
      </div>
      <div id="print-area" style={{ direction: 'rtl', fontFamily: 'Tajawal, sans-serif', padding: '20px', margin: '20px auto', width: '210mm', minHeight: '297mm', border: '2px solid black' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
          {schoolInfo.logo && <img src={schoolInfo.logo} alt="School Logo" style={{ width: '100px', height: '100px' }} />}
          <h1>{schoolInfo.name}</h1>
          <h2>شهادة نتائج نهاية العام الدراسي</h2>
        </header>

        <section style={{ marginBottom: '30px' }}>
          <p><strong>اسم الطالب:</strong> {student.name}</p>
          <p><strong>الفصل الدراسي:</strong> {student.class_name}</p>
          <p><strong>تاريخ الميلاد:</strong> {student.dob}</p>
        </section>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>المادة الدراسية</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>الدرجة (من 100)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.subjectName}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.grade}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold', background: '#f2f2f2' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>المجموع</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{reportData.totalMarks}</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>المعدل</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{reportData.average.toFixed(2)}%</td>
            </tr>
          </tfoot>
        </table>

        <footer style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>النتيجة النهائية: <span style={{ color: reportData.result === 'ناجح' ? 'green' : 'red' }}>{reportData.result}</span></p>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '80px' }}>
            <p><strong>توقيع مدير المدرسة</strong></p>
            <p><strong>الختم الرسمي</strong></p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ReportCard;
