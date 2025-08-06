const { app } = require('electron');
const path = require('path');
const knex = require('knex');

const dbPath = path.join(app.getPath('userData'), 'school_management.sqlite');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

async function setupDatabase() {
  try {
    // Check if settings table exists
    const hasSettingsTable = await db.schema.hasTable('settings');
    if (!hasSettingsTable) {
      await db.schema.createTable('settings', (table) => {
        table.string('key').primary();
        table.string('value');
      });
      // Insert default values
      await db('settings').insert([
        { key: 'schoolName', value: 'اسم المدرسة الافتراضي' },
        { key: 'schoolLogo', value: null },
      ]);
    }

    // Check for classes table
    const hasClassesTable = await db.schema.hasTable('classes');
    if (!hasClassesTable) {
      await db.schema.createTable('classes', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
      });
    }

    // Check for subjects table
    const hasSubjectsTable = await db.schema.hasTable('subjects');
    if (!hasSubjectsTable) {
      await db.schema.createTable('subjects', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
      });
    }

    // Check for class_subjects linking table
    const hasClassSubjectsTable = await db.schema.hasTable('class_subjects');
    if (!hasClassSubjectsTable) {
      await db.schema.createTable('class_subjects', (table) => {
        table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
        table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
        table.primary(['class_id', 'subject_id']);
      });
    }

    // Check for students table
    const hasStudentsTable = await db.schema.hasTable('students');
    if (!hasStudentsTable) {
      await db.schema.createTable('students', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('gender').notNullable();
        table.date('dob').notNullable();
        table.string('photo_path');
        table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('SET NULL');
      });
    }

    // Check for grades table
    const hasGradesTable = await db.schema.hasTable('grades');
    if (!hasGradesTable) {
      await db.schema.createTable('grades', (table) => {
        table.increments('id').primary();
        table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
        table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
        table.integer('grade').notNullable();
        table.unique(['student_id', 'subject_id']); // Each student has one grade per subject
      });
    }

    // Check for schedule table
    const hasScheduleTable = await db.schema.hasTable('schedule');
    if (!hasScheduleTable) {
      await db.schema.createTable('schedule', (table) => {
        table.increments('id').primary();
        table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
        table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
        table.integer('day_of_week').notNullable(); // 0: Sunday, 1: Monday, ...
        table.integer('period').notNullable(); // 1, 2, 3, ...
        table.unique(['class_id', 'day_of_week', 'period']);
      });
    }

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

module.exports = {
  db,
  setupDatabase,
};
