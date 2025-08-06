import React, { useState, useEffect } from 'react';

// Modal for managing subjects for a class
const ManageSubjectsModal = ({ cls, onClose }) => {
  const [allSubjects, setAllSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState(new Set());

  useEffect(() => {
    // Fetch all subjects and the subjects assigned to this class
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
        <h3>إدارة مواد الفصل: {cls.name}</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
          {allSubjects.map(sub => (
            <div key={sub.id}>
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
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose}>إلغاء</button>
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
  const [managingSubjectsFor, setManagingSubjectsFor] = useState(null); // The class for which we are managing subjects
  const [message, setMessage] = useState('');

  const fetchClasses = async () => {
    const fetchedClasses = await window.db.getClasses();
    setClasses(fetchedClasses);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      if (editingClass) {
        // Update existing class
        await window.db.updateClass({ id: editingClass.id, name: className });
        showMessage('تم تحديث الفصل بنجاح!');
      } else {
        // Add new class
        await window.db.addClass(className);
        showMessage('تم إضافة الفصل بنجاح!');
      }
      setClassName('');
      setEditingClass(null);
      fetchClasses(); // Refresh the list
    } catch (error) {
      console.error('Failed to save class:', error);
      showMessage('حدث خطأ. قد يكون اسم الفصل موجودًا بالفعل.');
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
        fetchClasses(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete class:', error);
        showMessage('حدث خطأ أثناء حذف الفصل.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setClassName('');
  };

  // Some basic styling
  const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: '0 auto' },
    form: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { flexGrow: 1, padding: '8px' },
    button: { padding: '8px 15px', cursor: 'pointer' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' },
    message: { marginTop: '10px', color: 'green', textAlign: 'center' },
  };

  return (
    <div style={styles.container}>
      <h2>إدارة الفصول الدراسية</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder={editingClass ? 'تعديل اسم الفصل' : 'إضافة فصل جديد'}
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>{editingClass ? 'تحديث' : 'إضافة'}</button>
        {editingClass && (
          <button type="button" onClick={handleCancelEdit} style={{...styles.button, backgroundColor: '#ccc'}}>إلغاء</button>
        )}
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <ul style={styles.list}>
        {classes.map((cls) => (
          <li key={cls.id} style={styles.listItem}>
            <span>{cls.name}</span>
            <div>
              <button onClick={() => setManagingSubjectsFor(cls)} style={{...styles.button, backgroundColor: '#2196F3', color: 'white'}}>إدارة المواد</button>
              <button onClick={() => handleEdit(cls)} style={{...styles.button, marginLeft: '10px'}}>تعديل</button>
              <button onClick={() => handleDelete(cls.id)} style={{...styles.button, backgroundColor: '#f44336', color: 'white'}}>حذف</button>
            </div>
          </li>
        ))}
      </ul>

      {managingSubjectsFor && <ManageSubjectsModal cls={managingSubjectsFor} onClose={() => setManagingSubjectsFor(null)} />}
    </div>
  );
}

export default Classes;
