const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const decompress = require('decompress');
const { setupDatabase, db } = require('./src/db/database');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await setupDatabase();

  // IPC handlers
  ipcMain.handle('get-setting', async (event, key) => {
    const result = await db('settings').where('key', key).first();
    return result ? result.value : null;
  });

  ipcMain.handle('update-setting', async (event, { key, value }) => {
    return await db('settings').where('key', key).update({ value });
  });

  ipcMain.handle('update-logo', async (event, fileData) => {
    const logoPath = path.join(app.getPath('userData'), 'school-logo.png');
    try {
      // The fileData is expected to be a base64 string, so we need to parse it.
      const data = Buffer.from(fileData.split(',')[1], 'base64');
      fs.writeFileSync(logoPath, data);
      await db('settings').where('key', 'schoolLogo').update({ value: logoPath });
      return { success: true, path: logoPath };
    } catch (error) {
      console.error('Failed to save logo:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-logo', async () => {
    try {
      const result = await db('settings').where('key', 'schoolLogo').first();
      const logoPath = result ? result.value : null;
      if (logoPath && fs.existsSync(logoPath)) {
        const data = fs.readFileSync(logoPath);
        return `data:image/png;base64,${data.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to get logo:', error);
      return null;
    }
  });

  // Classes IPC
  ipcMain.handle('get-classes', async () => db('classes').select('*'));
  ipcMain.handle('add-class', async (event, name) => db('classes').insert({ name }));
  ipcMain.handle('update-class', async (event, { id, name }) => db('classes').where('id', id).update({ name }));
  ipcMain.handle('delete-class', async (event, id) => db('classes').where('id', id).del());
  ipcMain.handle('get-subjects-for-class', async (event, classId) => {
    return db('class_subjects')
      .join('subjects', 'class_subjects.subject_id', 'subjects.id')
      .where('class_subjects.class_id', classId)
      .select('subjects.*');
  });
  ipcMain.handle('update-subjects-for-class', async (event, { classId, subjectIds }) => {
    return db.transaction(async (trx) => {
      await trx('class_subjects').where('class_id', classId).del();
      if (subjectIds.length > 0) {
        const newAssignments = subjectIds.map(subjectId => ({
          class_id: classId,
          subject_id: subjectId,
        }));
        await trx('class_subjects').insert(newAssignments);
      }
    });
  });

  // Subjects IPC
  ipcMain.handle('get-subjects', async () => db('subjects').select('*'));
  ipcMain.handle('add-subject', async (event, name) => db('subjects').insert({ name }));
  ipcMain.handle('update-subject', async (event, { id, name }) => db('subjects').where('id', id).update({ name }));
  ipcMain.handle('delete-subject', async (event, id) => db('subjects').where('id', id).del());

  // Schedule IPC
  ipcMain.handle('get-schedule-for-class', async (event, classId) => {
    return db('schedule').where('class_id', classId);
  });
  ipcMain.handle('update-schedule-for-class', async (event, { classId, schedule }) => {
    return db.transaction(async (trx) => {
      await trx('schedule').where('class_id', classId).del();
      if (schedule.length > 0) {
        await trx('schedule').insert(schedule);
      }
    });
  });

  // Grades IPC
  ipcMain.handle('get-grades-for-student', async (event, studentId) => {
    return db('grades').where('student_id', studentId);
  });
  ipcMain.handle('update-student-grades', async (event, { studentId, grades }) => {
    return db.transaction(async (trx) => {
      for (const grade of grades) {
        if (grade.grade === '' || grade.grade === null) {
          // If grade is empty, delete the record
          await trx('grades')
            .where('student_id', studentId)
            .andWhere('subject_id', grade.subject_id)
            .del();
        } else {
          // Otherwise, upsert the grade
          await trx('grades')
            .insert({
              student_id: studentId,
              subject_id: grade.subject_id,
              grade: grade.grade,
            })
            .onConflict(['student_id', 'subject_id'])
            .merge();
        }
      }
    });
  });

  // Students IPC
  const studentPhotosPath = path.join(app.getPath('userData'), 'student_photos');
  if (!fs.existsSync(studentPhotosPath)) {
    fs.mkdirSync(studentPhotosPath);
  }

  ipcMain.handle('get-students', async () => {
    return db('students')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select('students.*', 'classes.name as class_name');
  });

  ipcMain.handle('add-student', async (event, student) => {
    let photo_path = null;
    if (student.photo_data) {
      photo_path = path.join(studentPhotosPath, `${Date.now()}.png`);
      const data = Buffer.from(student.photo_data.split(',')[1], 'base64');
      fs.writeFileSync(photo_path, data);
    }
    const { photo_data, ...studentData } = student;
    return db('students').insert({ ...studentData, photo_path });
  });

  ipcMain.handle('update-student', async (event, { id, student }) => {
    const { photo_data, ...studentData } = student;
    const updateData = { ...studentData };

    if (photo_data) {
      // If there's a new photo, save it and get the new path
      const new_photo_path = path.join(studentPhotosPath, `${Date.now()}.png`);
      const data = Buffer.from(photo_data.split(',')[1], 'base64');
      fs.writeFileSync(new_photo_path, data);

      // Add the new path to the data to be updated
      updateData.photo_path = new_photo_path;

      // If there was an old photo, delete it
      const oldStudent = await db('students').where('id', id).first();
      if (oldStudent.photo_path && fs.existsSync(oldStudent.photo_path)) {
        // Make sure not to delete the file if the path is the same (unlikely but possible)
        if (oldStudent.photo_path !== new_photo_path) {
          fs.unlinkSync(oldStudent.photo_path);
        }
      }
    }

    return db('students').where('id', id).update(updateData);
  });

  ipcMain.handle('delete-student', async (event, id) => {
    const student = await db('students').where('id', id).first();
    if (student && student.photo_path && fs.existsSync(student.photo_path)) {
      fs.unlinkSync(student.photo_path);
    }
    return db('students').where('id', id).del();
  });

  ipcMain.handle('get-student-by-id', async (event, id) => {
    return db('students')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select('students.*', 'classes.name as class_name')
      .where('students.id', id)
      .first();
  });

  ipcMain.handle('get-student-photo', async (event, photoPath) => {
    try {
      if (photoPath && fs.existsSync(photoPath)) {
        const data = fs.readFileSync(photoPath);
        return `data:image/png;base64,${data.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to get student photo:', error);
      return null;
    }
  });

  ipcMain.handle('export-to-pdf', async (event, options) => {
    const win = BrowserWindow.getFocusedWindow();
    try {
      const data = await win.webContents.printToPDF(options);
      const desktopPath = app.getPath('desktop');
      const filePath = path.join(desktopPath, `report-card-${Date.now()}.pdf`);
      fs.writeFileSync(filePath, data);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to export PDF:', error);
      return { success: false, error: error.message };
    }
  });

  // Backup and Restore IPC
  ipcMain.handle('backup-database', async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'حفظ نسخة احتياطية',
      defaultPath: `school-backup-${new Date().toISOString().split('T')[0]}.zip`,
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
    });

    if (!filePath) return { success: false, message: 'تم إلغاء العملية.' };

    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(filePath);

      output.on('close', () => console.log(`Backup complete: ${archive.pointer()} total bytes`));
      archive.on('error', (err) => { throw err; });
      archive.pipe(output);

      // Add database file
      const dbPath = path.join(app.getPath('userData'), 'school_management.sqlite');
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'school_management.sqlite' });
      }

      // Add photos
      const logoPath = path.join(app.getPath('userData'), 'school-logo.png');
      if (fs.existsSync(logoPath)) {
        archive.file(logoPath, { name: 'school-logo.png' });
      }
      const photosDir = path.join(app.getPath('userData'), 'student_photos');
      if (fs.existsSync(photosDir)) {
        archive.directory(photosDir, 'student_photos');
      }

      await archive.finalize();
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'استعادة نسخة احتياطية',
      properties: ['openFile'],
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, message: 'تم إلغاء العملية.' };
    }

    const backupPath = filePaths[0];
    const userDataPath = app.getPath('userData');

    try {
      // Close the database connection before touching files
      await db.destroy();

      // Decompress the backup to the userData directory, overwriting existing files
      await decompress(backupPath, userDataPath, {
        strip: 0, // Don't strip any directory levels
        filter: file => !file.path.startsWith('__MACOSX') // Ignore macOS specific files
      });

      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      // Attempt to re-establish DB connection if restore fails
      await setupDatabase();
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('relaunch-app', () => {
    app.relaunch();
    app.exit();
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
