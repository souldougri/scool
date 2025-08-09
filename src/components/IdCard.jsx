import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function IdCard() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [studentPhoto, setStudentPhoto] = useState(null);
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

        if (studentData.photo_path) {
          const photoData = await window.db.getStudentPhoto(studentData.photo_path);
          setStudentPhoto(photoData);
        }

        const schoolName = await window.db.getSetting('schoolName');
        const schoolLogo = await window.db.getLogo();
        setSchoolInfo({ name: schoolName, logo: schoolLogo });
      } catch (error) {
        console.error("Failed to fetch ID card data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [studentId]);

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const result = await window.db.exportToPdf({
        printBackground: true,
        pageSize: { width: 85600, height: 53980 } // in microns
    });
    if (result.success) {
      alert(`تم حفظ البطاقة بنجاح في: ${result.path}`);
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

  return (
    <div className="container">
      <div className="page-header no-print">
        <h2>بطاقة الطالب: {student.name}</h2>
        <div className="actions">
            <button onClick={() => navigate('/students')} className="secondary">&larr; العودة إلى الطلاب</button>
            <button onClick={handlePrint}>طباعة</button>
            <button onClick={handleExportPdf} className="secondary">حفظ كـ PDF</button>
        </div>
      </div>

      <div id="print-area" className="id-card-container">
        <div className="id-card">
            <header className="id-card-header">
                {schoolInfo.logo && <img src={schoolInfo.logo} alt="School Logo"/>}
                <span>{schoolInfo.name}</span>
            </header>
            <div className="id-card-body">
                <div className="id-card-photo">
                    {studentPhoto ?
                        <img src={studentPhoto} alt="Student" /> :
                        <div style={{ background: '#ccc', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>صورة</div>
                    }
                </div>
                <div className="id-card-details">
                    <p><strong>الاسم:</strong> {student.name}</p>
                    <p><strong>تاريخ الميلاد:</strong> {student.dob}</p>
                    <p><strong>مكان الميلاد:</strong> {student.place_of_birth}</p>
                </div>
            </div>
            <footer className="id-card-footer">
                بطاقة تعريفية
            </footer>
        </div>
      </div>
    </div>
  );
}

export default IdCard;
