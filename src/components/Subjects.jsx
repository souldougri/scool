import React, { useState, useEffect } from 'react';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchSubjects = async () => {
    const fetchedSubjects = await window.db.getSubjects();
    setSubjects(fetchedSubjects);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      if (editingSubject) {
        await window.db.updateSubject({ id: editingSubject.id, name: subjectName });
        showMessage('تم تحديث المادة بنجاح!');
      } else {
        await window.db.addSubject(subjectName);
        showMessage('تمت إضافة المادة بنجاح!');
      }
      setSubjectName('');
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
      showMessage('حدث خطأ. قد يكون اسم المادة موجودًا بالفعل.', 'error');
    }
  };

  const handleEdit = (sub) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المادة؟')) {
      try {
        await window.db.deleteSubject(id);
        showMessage('تم حذف المادة بنجاح!');
        fetchSubjects();
      } catch (error) {
        console.error('Failed to delete subject:', error);
        showMessage('حدث خطأ أثناء حذف المادة.', 'error');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setSubjectName('');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>إدارة المواد الدراسية</h2>
        <form onSubmit={handleSubmit} className="actions">
          <input
            type="text"
            placeholder={editingSubject ? 'تعديل اسم المادة' : 'إضافة مادة جديدة'}
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <button type="submit">{editingSubject ? 'تحديث' : 'إضافة'}</button>
          {editingSubject && (
            <button type="button" onClick={handleCancelEdit} className="secondary">إلغاء</button>
          )}
        </form>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <table>
        <thead>
          <tr>
            <th>اسم المادة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.name}</td>
              <td className="actions-cell">
                <button onClick={() => handleEdit(sub)}>تعديل</button>
                <button onClick={() => handleDelete(sub.id)} className="danger">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
