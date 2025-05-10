# Class Attendance System - Frontend

A modern web application for managing classroom attendance, student information, and attendance records.

## Overview

This React-based application provides a comprehensive interface for teachers and administrators to:

- Take and manage student attendance
- Create and manage class registers
- View attendance statistics
- Manage student information
- Handle user accounts (admin only)

## Technologies

- React 19
- React Router 7.4
- Material UI 5.15
- Vite 6.2
- MUI X Date Pickers
- QR Code generation for attendance

## Features

### User Authentication

- Secure login system
- Role-based access (admin/teacher)
- Protected routes

### Dashboard

- Quick access to all system features
- Admin-specific controls

### Class Registers

- Create and manage class registers
- Assign students to registers
- Open/close registers for attendance

### Attendance Management

- Mark student attendance (present, absent, late)
- Generate QR codes for student self-check-in
- View attendance statistics and history

### Student Management

- Add, edit, and remove students
- Search functionality
- View individual student attendance records

### User Management (Admin)

- Add, edit, and remove system users
- Assign roles (admin/teacher)

### Public Attendance Page

- Allow students to mark attendance via QR code
- Simple interface for quick check-in

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the production build locally
- `npm run lint` - Lints the codebase

## Project Structure
frontend/
├── public/ # Static assets
├── src/
│ ├── assets/ # Images and other assets
│ ├── components/ # Reusable components
│ ├── contexts/ # React context providers
│ ├── pages/ # Application pages
│ ├── utils/ # Utility functions
│ ├── App.jsx # Main application component
│ ├── main.jsx # Application entry point
│ ├── theme.js # Material UI theme configuration
│ └── index.css # Global styles
└── package.json # Project dependencies and scripts

## API Integration

The application communicates with a backend API for data persistence. API services are organized in the `utils/api.js` file, which provides methods for:

- Authentication (login, logout)
- User management
- Student management
- Register management
- Attendance tracking

## Browser Support

This application is optimized for modern browsers and responsive across desktop and mobile devices.

