import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// A simple modal component
const Modal = ({ children, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ background: 'white', padding: '20px', borderRadius: '5px', width: '500px', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
      {children}
    </div>
  </div>
);

// The form for adding/editing a student
const StudentForm = ({ student, onSave, onCancel, classes }) => {
  const [formData, setFormData] = useState({
    name: student ? student.name : '',
    gender: student ? student.gender : 'ذكر',
    dob: student ? student.dob : '',
    class_id: student ? student.class_id : '',
    photo_data: null,
  });
  const [photoPreview, setPhotoPreview] = useState(student ? student.photo_path : null);

  useEffect(() => {
    // If we are editing a student, fetch their photo to display
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
    <form onSubmit={handleSubmit}>
      <h3>{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" required />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        <select name="class_id" value={formData.class_id} onChange={handleChange} required>
          <option value="">اختر الفصل</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '100px', height: '100px' }} />}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel}>إلغاء</button>
          <button type="submit">{student ? 'تحديث' : 'إضافة'}</button>
        </div>
      </div>
    </form>
  );
};


function StudentManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
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
    return students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [students, search]);

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

  return (
    <div style={{ padding: '20px' }}>
      <h2>إدارة الطلاب</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input type="text" placeholder="بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px' }} />
        <button onClick={handleAdd}>إضافة طالب جديد</button>
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

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>الاسم</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>الجنس</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>تاريخ الميلاد</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>الفصل</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.id}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.name}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.gender}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.dob}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.class_name || 'غير محدد'}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                <button onClick={() => navigate(`/students/${student.id}/id-card`)}>بطاقة</button>
                <button onClick={() => navigate(`/students/${student.id}/grades`)}>الدرجات</button>
                <button onClick={() => handleEdit(student)}>تعديل</button>
                <button onClick={() => handleDelete(student.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentManagement;
