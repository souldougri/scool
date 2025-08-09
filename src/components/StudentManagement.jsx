import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// A simple modal component, now using CSS classes
const Modal = ({ children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <button onClick={onClose} className="modal-close-btn">&times;</button>
      {children}
    </div>
  </div>
);

// The form for adding/editing a student, now using CSS classes
const StudentForm = ({ student, onSave, onCancel, classes }) => {
  const [formData, setFormData] = useState({
    name: student ? student.name : '',
    gender: student ? student.gender : 'ذكر',
    dob: student ? student.dob : '',
    class_id: student ? student.class_id : '',
    photo_data: null,
    phone_number: student ? student.phone_number : '',
    place_of_birth: student ? student.place_of_birth : '',
    academic_year: student ? student.academic_year : '',
  });
  const [photoPreview, setPhotoPreview] = useState(student ? student.photo_path : null);

  useEffect(() => {
    if (student && student.photo_path && !student.photo_path.startsWith('data:')) {
      window.db.getStudentPhoto(student.photo_path).then(dataUrl => {
        setPhotoPreview(dataUrl);
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photo_data: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
      {photoPreview && <img src={photoPreview} alt="Preview" className="photo-preview" />}
      <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" required />
      <input name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} placeholder="مكان الميلاد" />
      <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="رقم الهاتف" />
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="ذكر">ذكر</option>
        <option value="أنثى">أنثى</option>
      </select>
      <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
      <input name="academic_year" value={formData.academic_year} onChange={handleChange} placeholder="السنة الدراسية" />
      <select name="class_id" value={formData.class_id} onChange={handleChange} required>
        <option value="">اختر الفصل</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="file" accept="image/*" onChange={handlePhotoChange} />
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit">{student ? 'تحديث' : 'إضافة'}</button>
      </div>
    </form>
  );
};

function StudentManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    const data = await window.db.getStudents();
    setStudents(data);
  };

  const fetchClasses = async () => {
    const data = await window.db.getClasses();
    setClasses(data);
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
        const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
        const classMatch = classFilter ? s.class_id == classFilter : true;
        const genderMatch = genderFilter ? s.gender === genderFilter : true;
        return nameMatch && classMatch && genderMatch;
    });
  }, [students, search, classFilter, genderFilter]);

  const handleAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      await window.db.deleteStudent(id);
      fetchStudents();
    }
  };

  const handleSave = async (studentData) => {
    if (editingStudent) {
      await window.db.updateStudent({ id: editingStudent.id, student: studentData });
    } else {
      await window.db.addStudent(studentData);
    }
    fetchStudents();
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleExportPdf = async () => {
    const result = await window.db.exportStudentListToPdf(filteredStudents);
    if (result.success) {
      alert(`تم حفظ الملف بنجاح في: ${result.path}`);
    } else {
      alert(`حدث خطأ أثناء تصدير الملف: ${result.error || result.message}`);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>إدارة الطلاب</h2>
        <div className="actions">
            <input type="search" placeholder="بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{width: '200px'}}/>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                <option value="">كل الفصول</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                <option value="">الكل</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
            </select>
            <button onClick={handleAdd}>إضافة طالب جديد</button>
            <button onClick={() => window.print()} className="secondary">طباعة القائمة</button>
            <button onClick={handleExportPdf} className="secondary">تصدير PDF</button>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <StudentForm
            student={editingStudent}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            classes={classes}
          />
        </Modal>
      )}

      <div id="print-area">
      <table>
        <thead>
          <tr>
            <th>الاسم الكامل</th>
            <th>تاريخ الميلاد</th>
            <th>مكان الميلاد</th>
            <th>رقم الهاتف</th>
            <th>السنة الدراسية</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.dob}</td>
              <td>{student.place_of_birth || '-'}</td>
              <td>{student.phone_number || '-'}</td>
              <td>{student.academic_year || '-'}</td>
              <td className="actions-cell">
                <button className="secondary" onClick={() => navigate(`/students/${student.id}/id-card`)}>بطاقة</button>
                <button className="secondary" onClick={() => navigate(`/students/${student.id}/fees`)}>الرسوم</button>
                <button className="secondary" onClick={() => navigate(`/students/${student.id}/grades`)}>الدرجات</button>
                <button onClick={() => handleEdit(student)}>تعديل</button>
                <button className="danger" onClick={() => handleDelete(student.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default StudentManagement;
