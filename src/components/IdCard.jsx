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
    // Standard ID card size is approx 85.6mm x 53.98mm
    // In pixels at 96 DPI, this is roughly 323px x 204px.
    // Let's use a slightly larger size for better quality.
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
    return <div>جاري تحميل البيانات...</div>;
  }

  if (!student) {
    return <div>لم يتم العثور على الطالب.</div>;
  }

  const cardStyle = {
    direction: 'rtl',
    fontFamily: 'Tajawal, sans-serif',
    width: '323px', // approx 85.6mm at 96 DPI
    height: '204px', // approx 53.98mm at 96 DPI
    border: '1px solid #aaa',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'white',
  };

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
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="no-print" style={{ padding: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/students')}>&larr; العودة إلى قائمة الطلاب</button>
          <button onClick={handlePrint} style={{ margin: '0 10px' }}>طباعة</button>
          <button onClick={handleExportPdf}>حفظ كـ PDF</button>
      </div>
      <div id="print-area" style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={cardStyle}>
            <header style={{ background: '#007bff', color: 'white', padding: '5px', textAlign: 'center', fontSize: '12px' }}>
                <strong>{schoolInfo.name}</strong>
            </header>
            <div style={{ display: 'flex', flexGrow: 1, padding: '10px', gap: '10px' }}>
                <div style={{ width: '80px', height: '80px' }}>
                    {studentPhoto ?
                        <img src={studentPhoto} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <div style={{ width: '100%', height: '100%', background: '#ccc', textAlign: 'center', lineHeight: '80px' }}>صورة</div>
                    }
                </div>
                <div style={{ fontSize: '14px' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>الاسم:</strong> {student.name}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>الفصل:</strong> {student.class_name}</p>
                    <p style={{ margin: '0' }}><strong>بطاقة طالب</strong></p>
                </div>
            </div>
            <footer style={{ background: '#f2f2f2', padding: '5px', textAlign: 'center' }}>
                {schoolInfo.logo && <img src={schoolInfo.logo} alt="School Logo" style={{ height: '20px', opacity: 0.7 }} />}
            </footer>
        </div>
      </div>
    </>
  );
}

export default IdCard;
