import React, { useState, useEffect } from 'react';

// Modal for managing subjects for a class
const ManageSubjectsModal = ({ cls, onClose }) => {
  const [allSubjects, setAllSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      const all = await window.db.getSubjects();
      const assigned = await window.db.getSubjectsForClass(cls.id);
      setAllSubjects(all);
      setAssignedSubjects(new Set(assigned.map(s => s.id)));
    };
    fetchInitialData();
  }, [cls.id]);

  const handleCheckboxChange = (subjectId) => {
    setAssignedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    await window.db.updateSubjectsForClass({
      classId: cls.id,
      subjectIds: Array.from(assignedSubjects),
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">&times;</button>
        <h3>إدارة مواد الفصل: {cls.name}</h3>
        <div className="subject-list">
          {allSubjects.map(sub => (
            <div key={sub.id} className="subject-list-item" onClick={() => handleCheckboxChange(sub.id)}>
              <input
                type="checkbox"
                id={`sub-${sub.id}`}
                checked={assignedSubjects.has(sub.id)}
                onChange={() => handleCheckboxChange(sub.id)}
              />
              <label htmlFor={`sub-${sub.id}`}>{sub.name}</label>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>إلغاء</button>
          <button onClick={handleSave}>حفظ</button>
        </div>
      </div>
    </div>
  );
};

function Classes() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [managingSubjectsFor, setManagingSubjectsFor] = useState(null);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchClasses = async () => {
    const fetchedClasses = await window.db.getClasses();
    setClasses(fetchedClasses);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      if (editingClass) {
        await window.db.updateClass({ id: editingClass.id, name: className });
        showMessage('تم تحديث الفصل بنجاح!');
      } else {
        await window.db.addClass(className);
        showMessage('تم إضافة الفصل بنجاح!');
      }
      setClassName('');
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Failed to save class:', error);
      showMessage('حدث خطأ. قد يكون اسم الفصل موجودًا بالفعل.', 'error');
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setClassName(cls.name);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الفصل؟')) {
      try {
        await window.db.deleteClass(id);
        showMessage('تم حذف الفصل بنجاح!');
        fetchClasses();
      } catch (error) {
        console.error('Failed to delete class:', error);
        showMessage('حدث خطأ أثناء حذف الفصل.', 'error');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setClassName('');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>إدارة الفصول الدراسية</h2>
        <form onSubmit={handleSubmit} className="actions">
          <input
            type="text"
            placeholder={editingClass ? 'تعديل اسم الفصل' : 'إضافة فصل جديد'}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <button type="submit">{editingClass ? 'تحديث' : 'إضافة'}</button>
          {editingClass && (
            <button type="button" onClick={handleCancelEdit} className="secondary">إلغاء</button>
          )}
        </form>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <table>
        <thead>
          <tr>
            <th>اسم الفصل</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id}>
              <td>{cls.name}</td>
              <td className="actions-cell">
                <button onClick={() => setManagingSubjectsFor(cls)} className="secondary">إدارة المواد</button>
                <button onClick={() => handleEdit(cls)}>تعديل</button>
                <button onClick={() => handleDelete(cls.id)} className="danger">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {managingSubjectsFor && <ManageSubjectsModal cls={managingSubjectsFor} onClose={() => setManagingSubjectsFor(null)} />}
    </div>
  );
}

export default Classes;
