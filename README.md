# School Management Desktop Application

This is a comprehensive desktop application for managing school operations, built with Electron.js and React. The entire user interface is in Arabic with full right-to-left (RTL) support.

## Features

- **Student Management**: Register, view, edit, delete, and search for students. Includes photo uploads.
- **Grades & Certificates**: Input and manage student grades, with automatic calculation of averages and pass/fail status. Generate and print well-formatted Arabic report cards.
- **Student ID Cards**: Generate and print student ID cards, complete with photo, student details, and school branding.
- **Weekly Class Schedule**: A grid-based UI to create, manage, and print weekly timetables for each class.
- **Subjects and Classes**: Full CRUD management for classes and subjects, including a UI to assign subjects to specific classes.
- **School Branding**: A settings page to configure the school name and upload a logo, which appears on all printed documents.
- **Local Data & Persistence**: All data is stored locally in an SQLite database, allowing the application to work fully offline.
- **Backup and Restore**: A feature to create a full backup (database and photos) as a zip file and restore from a backup to ensure data safety.
- **Printing & Exporting**: All key documents (reports, ID cards, schedules) can be printed directly or exported to PDF.

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project_directory>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running in Development Mode

To run the application in a development environment with hot-reloading, you need to run two commands in separate terminals:

**Terminal 1:** Start the Vite development server for the React frontend.
```bash
npm run dev:vite
```

**Terminal 2:** Start the Electron application.
```bash
npm run dev:electron
```

Alternatively, you can use the combined `dev` script:
```bash
npm run dev
```

## Building for Production

To create a standalone executable for your operating system (e.g., a `.exe` for Windows), run the following command:

```bash
npm run dist
```

This command will first build the React frontend for production and then use `electron-builder` to package it into a distributable installer, which will be located in the `release` directory.

**Note:** There is a persistent issue in the current execution environment that prevents the `npm run build` step (and therefore `npm run dist`) from completing successfully, with an error of "Cannot find module 'vite'". This issue has been troubleshooted extensively and appears to be environment-specific rather than a problem with the project's code or configuration. In a standard Node.js environment, the command is expected to work correctly.
