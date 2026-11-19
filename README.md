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

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd job-portal-ui
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of this repository.

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the MySQL database

1. Open MySQL Workbench.
2. Create a database named `jobify`.
3. Import the SQL file located at `database/jobify.sql`.
4. Execute the SQL script to create the database structure.

### 4. Configure backend environment variables

Navigate to the backend folder:

```bash
cd backend
```

Create a `.env` file using `.env.example` as a reference.

Configure the following variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jobify
DB_PORT=3306

JWT_SECRET=your_long_random_secret
PORT=5000
```

Use your own MySQL credentials and a secure JWT secret. Never upload your actual `.env` file to GitHub.

### 5. Install backend dependencies

From the backend directory:

```bash
npm install
```

### 6. Start the backend server

```bash
node server.js
```

The backend runs at:

```text
http://localhost:5000
```

### 7. Start the frontend

Open a second terminal, navigate to the project root, and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Production Build

To create a production build of the frontend:

```bash
npm run build
```

To start the backend without nodemon:

```bash
cd backend
npm start
```

## API Testing

Postman resources are included in the `postman/` directory.

Use Postman to test the backend API endpoints. Configure your local API URL and authentication credentials before sending requests.

## Database

The database structure is provided in:

```text
database/jobify.sql
```

Import this file into MySQL Workbench before running the application.

## Security

- Environment files containing credentials are excluded from Git.
- Passwords are hashed using bcrypt.
- Authentication uses JSON Web Tokens.
- Uploaded files are stored locally during development.

## Author

Developed as a full-stack web development project.

**Project:** Jobify – Job Portal