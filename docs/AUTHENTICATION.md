# Authentication System

This document provides information about the authentication system used in the Trading Assistant application.

## Overview

The Trading Assistant uses a JWT-based authentication system with the following features:

- User registration with email, password, and name
- Secure password validation with strength requirements
- JWT token-based authentication
- Role-based access control (user/admin)
- Account lockout after multiple failed login attempts
- Secure cookie-based token storage

## Database Setup

Before using the authentication system, you need to set up the database:

1. Make sure your database connection string is properly configured in your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/trading_assistant"
```

2. Run the database setup script to create the necessary tables and a superuser:

```bash
node scripts/setup-db.js
```

3. Run the migration script to apply any pending migrations and seed the database with initial data:

```bash
node scripts/migrate-db.js
```

## User Roles

The system supports two user roles:

- **User**: Regular users with limited access to features
- **Admin**: Administrators with full access to all features

## Authentication Flow

### Registration

1. Users visit the `/signup` page
2. They provide their email, name, and password
3. The system validates the password strength and checks if the email is already registered
4. If validation passes, a new user is created with the "user" role
5. A JWT token is generated and returned to the client
6. The user is automatically logged in and redirected to the dashboard

### Login

1. Users visit the `/login` page
2. They provide their email and password
3. The system validates the credentials
4. If valid, a JWT token is generated and returned to the client
5. The user is logged in and redirected to the dashboard

### Authentication Protection

- All routes except public ones (`/`, `/login`, `/signup`, etc.) require authentication
- API routes require a valid JWT token in the Authorization header
- Non-API routes check for a valid JWT token in cookies
- If authentication fails, users are redirected to the login page

## Security Features

### Password Requirements

Passwords must meet the following requirements:

- At least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character

### Account Lockout

After 5 failed login attempts, the account is temporarily locked for 15 minutes.

### Token Storage

JWT tokens are stored in secure cookies with the following options:

- HTTP-only (not accessible via JavaScript)
- Secure (only sent over HTTPS in production)
- SameSite=Strict (prevents CSRF attacks)
- 1-day expiration

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Log in an existing user
- `GET /api/auth/me`: Get the current user's information

## Environment Variables

The following environment variables are used by the authentication system:

- `JWT_SECRET`: Secret key used to sign JWT tokens
- `DATABASE_URL`: Connection string for the database

## Troubleshooting

### Common Issues

1. **"Email already registered"**: The email address is already in use by another account.
2. **"Password does not meet security requirements"**: The password doesn't meet the minimum strength requirements.
3. **"Account temporarily locked"**: Too many failed login attempts have occurred.

### Resetting a Locked Account

If an account is locked due to too many failed login attempts, it will automatically unlock after 15 minutes. Alternatively, an administrator can reset the lockout by updating the user record in the database. 