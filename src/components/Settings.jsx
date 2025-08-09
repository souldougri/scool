import React, { useState, useEffect } from 'react';

function Settings() {
  const [schoolName, setSchoolName] = useState('');
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState(null); // { text: '', type: 'success' | 'error' }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const dispatchSettingsUpdate = () => {
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleBackup = async () => {
    const result = await window.app.backup();
    if (result.success) {
      showMessage(`تم إنشاء النسخة الاحتياطية بنجاح في: ${result.path}`);
    } else {
      showMessage(result.error || result.message || 'فشل إنشاء النسخة الاحتياطية.', 'error');
    }
  };

  const handleRestore = async () => {
    if (window.confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في النسخة الاحتياطية. هل تريد المتابعة؟')) {
      const result = await window.app.restore();
      if (result.success) {
        alert('تمت الاستعادة بنجاح! سيتم الآن إعادة تشغيل التطبيق لتطبيق التغييرات.');
        await window.app.relaunch();
      } else {
        showMessage(result.error || result.message || 'فشلت عملية الاستعادة.', 'error');
      }
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      const name = await window.db.getSetting('schoolName');
      if (name) setSchoolName(name);
      const currentLogo = await window.db.getLogo();
      if (currentLogo) setLogo(currentLogo);
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
        dispatchSettingsUpdate();
      } else {
        showMessage(`خطأ في تحديث الشعار: ${result.error}`, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await window.db.updateSetting({ key: 'schoolName', value: schoolName });
      showMessage('تم حفظ الإعدادات بنجاح!');
      dispatchSettingsUpdate();
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('حدث خطأ أثناء حفظ الإعدادات.', 'error');
    }
  };

  return (
    <div className="container">
      <h2>إعدادات المدرسة</h2>
      <form onSubmit={handleSubmit} className="form" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label htmlFor="schoolName">اسم المدرسة:</label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="schoolLogo">شعار المدرسة:</label>
          <input
            type="file"
            id="schoolLogo"
            accept="image/png, image/jpeg"
            onChange={handleLogoChange}
          />
          {logo && <img src={logo} alt="School Logo" className="photo-preview" />}
        </div>

        <div className="form-actions">
            <button type="submit">حفظ الإعدادات</button>
        </div>
      </form>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <hr style={{ margin: '40px 0' }} />

      <div className="backup-restore-section">
        <h2>النسخ الاحتياطي والاستعادة</h2>
        <p>يمكنك إنشاء نسخة احتياطية من جميع بيانات التطبيق أو استعادة البيانات من نسخة سابقة.</p>
        <div className="form-actions">
          <button onClick={handleBackup} className="success">إنشاء نسخة احتياطية</button>
          <button onClick={handleRestore} className="danger">استعادة نسخة احتياطية</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
