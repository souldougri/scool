import React, { useState, useEffect } from 'react';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [message, setMessage] = useState('');

  const fetchSubjects = async () => {
    const fetchedSubjects = await window.db.getSubjects();
    setSubjects(fetchedSubjects);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
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
      showMessage('حدث خطأ. قد يكون اسم المادة موجودًا بالفعل.');
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
        showMessage('حدث خطأ أثناء حذف المادة.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setSubjectName('');
  };

  const styles = {
    container: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
    form: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { flexGrow: 1, padding: '8px' },
    button: { padding: '8px 15px', cursor: 'pointer' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' },
    message: { marginTop: '10px', color: 'green', textAlign: 'center' },
  };

  return (
    <div style={styles.container}>
      <h2>إدارة المواد الدراسية</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder={editingSubject ? 'تعديل اسم المادة' : 'إضافة مادة جديدة'}
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>{editingSubject ? 'تحديث' : 'إضافة'}</button>
        {editingSubject && (
          <button type="button" onClick={handleCancelEdit} style={{...styles.button, backgroundColor: '#ccc'}}>إلغاء</button>
        )}
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <ul style={styles.list}>
        {subjects.map((sub) => (
          <li key={sub.id} style={styles.listItem}>
            <span>{sub.name}</span>
            <div>
              <button onClick={() => handleEdit(sub)} style={{...styles.button, marginLeft: '10px'}}>تعديل</button>
              <button onClick={() => handleDelete(sub.id)} style={{...styles.button, backgroundColor: '#f44336', color: 'white'}}>حذف</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subjects;
