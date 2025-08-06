import React, { useState, useEffect } from 'react';

function Settings() {
  const [schoolName, setSchoolName] = useState('');
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState(null); // { text: '', isError: false }

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleBackup = async () => {
    const result = await window.app.backup();
    if (result.success) {
      showMessage(`تم إنشاء النسخة الاحتياطية بنجاح في: ${result.path}`);
    } else {
      showMessage(result.error || result.message || 'فشل إنشاء النسخة الاحتياطية.', true);
    }
  };

  const handleRestore = async () => {
    if (window.confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في النسخة الاحتياطية. هل تريد المتابعة؟')) {
      const result = await window.app.restore();
      if (result.success) {
        alert('تمت الاستعادة بنجاح! سيتم الآن إعادة تشغيل التطبيق لتطبيق التغييرات.');
        await window.app.relaunch();
      } else {
        showMessage(result.error || result.message || 'فشلت عملية الاستعادة.', true);
      }
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      const name = await window.db.getSetting('schoolName');
      if (name) {
        setSchoolName(name);
      }
      const currentLogo = await window.db.getLogo();
      if (currentLogo) {
        setLogo(currentLogo);
      }
    }
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const fileData = reader.result;
      const result = await window.db.updateLogo(fileData);
      if (result.success) {
        setLogo(fileData); // Update preview immediately
        showMessage('تم تحديث الشعار بنجاح!');
      } else {
        showMessage(`خطأ في تحديث الشعار: ${result.error}`, true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await window.db.updateSetting({ key: 'schoolName', value: schoolName });
      showMessage('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('حدث خطأ أثناء حفظ الإعدادات.', true);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h2>إعدادات المدرسة</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="schoolName" style={{ display: 'block', marginBottom: '5px' }}>اسم المدرسة:</label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            style={{ width: '300px', padding: '8px' }}
          />
        </div>

        <div>
          <label htmlFor="schoolLogo" style={{ display: 'block', marginBottom: '5px' }}>شعار المدرسة:</label>
          <input
            type="file"
            id="schoolLogo"
            accept="image/png, image/jpeg"
            onChange={handleLogoChange}
          />
          {logo && <img src={logo} alt="School Logo" style={{ width: '100px', height: '100px', marginTop: '10px', border: '1px solid #ddd' }} />}
        </div>

        <button type="submit" style={{ width: '150px', padding: '10px' }}>حفظ الإعدادات</button>
      </form>
      {message && <p style={{ color: message.isError ? 'red' : 'green', marginTop: '20px' }}>{message.text}</p>}

      <hr style={{ margin: '40px 0' }} />

      <div>
        <h2>النسخ الاحتياطي والاستعادة</h2>
        <p>يمكنك إنشاء نسخة احتياطية من جميع بيانات التطبيق (الطلاب، الدرجات، الإعدادات، إلخ) أو استعادة البيانات من نسخة سابقة.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={handleBackup} style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>إنشاء نسخة احتياطية</button>
          <button onClick={handleRestore} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>استعادة نسخة احتياطية</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
