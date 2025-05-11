# Class Attendance System - Backend

A robust Node.js API for managing classroom attendance, student information, and attendance records.

## Overview

This Express.js backend provides a comprehensive API for:

- Managing student information
- Creating and managing class registers
- Tracking student attendance
- User authentication and authorization
- Generating QR codes for attendance tracking

## Technologies

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Bcrypt for password hashing
- Swagger for API documentation

## Database Models

The system uses the following data models:

- **User**: System users (admins and teachers)
- **Student**: Student information
- **Register**: Class sessions with date and time information
- **Attendance**: Records of student attendance for specific registers
- **RegisterStudent**: Junction table for the many-to-many relationship between registers and students

## Setup Instructions

### Prerequisites

- Node.js 16+
- PostgreSQL 12+

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   PORT=4000
   NODE_ENV=development
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=class_attendance
   DB_HOST=127.0.0.1
   JWT_SECRET=your_jwt_secret
   ```
5. Run database migrations:
   ```
   npm run migrate
   ```
6. (Optional) Seed the database with initial data:
   ```
   npm run seed
   ```
7. Start the server:
   ```
   npm run dev
   ```

## Project Structure
backend/
├── config/ # Database configuration
├── controllers/ # API controllers
├── middleware/ # Express middleware
├── migrations/ # Sequelize migrations
├── models/ # Sequelize models
├── routes/ # API routes
├── seeders/ # Database seeders
├── .env # Environment variables
├── .env.example # Example environment variables
├── .sequelizerc # Sequelize configuration
├── index.js # Application entry point
└── package.json # Project dependencies

## Authentication

The system uses JSON Web Tokens (JWT) for authentication. Most endpoints require a valid JWT token in the `Authorization` header:
Authorization: Bearer <your_token>

## Role-Based Access

The system supports two user roles:

- **Admin**: Has full access to all endpoints
- **Teacher**: Can manage registers, students, and attendance, but cannot manage users

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reloading
- `npm run migrate` - Run Sequelize migrations
- `npm run migrate:undo` - Undo the last migration
- `npm run migrate:undo:all` - Undo all migrations
- `npm run seed` - Run Sequelize seeders
- `npm run seed:undo:all` - Undo all seeders

## API Documentation

The API documentation is available through Swagger UI at the `/api-docs` endpoint when the server is running.