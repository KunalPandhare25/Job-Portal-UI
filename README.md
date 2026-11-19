# Jobify – Job Portal

Jobify is a full-stack job portal application built to connect job seekers and recruiters. It provides a platform where candidates can explore job opportunities and recruiters can manage job postings, applications, and recruitment activities.

## Features

### Job Seekers
- User registration and login
- Browse and search job listings
- View job details
- Apply for jobs
- Track submitted applications
- Receive notifications

### Recruiters
- Recruiter registration and login
- Post and manage job openings
- Edit job details
- Manage applications
- Schedule and manage interviews
- Create and update company profiles
- Receive notifications

## Technologies Used

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MySQL
- MySQL2
- JWT Authentication
- bcrypt
- Multer
- Socket.IO

### Tools
- Visual Studio Code
- MySQL Workbench
- Postman
- Git and GitHub

## Project Structure

```text
job-portal-ui/
│
├── backend/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── jobify.sql
│
├── postman/
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── recruiter/
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure you have the following installed:
- Node.js and npm
- MySQL Server
- MySQL Workbench
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/KunalPandhare25/Job-Portal-UI.git
cd Job-Portal-UI
```

### 2. Install Frontend Dependencies

From the project root directory, run:

```bash
npm install
```

### 3. Set Up the MySQL Database

1. Open MySQL Workbench.
2. Create a new database named `jobify`.
3. Open the SQL file located at `database/jobify.sql`.
4. Execute the SQL script to create the required tables and relationships.

**Important:** The SQL file contains `DROP TABLE IF EXISTS` statements. Import it into a fresh database. Do not execute it against an existing database containing data, as existing tables may be dropped.

### 4. Configure Backend Environment Variables

Navigate to the backend directory:

```bash
cd backend
```

Create a `.env` file inside the `backend` directory using `.env.example` as a reference.

Configure your local environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jobify
DB_PORT=3306

JWT_SECRET=your_long_random_secret
PORT=5000
```

Replace the example values with your own MySQL credentials and a secure JWT secret.

Never upload your actual `.env` file or database credentials to GitHub.

### 5. Install Backend Dependencies

Make sure you are inside the `backend` directory:

```bash
npm install
```

### 6. Start the Backend Server

Run:

```bash
node server.js
```

Alternatively, you can use:

```bash
npm start
```

The backend server runs at:

```text
http://localhost:5000
```

### 7. Start the Frontend

Open a second terminal and navigate to the project root directory:

```bash
cd ..
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Production Build

To create a production build of the frontend, run this command from the project root:

```bash
npm run build
```

To start the backend using the configured start script:

```bash
cd backend
npm start
```

## API Testing

Postman resources are included in the `postman/` directory.

Use Postman to test backend API endpoints. Configure your local API URL and authentication credentials before sending requests.

## Database

The database schema is provided in:

```text
database/jobify.sql
```

It includes the tables and relationships required by the application.

Import the SQL file into a fresh MySQL database before running the application.

## Security

- Environment files containing credentials are excluded from Git.
- Passwords are hashed using bcrypt.
- Authentication uses JSON Web Tokens (JWT).
- Uploaded files are stored locally during development.
- Never commit database passwords, JWT secrets, or other sensitive credentials.

## Author

Developed as a full-stack web development project.

**Project:** Jobify – Job Portal