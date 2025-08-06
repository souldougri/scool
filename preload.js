const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('db', {
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  updateSetting: (setting) => ipcRenderer.invoke('update-setting', setting),
  getLogo: () => ipcRenderer.invoke('get-logo'),
  updateLogo: (fileData) => ipcRenderer.invoke('update-logo', fileData),

  // Classes
  getClasses: () => ipcRenderer.invoke('get-classes'),
  addClass: (name) => ipcRenderer.invoke('add-class', name),
  updateClass: (data) => ipcRenderer.invoke('update-class', data),
  deleteClass: (id) => ipcRenderer.invoke('delete-class', id),
  getSubjectsForClass: (classId) => ipcRenderer.invoke('get-subjects-for-class', classId),
  updateSubjectsForClass: (data) => ipcRenderer.invoke('update-subjects-for-class', data),

  // Subjects
  getSubjects: () => ipcRenderer.invoke('get-subjects'),
  addSubject: (name) => ipcRenderer.invoke('add-subject', name),
  updateSubject: (data) => ipcRenderer.invoke('update-subject', data),
  deleteSubject: (id) => ipcRenderer.invoke('delete-subject', id),

  // Schedule
  getScheduleForClass: (classId) => ipcRenderer.invoke('get-schedule-for-class', classId),
  updateScheduleForClass: (data) => ipcRenderer.invoke('update-schedule-for-class', data),

  // Grades
  getGradesForStudent: (studentId) => ipcRenderer.invoke('get-grades-for-student', studentId),
  updateStudentGrades: (data) => ipcRenderer.invoke('update-student-grades', data),

  // Students
  getStudents: () => ipcRenderer.invoke('get-students'),
  addStudent: (student) => ipcRenderer.invoke('add-student', student),
  updateStudent: (data) => ipcRenderer.invoke('update-student', data),
  deleteStudent: (id) => ipcRenderer.invoke('delete-student', id),
  getStudentById: (id) => ipcRenderer.invoke('get-student-by-id', id),
  getStudentPhoto: (photoPath) => ipcRenderer.invoke('get-student-photo', photoPath),

  // Printing
  exportToPdf: (options) => ipcRenderer.invoke('export-to-pdf', options),
});

contextBridge.exposeInMainWorld('app', {
  relaunch: () => ipcRenderer.invoke('relaunch-app'),
  backup: () => ipcRenderer.invoke('backup-database'),
  restore: () => ipcRenderer.invoke('restore-database'),
});

console.log('preload.js loaded');
