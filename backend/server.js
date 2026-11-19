const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};

const server = http.createServer(app);

const io = new Server(server, {
    cors: corsOptions
});

io.on('connection', (socket) => {
    console.log('User connected to Socket.IO:', socket.id);

    socket.on('join-user-room', (userId) => {
        if (!userId) return;

        socket.join(`user-${userId}`);

        console.log(`User ${userId} joined notification room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Resume upload directory
const resumeUploadDir = path.join(
    __dirname,
    'uploads',
    'resumes'
);

// Create folder automatically if it doesn't exist
fs.mkdirSync(resumeUploadDir, { recursive: true });

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Resume PDF upload configuration
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resumeUploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `resume-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.pdf`;

        cb(null, uniqueName);
    }
});

const uploadResume = multer({
    storage: resumeStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const isPDF =
            file.mimetype === 'application/pdf' &&
            path.extname(file.originalname).toLowerCase() === '.pdf';

        if (!isPDF) {
            return cb(new Error('Only PDF resumes are allowed.'));
        }

        cb(null, true);
    }
});


// Validate uploaded resume's actual PDF signature
const resumeUploadMiddleware = (req, res, next) => {
    uploadResume.single('resume')(req, res, (error) => {

        if (error) {
            const statusCode =
                error.code === 'LIMIT_FILE_SIZE' ? 400 : 400;

            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Resume upload failed.'
            });
        }

        // No new file uploaded; saved resume may be used
        if (!req.file) {
            return next();
        }

        try {
            const fileDescriptor = fs.openSync(req.file.path, 'r');
            const signature = Buffer.alloc(5);

            fs.readSync(fileDescriptor, signature, 0, 5, 0);
            fs.closeSync(fileDescriptor);

            if (signature.toString() !== '%PDF-') {
                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    success: false,
                    message: 'Invalid PDF file. Please upload a genuine PDF.'
                });
            }

            next();

        } catch (validationError) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error('PDF validation error:', validationError);

            return res.status(400).json({
                success: false,
                message: 'Unable to validate the uploaded PDF.'
            });
        }
    });
};


// ========================================
// COMPANY LOGO UPLOAD CONFIGURATION
// ========================================

const companyLogoDir = path.join(
    __dirname,
    'uploads',
    'company-logos'
);

fs.mkdirSync(companyLogoDir, { recursive: true });

const companyLogoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, companyLogoDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `company-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`;

        cb(null, uniqueName);
    }
});

const uploadCompanyLogo = multer({
    storage: companyLogoStorage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error('Only JPG, PNG and WEBP images are allowed.')
            );
        }

        cb(null, true);
    }
});

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};


// Recruiter Authorization Middleware
const verifyRecruiter = async (req, res, next) => {
    try {
        const [users] = await db.query(
            `SELECT
             u.role,
             u.account_status,
             rp.recruiter_id
             FROM users u
             LEFT JOIN recruiter_profiles rp
             ON rp.user_id = u.user_id
             WHERE u.user_id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (users[0].role !== 'recruiter') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Recruiters only.'
            });
        }

        if (users[0].account_status !== 'active') {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_INACTIVE',
                message: 'Your recruiter account is inactive.'
            });
        }

        if (!users[0].recruiter_id) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter profile not found.'
            });
        }

        // Store the actual recruiter profile ID
        req.recruiterId = users[0].recruiter_id;

        next();

    } catch (error) {
        console.error('Recruiter authorization error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error during authorization'
        });
    }
};



// Test route
app.get('/', (req, res) => {
    res.send('Jobify Backend is Running!');
});

// Test MySQL connection
app.get('/api/db-test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS connected');

        res.json({
            message: 'MySQL Connected Successfully!',
            database: 'jobify',
            result: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Database connection failed'
        });
    }
});


// User Login API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }


        const user = users[0];

        // Verify password first
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check recruiter account status
        if (
            user.role === 'recruiter' &&
            user.account_status === 'inactive'
        ) {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_INACTIVE',
                message: 'Your account is deactivated. Would you like to reactivate it?'
            });
        }


        // Generate authentication token
        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});


const PORT = process.env.PORT || 5000;



// User Registration API
app.post('/api/register', async (req, res) => {
    let connection;

    try {
        const {
            fullName,
            email,
            mobile,
            password,
            role = 'job_seeker',
            companyName,
            companyWebsite,
            designation
        } = req.body;

        // Check required fields
        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Validate role
        if (!['job_seeker', 'recruiter'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account role'
            });
        }

        // Additional recruiter validation
        if (
            role === 'recruiter' &&
            (!companyName || !designation)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Company name and designation are required'
            });
        }

        // Validate password strength
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters, uppercase, lowercase, number and special character'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get database connection
        connection = await db.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Insert user account
        const [result] = await connection.query(
            `INSERT INTO users
            (full_name, email, mobile, password, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                fullName.trim(),
                email.trim(),
                mobile.trim(),
                hashedPassword,
                role
            ]
        );

        const userId = result.insertId;

        // Insert recruiter company profile
        if (role === 'recruiter') {
            await connection.query(
                `INSERT INTO recruiter_profiles
                (user_id, company_name, company_website, designation)
                VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    companyName.trim(),
                    companyWebsite?.trim() || null,
                    designation.trim()
                ]
            );
        }

        // Save all database changes
        await connection.commit();

        // Generate authentication token
        const token = jwt.sign(
            { userId: userId },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send registration response with token
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                user_id: userId,
                full_name: fullName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                role
            }
        });

    } catch (error) {

        // Undo database changes if anything fails
        if (connection) {
            await connection.rollback();
        }

        console.error('Registration error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email or mobile number already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });

    } finally {
        // Release database connection
        if (connection) {
            connection.release();
        }
    }
});


// Get job details by ID
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        // Validate job ID
        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        // Find job in database
        const [jobs] = await db.query(
            `SELECT j.*
                FROM jobs j
                JOIN recruiter_profiles rp
                 ON rp.recruiter_id = j.recruiter_id
                JOIN users u
                 ON u.user_id = rp.user_id
                WHERE j.job_id = ?
                AND j.status = 'Active'
                AND u.account_status = 'active'`,
            [jobId]
        );

        // Check if job exists
        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const job = jobs[0];

        // Get tags
        const [tags] = await db.query(
            'SELECT tag FROM job_tags WHERE job_id = ?',
            [jobId]
        );

        // Get skills
        const [skills] = await db.query(
            'SELECT skill FROM job_skills WHERE job_id = ?',
            [jobId]
        );

        // Get responsibilities
        const [responsibilities] = await db.query(
            'SELECT responsibility FROM job_responsibilities WHERE job_id = ?',
            [jobId]
        );

        // Get application questions for this job
        const [applicationQuestions] = await db.query(
            `SELECT
        question_id,
        question_text,
        question_type,
        options,
        is_required,
        display_order
        FROM job_application_questions
        WHERE job_id = ?
        ORDER BY display_order ASC`,
            [jobId]
        );

        // Send complete job details
        res.json({
            success: true,
            job: {
                ...job,
                tags: tags.map(item => item.tag),
                skills: skills.map(item => item.skill),
                responsibilities: responsibilities.map(
                    item => item.responsibility
                ),
                applicationQuestions
            }
        });

    } catch (error) {
        console.error('Error fetching job details:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch job details'
        });
    }
});
// ========================================
// GET ALL AVAILABLE JOB SKILLS AND TAGS
// ========================================

app.get('/api/skills', async (req, res) => {
    try {
        const [skills] = await db.query(
            `SELECT DISTINCT js.skill AS name
             FROM job_skills js
             JOIN jobs j ON j.job_id = js.job_id
             JOIN recruiter_profiles rp
                ON rp.recruiter_id = j.recruiter_id
             JOIN users u ON u.user_id = rp.user_id
             WHERE j.status = 'Active'
             AND u.account_status = 'active'`
        );

        const [tags] = await db.query(
            `SELECT DISTINCT jt.tag AS name
             FROM job_tags jt
             JOIN jobs j ON j.job_id = jt.job_id
             JOIN recruiter_profiles rp
                ON rp.recruiter_id = j.recruiter_id
             JOIN users u ON u.user_id = rp.user_id
             WHERE j.status = 'Active'
             AND u.account_status = 'active'`
        );

        const allSkills = [
            ...new Set([
                ...skills.map(item => item.name),
                ...tags.map(item => item.name)
            ])
        ].filter(Boolean).sort((a, b) => a.localeCompare(b));

        res.json({
            success: true,
            count: allSkills.length,
            skills: allSkills
        });

    } catch (error) {
        console.error('Fetch available skills error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch available skills.'
        });
    }
});


// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*
             FROM jobs j
             JOIN recruiter_profiles rp
             ON rp.recruiter_id = j.recruiter_id
             JOIN users u
             ON u.user_id = rp.user_id
             WHERE j.status = 'Active'
             AND u.account_status = 'active'
             ORDER BY j.created_at DESC`
        );

        const [tags] = await db.query('SELECT * FROM job_tags');
        const [skills] = await db.query('SELECT * FROM job_skills');
        const [responsibilities] = await db.query(
            'SELECT * FROM job_responsibilities'
        );

        const formattedJobs = jobs.map(job => ({
            ...job,
            tags: tags
                .filter(item => item.job_id === job.job_id)
                .map(item => item.tag),

            skills: skills
                .filter(item => item.job_id === job.job_id)
                .map(item => item.skill),

            responsibilities: responsibilities
                .filter(item => item.job_id === job.job_id)
                .map(item => item.responsibility)
        }));

        res.json({
            success: true,
            count: formattedJobs.length,
            jobs: formattedJobs
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs'
        });
    }
});

// Protected route - Test JWT authentication
app.get('/api/protected-test', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Authentication verified successfully!',
        userId: req.user.userId
    });
});

// Test recruiter authorization
app.get(
    '/api/recruiter/test',
    verifyToken,
    verifyRecruiter,
    (req, res) => {
        res.json({
            success: true,
            message: 'Recruiter authentication successful!',
            userId: req.user.userId
        });
    }
);

app.get(
    '/api/recruiter/company-profile',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const [profiles] = await db.query(
                `SELECT *
                 FROM recruiter_profiles
                 WHERE user_id = ?`,
                [userId]
            );

            res.json({
                success: true,
                profile: profiles.length > 0 ? profiles[0] : null
            });

        } catch (error) {
            console.error('Fetch company profile error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch company profile.'
            });
        }
    }
);

app.put(
    '/api/recruiter/company-profile',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const {
                companyName,
                website,
                industry,
                companySize,
                location,
                email,
                phone,
                about,
                linkedin,
                twitter,
                companyLogo
            } = req.body;

            const [existing] = await db.query(
                'SELECT recruiter_id FROM recruiter_profiles WHERE user_id = ?',
                [userId]
            );

            const values = [
                companyName || null,
                website || null,
                industry || null,
                companySize || null,
                location || null,
                email || null,
                phone || null,
                about || null,
                linkedin || null,
                twitter || null,
                companyLogo || null
            ];

            if (existing.length > 0) {
                await db.query(
                    `UPDATE recruiter_profiles
                     SET company_name = ?,
                         company_website = ?,
                         industry = ?,
                         company_size = ?,
                         location = ?,
                         email = ?,
                         phone = ?,
                         about = ?,
                         linkedin = ?,
                         twitter = ?,
                         company_logo = ?
                     WHERE user_id = ?`,
                    [...values, userId]
                );
            } else {
                await db.query(
                    `INSERT INTO recruiter_profiles (
                        user_id, company_name, company_website,
                        industry, company_size, location, email,
                        phone, about, linkedin, twitter, company_logo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, ...values]
                );
            }

            res.json({
                success: true,
                message: 'Company profile saved successfully.'
            });

        } catch (error) {
            console.error('Save company profile error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to save company profile.'
            });
        }
    }
);


// ========================================
// RECRUITER - UPLOAD COMPANY LOGO
// ========================================

app.post(
    '/api/recruiter/company-logo',
    verifyToken,
    verifyRecruiter,
    (req, res, next) => {
        uploadCompanyLogo.single('logo')(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a company logo.'
                });
            }

            const userId = req.user.userId;

            const [profiles] = await db.query(
                `SELECT company_logo
                 FROM recruiter_profiles
                 WHERE user_id = ?`,
                [userId]
            );

            if (profiles.length === 0) {
                fs.unlinkSync(req.file.path);

                return res.status(404).json({
                    success: false,
                    message: 'Recruiter company profile not found.'
                });
            }

            const logoPath =
                `uploads/company-logos/${req.file.filename}`;

            await db.query(
                `UPDATE recruiter_profiles
                 SET company_logo = ?
                 WHERE user_id = ?`,
                [logoPath, userId]
            );

            // Delete the previous logo after successful database update
            const oldLogo = profiles[0].company_logo;

            if (
                oldLogo &&
                oldLogo.startsWith('uploads/company-logos/')
            ) {
                const oldLogoPath = path.join(__dirname, oldLogo);

                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }

            res.json({
                success: true,
                message: 'Company logo uploaded successfully.',
                logo: logoPath
            });

        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error('Company logo upload error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to upload company logo.'
            });
        }
    }
);

// Get public company profile by recruiter ID
app.get('/api/company/:recruiterId', async (req, res) => {
    try {
        const recruiterId = Number(req.params.recruiterId);

        if (!Number.isInteger(recruiterId) || recruiterId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recruiter ID'
            });
        }

        const [profiles] = await db.query(
            `SELECT
                recruiter_id,
                company_name,
                company_website,
                industry,
                company_size,
                location,
                email,
                phone,
                about,
                linkedin,
                twitter,
                company_logo
             FROM recruiter_profiles
             WHERE recruiter_id = ?`,
            [recruiterId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        res.json({
            success: true,
            profile: profiles[0]
        });

    } catch (error) {
        console.error('Public company profile error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch company profile'
        });
    }
});

// Recruiter - Post a New Job
app.post(
    '/api/recruiter/jobs',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const {
                title,
                company,
                location,
                workplaceType,
                employmentType,
                experience,
                salaryMin,
                salaryMax,
                description,
                responsibilities,
                skills,
                deadline,
                status = 'Active',
                askQuestions = false,
                applicationQuestions = []
            } = req.body;
            const recruiterId = req.recruiterId;

            // Validate required fields only when publishing
            if (status === 'Active') {
                if (
                    !title?.trim() ||
                    !company?.trim() ||
                    !location?.trim() ||
                    !experience ||
                    !description?.trim() ||
                    !Array.isArray(skills) ||
                    skills.length === 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Please provide all required job details.'
                    });
                }
            }

            // Validate salary
            if (
                salaryMin !== null &&
                salaryMin !== undefined &&
                salaryMin !== '' &&
                Number(salaryMin) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum salary cannot be negative.'
                });
            }

            if (
                salaryMax !== null &&
                salaryMax !== undefined &&
                salaryMax !== '' &&
                Number(salaryMax) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum salary cannot be negative.'
                });
            }

            if (
                salaryMin !== '' &&
                salaryMax !== '' &&
                salaryMin != null &&
                salaryMax != null &&
                Number(salaryMin) > Number(salaryMax)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum salary cannot exceed maximum salary.'
                });
            }

            // Validate employment options
            const allowedWorkplaceTypes = ['On-site', 'Remote', 'Hybrid'];
            const allowedEmploymentTypes = [
                'Full-time',
                'Part-time',
                'Internship',
                'Contract',
                'Freelance'
            ];

            if (
                !allowedWorkplaceTypes.includes(workplaceType) ||
                !allowedEmploymentTypes.includes(employmentType)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid workplace or employment type.'
                });
            }// Validate job status
            const allowedStatuses = ['Draft', 'Active'];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job status.'
                });
            }



            connection = await db.getConnection();
            await connection.beginTransaction();

            // Insert job
            const [jobResult] = await connection.query(
                `INSERT INTO jobs
                (
                    recruiter_id,
                    title,
                    company,
                    location,
                    workplace_type,
                    employment_type,
                    experience,
                    salary_min,
                    salary_max,
                    description,
                    deadline,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    recruiterId,
                    title.trim(),
                    company.trim(),
                    location.trim(),
                    workplaceType,
                    employmentType,
                    experience,
                    salaryMin === '' || salaryMin == null ? null : Number(salaryMin),
                    salaryMax === '' || salaryMax == null ? null : Number(salaryMax),
                    description.trim(),
                    deadline || null,
                    status
                ]
            );

            const jobId = jobResult.insertId;

            // Save skills
            for (const skill of skills) {
                if (typeof skill === 'string' && skill.trim()) {
                    await connection.query(
                        'INSERT INTO job_skills (job_id, skill) VALUES (?, ?)',
                        [jobId, skill.trim()]
                    );
                }
            }

            // Save responsibilities
            if (Array.isArray(responsibilities)) {
                for (const responsibility of responsibilities) {
                    if (
                        typeof responsibility === 'string' &&
                        responsibility.trim()
                    ) {
                        await connection.query(
                            `INSERT INTO job_responsibilities
                            (job_id, responsibility)
                            VALUES (?, ?)`,
                            [jobId, responsibility.trim()]
                        );
                    }
                }
            }

            // Save application questions
            if (askQuestions && Array.isArray(applicationQuestions)) {

                const allowedTypes = [
                    'short_answer',
                    'long_answer',
                    'multiple_choice',
                    'checkboxes',
                    'dropdown',
                    'number',
                    'yes_no'
                ];

                for (let index = 0; index < applicationQuestions.length; index++) {

                    const question = applicationQuestions[index];

                    if (
                        !question.question_text?.trim() ||
                        !allowedTypes.includes(question.question_type)
                    ) {
                        throw new Error('Invalid application question.');
                    }

                    const needsOptions = [
                        'multiple_choice',
                        'checkboxes',
                        'dropdown'
                    ].includes(question.question_type);

                    const options = needsOptions
                        ? question.options
                        : null;

                    if (
                        needsOptions &&
                        (!Array.isArray(options) || options.length < 2)
                    ) {
                        throw new Error(
                            `Invalid answer options for: ${question.question_text}`
                        );
                    }

                    await connection.query(
                        `INSERT INTO job_application_questions
            (
                job_id,
                question_text,
                question_type,
                options,
                is_required,
                display_order
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            jobId,
                            question.question_text.trim(),
                            question.question_type,
                            options ? JSON.stringify(options) : null,
                            question.is_required ? 1 : 0,
                            index + 1
                        ]
                    );
                }
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Job posted successfully!',
                jobId
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Post job error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to post job.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);


// ========================================
// RECRUITER - ANALYTICS API
// ========================================

app.get(
    '/api/recruiter/analytics',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const recruiterId = req.recruiterId;

            // 1. Summary statistics
            const [stats] = await db.query(
                `SELECT
                    (SELECT COUNT(*)
                     FROM jobs
                     WHERE recruiter_id = ?) AS totalJobs,

                    (SELECT COUNT(*)
                     FROM applications a
                     JOIN jobs j ON a.job_id = j.job_id
                     WHERE j.recruiter_id = ?) AS totalApplicants,

                    (SELECT COUNT(*)
                     FROM applications a
                     JOIN jobs j ON a.job_id = j.job_id
                     WHERE j.recruiter_id = ?
                     AND a.status = 'Shortlisted') AS shortlisted,

                    (SELECT COUNT(*)
                     FROM applications a
                     JOIN jobs j ON a.job_id = j.job_id
                     WHERE j.recruiter_id = ?
                     AND a.status = 'Hired') AS hired`,
                [recruiterId, recruiterId, recruiterId, recruiterId]
            );

            // 2. Monthly application trends (last 6 months)
            const [monthlyApplications] = await db.query(
                `SELECT
                    DATE_FORMAT(a.application_date, '%Y-%m') AS monthKey,
                    DATE_FORMAT(a.application_date, '%b') AS month,
                    COUNT(*) AS applications
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE j.recruiter_id = ?
                 AND a.application_date >= DATE_SUB(
                     CURDATE(), INTERVAL 5 MONTH
                 ) - INTERVAL (DAYOFMONTH(CURDATE()) - 1) DAY
                 GROUP BY monthKey, month
                 ORDER BY monthKey ASC`,
                [recruiterId]
            );

            // 3. Application status distribution
            const [applicationStatus] = await db.query(
                `SELECT
                    a.status AS name,
                    COUNT(*) AS value
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE j.recruiter_id = ?
                 GROUP BY a.status`,
                [recruiterId]
            );

            // 4. Job performance
            const [jobPerformance] = await db.query(
                `SELECT
                    j.job_id,
                    j.title AS job,
                    COUNT(a.application_id) AS applicants
                 FROM jobs j
                 LEFT JOIN applications a ON j.job_id = a.job_id
                 WHERE j.recruiter_id = ?
                 GROUP BY j.job_id, j.title
                 ORDER BY applicants DESC
                 LIMIT 5`,
                [recruiterId]
            );

            // 5. Recruitment funnel
            const [funnel] = await db.query(
                `SELECT
                    COUNT(DISTINCT a.application_id) AS applied,

                    COUNT(DISTINCT CASE
                        WHEN a.status IN (
                            'Reviewed', 'Shortlisted', 'Rejected', 'Hired'
                        )
                        THEN a.application_id
                    END) AS reviewed,

                    COUNT(DISTINCT CASE
                        WHEN a.status IN ('Shortlisted', 'Hired')
                        THEN a.application_id
                    END) AS shortlisted,

                    COUNT(DISTINCT i.application_id) AS interviewed,

                    COUNT(DISTINCT CASE
                        WHEN a.status = 'Hired'
                        THEN a.application_id
                    END) AS hired

                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 LEFT JOIN interviews i
                    ON a.application_id = i.application_id
                 WHERE j.recruiter_id = ?`,
                [recruiterId]
            );

            res.json({
                success: true,
                stats: stats[0],
                monthlyApplications,
                applicationStatus,
                jobPerformance,
                recruitmentFunnel: [
                    {
                        stage: 'Applied',
                        candidates: Number(funnel[0].applied)
                    },
                    {
                        stage: 'Reviewed',
                        candidates: Number(funnel[0].reviewed)
                    },
                    {
                        stage: 'Shortlisted',
                        candidates: Number(funnel[0].shortlisted)
                    },
                    {
                        stage: 'Interviewed',
                        candidates: Number(funnel[0].interviewed)
                    },
                    {
                        stage: 'Hired',
                        candidates: Number(funnel[0].hired)
                    }
                ]
            });

        } catch (error) {
            console.error('Recruiter analytics error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch recruitment analytics.'
            });
        }
    }
);

// Recruiter - Get All Jobs Posted by Logged-in Recruiter
app.get(
    '/api/recruiter/jobs',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const recruiterId = req.recruiterId;

            const [jobs] = await db.query(
                `SELECT
                    j.*,
                    (
                        SELECT COUNT(*)
                        FROM applications a
                        WHERE a.job_id = j.job_id
                    ) AS applicants
                 FROM jobs j
                 WHERE j.recruiter_id = ?
                 ORDER BY j.created_at DESC`,
                [recruiterId]
            );

            res.status(200).json({
                success: true,
                jobs
            });

        } catch (error) {
            console.error('Get recruiter jobs error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch recruiter jobs.'
            });
        }
    }
);


// Recruiter - Get Individual Job Details (including Drafts)
app.get(
    '/api/recruiter/jobs/:id/details',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const jobId = Number(req.params.id);
            const recruiterId = req.recruiterId;

            if (!Number.isInteger(jobId) || jobId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID.'
                });
            }

            // Fetch job belonging to logged-in recruiter
            const [jobs] = await db.query(
                `SELECT *
                 FROM jobs
                 WHERE job_id = ?
                 AND recruiter_id = ?`,
                [jobId, recruiterId]
            );

            if (jobs.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                });
            }

            const job = jobs[0];

            // Fetch skills
            const [skills] = await db.query(
                `SELECT skill FROM job_skills WHERE job_id = ?`,
                [jobId]
            );

            // Fetch responsibilities
            const [responsibilities] = await db.query(
                `SELECT responsibility
                 FROM job_responsibilities
                 WHERE job_id = ?`,
                [jobId]
            );

            // Fetch application questions
            const [questions] = await db.query(
                `SELECT
                    question_text,
                    question_type,
                    options,
                    is_required,
                    display_order
                 FROM job_application_questions
                 WHERE job_id = ?
                 ORDER BY display_order ASC`,
                [jobId]
            );

            // Format application questions
            const applicationQuestions = questions.map(question => {
                let options = question.options;

                if (typeof options === 'string') {
                    try {
                        options = JSON.parse(options);
                    } catch {
                        options = [];
                    }
                }

                return {
                    question_text: question.question_text,
                    question_type: question.question_type,
                    options: options || [],
                    is_required: Boolean(question.is_required)
                };
            });

            res.json({
                success: true,
                job: {
                    ...job,
                    workplaceType: job.workplace_type,
                    employmentType: job.employment_type,
                    salaryMin: job.salary_min,
                    salaryMax: job.salary_max,
                    skills: skills.map(item => item.skill),
                    responsibilities: responsibilities.map(
                        item => item.responsibility
                    ),
                    askQuestions: applicationQuestions.length > 0,
                    applicationQuestions
                }
            });

        } catch (error) {
            console.error('Fetch individual recruiter job error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch job details.'
            });
        }
    }
);

// Recruiter - Update Job Status
app.patch(
    '/api/recruiter/jobs/:id/status',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const jobId = Number(req.params.id);
            const recruiterId = req.recruiterId;
            const { status } = req.body;

            if (!Number.isInteger(jobId) || jobId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID.'
                });
            }

            if (!['Active', 'Closed', 'Draft'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job status.'
                });
            }

            const [result] = await db.query(
                `UPDATE jobs
                 SET status = ?
                 WHERE job_id = ?
                 AND recruiter_id = ?`,
                [status, jobId, recruiterId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or you do not own this job.'
                });
            }

            res.json({
                success: true,
                message: `Job ${status.toLowerCase()} successfully.`,
                status
            });

        } catch (error) {
            console.error('Update job status error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update job status.'
            });
        }
    }
);


// Recruiter - Update Existing Draft Job
app.put(
    '/api/recruiter/jobs/:id',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const jobId = Number(req.params.id);
            const recruiterId = req.recruiterId;

            const {
                title,
                company,
                location,
                workplaceType,
                employmentType,
                experience,
                salaryMin,
                salaryMax,
                description,
                responsibilities = [],
                skills = [],
                deadline,
                status = 'Draft',
                askQuestions = false,
                applicationQuestions = []
            } = req.body;

            if (!Number.isInteger(jobId) || jobId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID.'
                });
            }

            if (!['Draft', 'Active'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job status.'
                });
            }

            // Validate required fields when publishing
            if (
                status === 'Active' &&
                (
                    !title?.trim() ||
                    !company?.trim() ||
                    !location?.trim() ||
                    !experience ||
                    !description?.trim() ||
                    !Array.isArray(skills) ||
                    skills.length === 0
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required job details.'
                });
            }

            const allowedWorkplaceTypes = [
                'On-site', 'Remote', 'Hybrid'
            ];

            const allowedEmploymentTypes = [
                'Full-time',
                'Part-time',
                'Internship',
                'Contract',
                'Freelance'
            ];

            if (
                !allowedWorkplaceTypes.includes(workplaceType) ||
                !allowedEmploymentTypes.includes(employmentType)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid workplace or employment type.'
                });
            }

            if (
                salaryMin !== '' &&
                salaryMin != null &&
                Number(salaryMin) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum salary cannot be negative.'
                });
            }

            if (
                salaryMax !== '' &&
                salaryMax != null &&
                Number(salaryMax) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum salary cannot be negative.'
                });
            }

            if (
                salaryMin !== '' &&
                salaryMax !== '' &&
                salaryMin != null &&
                salaryMax != null &&
                Number(salaryMin) > Number(salaryMax)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum salary cannot exceed maximum salary.'
                });
            }

            if (
                !Array.isArray(skills) ||
                !Array.isArray(responsibilities) ||
                !Array.isArray(applicationQuestions)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job details.'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            // Only allow editing a job owned by this recruiter
            // and currently saved as a Draft.
            const [existingJobs] = await connection.query(
                `SELECT job_id
                 FROM jobs
                 WHERE job_id = ?
                 AND recruiter_id = ?
                 AND status = 'Draft'`,
                [jobId, recruiterId]
            );

            if (existingJobs.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: 'Draft not found or you do not own this draft.'
                });
            }

            // Update existing job (do not insert a new job)
            await connection.query(
                `UPDATE jobs
                 SET
                    title = ?,
                    company = ?,
                    location = ?,
                    workplace_type = ?,
                    employment_type = ?,
                    experience = ?,
                    salary_min = ?,
                    salary_max = ?,
                    description = ?,
                    deadline = ?,
                    status = ?
                 WHERE job_id = ?
                 AND recruiter_id = ?`,
                [
                    (title || '').trim(),
                    (company || '').trim(),
                    (location || '').trim(),
                    workplaceType,
                    employmentType,
                    experience || '',
                    salaryMin === '' || salaryMin == null
                        ? null : Number(salaryMin),
                    salaryMax === '' || salaryMax == null
                        ? null : Number(salaryMax),
                    (description || '').trim(),
                    deadline || null,
                    status,
                    jobId,
                    recruiterId
                ]
            );

            // Replace existing skills
            await connection.query(
                'DELETE FROM job_skills WHERE job_id = ?',
                [jobId]
            );

            for (const skill of skills) {
                if (typeof skill === 'string' && skill.trim()) {
                    await connection.query(
                        `INSERT INTO job_skills (job_id, skill)
                         VALUES (?, ?)`,
                        [jobId, skill.trim()]
                    );
                }
            }

            // Replace responsibilities
            await connection.query(
                'DELETE FROM job_responsibilities WHERE job_id = ?',
                [jobId]
            );

            for (const item of responsibilities) {
                if (typeof item === 'string' && item.trim()) {
                    await connection.query(
                        `INSERT INTO job_responsibilities
                         (job_id, responsibility)
                         VALUES (?, ?)`,
                        [jobId, item.trim()]
                    );
                }
            }

            // Replace application questions
            await connection.query(
                'DELETE FROM job_application_questions WHERE job_id = ?',
                [jobId]
            );

            if (askQuestions) {
                const allowedTypes = [
                    'short_answer',
                    'long_answer',
                    'multiple_choice',
                    'checkboxes',
                    'dropdown',
                    'number',
                    'yes_no'
                ];

                for (
                    let index = 0;
                    index < applicationQuestions.length;
                    index++
                ) {
                    const question = applicationQuestions[index];

                    if (
                        !question.question_text?.trim() ||
                        !allowedTypes.includes(question.question_type)
                    ) {
                        throw new Error('Invalid application question.');
                    }

                    const needsOptions = [
                        'multiple_choice',
                        'checkboxes',
                        'dropdown'
                    ].includes(question.question_type);

                    const options = needsOptions
                        ? question.options
                        : null;

                    if (
                        needsOptions &&
                        (!Array.isArray(options) || options.length < 2)
                    ) {
                        throw new Error(
                            `Invalid answer options for: ${question.question_text}`
                        );
                    }

                    await connection.query(
                        `INSERT INTO job_application_questions
                        (
                            job_id,
                            question_text,
                            question_type,
                            options,
                            is_required,
                            display_order
                        )
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            jobId,
                            question.question_text.trim(),
                            question.question_type,
                            options ? JSON.stringify(options) : null,
                            question.is_required ? 1 : 0,
                            index + 1
                        ]
                    );
                }
            }

            await connection.commit();

            res.json({
                success: true,
                message: status === 'Active'
                    ? 'Draft published successfully!'
                    : 'Draft updated successfully!',
                jobId,
                status
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Update draft error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update draft.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// Recruiter - Delete a Job
app.delete(
    '/api/recruiter/jobs/:id',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const jobId = Number(req.params.id);
            const recruiterId = req.recruiterId;

            if (!Number.isInteger(jobId) || jobId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID.'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            // Check job ownership
            const [jobs] = await connection.query(
                `SELECT job_id
                 FROM jobs
                 WHERE job_id = ?
                 AND recruiter_id = ?`,
                [jobId, recruiterId]
            );

            if (jobs.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: 'Job not found or you do not own this job.'
                });
            }

            // Delete related records first
            await connection.query(
                'DELETE FROM applications WHERE job_id = ?',
                [jobId]
            );

            await connection.query(
                'DELETE FROM job_skills WHERE job_id = ?',
                [jobId]
            );

            await connection.query(
                'DELETE FROM job_responsibilities WHERE job_id = ?',
                [jobId]
            );

            await connection.query(
                'DELETE FROM job_tags WHERE job_id = ?',
                [jobId]
            );

            // Delete the job
            await connection.query(
                'DELETE FROM jobs WHERE job_id = ? AND recruiter_id = ?',
                [jobId, recruiterId]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Job deleted successfully.'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Delete job error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to delete job.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// Recruiter - Get All Applicants
app.get(
    '/api/recruiter/applicants',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const recruiterId = req.recruiterId;

            const [applicants] = await db.query(
                `SELECT
                    a.application_id AS id,
                    u.full_name AS name,
                    u.email,
                    j.title AS jobTitle,
                    DATE_FORMAT(a.application_date, '%Y-%m-%d') AS appliedDate,
                    a.status
                 FROM applications a
                 JOIN users u ON a.user_id = u.user_id
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE j.recruiter_id = ?
                 ORDER BY a.application_date DESC`,
                [recruiterId]
            );

            res.json({
                success: true,
                applicants
            });

        } catch (error) {
            console.error('Fetch recruiter applicants error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch applicants.'
            });
        }
    }
);


// Recruiter - Get Shortlisted Candidates for Interviews
app.get(
    '/api/recruiter/shortlisted-applicants',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const recruiterId = req.recruiterId;

            const [applicants] = await db.query(
                `SELECT
                    a.application_id AS applicationId,
                    a.application_date AS appliedDate,
                    a.status,
                    u.full_name AS candidate,
                    u.email,
                    u.mobile,
                    j.title AS jobTitle,
                    j.company,
                    d.location,
                    d.professional_summary,
                    d.skills,
                    d.experience_level,
                    d.years_of_experience,
                    d.current_company,
                    d.current_job_title,
                    d.linkedin_url,
                    d.github_url,
                    d.portfolio_url,
                    d.resume_path
                 FROM applications a
                 JOIN users u ON a.user_id = u.user_id
                 JOIN jobs j ON a.job_id = j.job_id
                 LEFT JOIN application_details d
                    ON a.application_id = d.application_id
                 WHERE j.recruiter_id = ?
                 AND a.status = 'Shortlisted'
                 ORDER BY a.application_date DESC`,
                [recruiterId]
            );

            applicants.forEach(applicant => {
                try {
                    applicant.skills = applicant.skills
                        ? JSON.parse(applicant.skills)
                        : [];
                } catch {
                    applicant.skills = [];
                }
            });

            res.json({
                success: true,
                count: applicants.length,
                applicants
            });

        } catch (error) {
            console.error('Fetch shortlisted applicants error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch shortlisted candidates.'
            });
        }
    }
);

// Recruiter - Update Applicant Status
app.patch(
    '/api/recruiter/applications/:id/status',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const applicationId = Number(req.params.id);
            const recruiterId = req.recruiterId;
            const { status } = req.body;

            const allowedStatuses = [
                'Pending',
                'Reviewed',
                'Shortlisted',
                'Rejected',
                'Withdrawn',
                'Hired'
            ];

            if (!Number.isInteger(applicationId) || applicationId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application ID.'
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application status.'
                });
            }

            // Verify that this application belongs to the recruiter's job
            const [applications] = await db.query(
                `SELECT a.application_id
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE a.application_id = ?
                 AND j.recruiter_id = ?`,
                [applicationId, recruiterId]
            );

            if (applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found.'
                });
            }

            await db.query(
                `UPDATE applications
                 SET status = ?
                 WHERE application_id = ?`,
                [status, applicationId]
            );

            res.json({
                success: true,
                message: 'Applicant status updated successfully.',
                status
            });

        } catch (error) {
            console.error('Update applicant status error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update applicant status.'
            });
        }
    }
);


// ========================================
// CANDIDATE PROFILE APIs
// ========================================

// Get logged-in candidate profile
app.get('/api/candidate/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            `SELECT user_id, full_name, email, mobile
             FROM users
             WHERE user_id = ? AND role = 'job_seeker'`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found.'
            });
        }

        const [profiles] = await db.query(
            'SELECT * FROM candidate_profiles WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            user: users[0],
            profile: profiles.length > 0 ? profiles[0] : null
        });

    } catch (error) {
        console.error('Get candidate profile error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidate profile.'
        });
    }
});


// Create or update candidate profile
app.put('/api/candidate/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            location,
            professional_summary,
            skills,
            experience_level,
            years_of_experience,
            current_company,
            current_job_title,
            linkedin_url,
            github_url,
            portfolio_url
        } = req.body;

        // Confirm this account is a job seeker
        const [users] = await db.query(
            `SELECT user_id FROM users
             WHERE user_id = ? AND role = 'job_seeker'`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Only job seekers can update candidate profiles.'
            });
        }

        if (skills !== undefined && !Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: 'Skills must be provided as an array.'
            });
        }

        await db.query(
            `INSERT INTO candidate_profiles (
                user_id,
                location,
                professional_summary,
                skills,
                experience_level,
                years_of_experience,
                current_company,
                current_job_title,
                linkedin_url,
                github_url,
                portfolio_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                location = VALUES(location),
                professional_summary = VALUES(professional_summary),
                skills = VALUES(skills),
                experience_level = VALUES(experience_level),
                years_of_experience = VALUES(years_of_experience),
                current_company = VALUES(current_company),
                current_job_title = VALUES(current_job_title),
                linkedin_url = VALUES(linkedin_url),
                github_url = VALUES(github_url),
                portfolio_url = VALUES(portfolio_url)`,
            [
                userId,
                location || null,
                professional_summary || null,
                skills === undefined ? null : JSON.stringify(skills),
                experience_level || null,
                years_of_experience ?? null,
                current_company || null,
                current_job_title || null,
                linkedin_url || null,
                github_url || null,
                portfolio_url || null
            ]
        );

        res.json({
            success: true,
            message: 'Candidate profile saved successfully.'
        });

    } catch (error) {
        console.error('Save candidate profile error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to save candidate profile.'
        });
    }
});


// ========================================
// CANDIDATE PROFILE RESUME UPLOAD API
// ========================================

app.post(
    '/api/candidate/resume',
    verifyToken,
    resumeUploadMiddleware,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            // Resume is mandatory for this upload API
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a PDF resume.'
                });
            }

            // Check candidate account
            const [users] = await db.query(
                `SELECT user_id FROM users
                 WHERE user_id = ? AND role = 'job_seeker'`,
                [userId]
            );

            if (users.length === 0) {
                fs.unlinkSync(req.file.path);

                return res.status(403).json({
                    success: false,
                    message: 'Only candidates can upload resumes.'
                });
            }

            // Save resume path in candidate profile
            const resumePath =
                `uploads/resumes/${req.file.filename}`;

            await db.query(
                `INSERT INTO candidate_profiles
                    (user_id, resume_path)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE
                    resume_path = VALUES(resume_path)`,
                [userId, resumePath]
            );

            res.status(200).json({
                success: true,
                message: 'Resume uploaded successfully!',
                resumePath
            });

        } catch (error) {
            // Remove uploaded file if database saving fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error('Resume upload error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to upload resume.'
            });
        }
    }
);



// Apply for a job - Complete application submission
app.post(
    '/api/applications',
    verifyToken,
    resumeUploadMiddleware,
    async (req, res) => {
        let connection;

        try {
            const userId = req.user.userId;

            // Parse multipart form data
            const details = typeof req.body.formData === 'string'
                ? JSON.parse(req.body.formData)
                : (req.body.formData || req.body);

            const answers = typeof req.body.answers === 'string'
                ? JSON.parse(req.body.answers)
                : (req.body.answers || {});

            const jobId = Number(req.body.jobId || details.jobId);

            if (!Number.isInteger(jobId) || jobId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid job ID is required.'
                });
            }

            // Check candidate account
            const [users] = await db.query(
                `SELECT user_id, full_name, email, mobile
                 FROM users
                 WHERE user_id = ? AND role = 'job_seeker'`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Only job seekers can apply.'
                });
            }

            // Check job availability
            const [jobs] = await db.query(
                `SELECT job_id, status
                 FROM jobs
                 WHERE job_id = ?`,
                [jobId]
            );

            if (jobs.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found.'
                });
            }

            if (jobs[0].status !== 'Active') {
                return res.status(400).json({
                    success: false,
                    message: 'This job is closed.'
                });
            }

            // Get saved candidate profile
            const [profiles] = await db.query(
                `SELECT resume_path
                 FROM candidate_profiles
                 WHERE user_id = ?`,
                [userId]
            );

            // A newly uploaded PDF takes priority.
            // Otherwise, use the saved profile resume.
            const resumePath = req.file
                ? `uploads/resumes/${req.file.filename}`
                : profiles[0]?.resume_path;

            if (!resumePath) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a PDF resume before applying.'
                });
            }

            // Get questions belonging to this job
            const [questions] = await db.query(
                `SELECT question_id, is_required
                 FROM job_application_questions
                 WHERE job_id = ?`,
                [jobId]
            );

            // Check that answers are a valid object
            if (
                !answers ||
                typeof answers !== 'object' ||
                Array.isArray(answers)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application answers.'
                });
            }

            const questionMap = new Map(
                questions.map(question => [
                    String(question.question_id),
                    question
                ])
            );

            // Reject answers for questions belonging to other jobs
            for (const questionId of Object.keys(answers)) {
                if (!questionMap.has(String(questionId))) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid application question.'
                    });
                }
            }

            // Validate required recruiter questions
            for (const question of questions) {
                if (question.is_required) {
                    const answer = answers[String(question.question_id)];

                    const isEmpty =
                        answer === undefined ||
                        answer === null ||
                        answer === '' ||
                        (Array.isArray(answer) && answer.length === 0);

                    if (isEmpty) {
                        return res.status(400).json({
                            success: false,
                            message: 'Please answer all required questions.'
                        });
                    }
                }
            }

            // Prepare candidate details
            const candidate = users[0];

            const fullName = details.full_name || candidate.full_name;
            const email = details.email || candidate.email;
            const mobile = details.mobile || candidate.mobile;

            const skills = typeof details.skills === 'string'
                ? JSON.parse(details.skills)
                : details.skills;

            const yearsOfExperience =
                details.years_of_experience === '' ||
                    details.years_of_experience == null
                    ? null
                    : Number(details.years_of_experience);

            if (
                yearsOfExperience !== null &&
                (!Number.isFinite(yearsOfExperience) ||
                    yearsOfExperience < 0)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid years of experience.'
                });
            }

            if (!Array.isArray(skills || [])) {
                return res.status(400).json({
                    success: false,
                    message: 'Skills must be an array.'
                });
            }

            // Start database transaction
            connection = await db.getConnection();
            await connection.beginTransaction();

            // Insert application with Pending status
            const [applicationResult] = await connection.query(
                `INSERT INTO applications (user_id, job_id, status)
                    VALUES (?, ?, 'Pending')`,
                [userId, jobId]
            );

            const applicationId = applicationResult.insertId;

            // Save application details and resume path
            await connection.query(
                `INSERT INTO application_details (
                    application_id,
                    full_name,
                    email,
                    mobile,
                    location,
                    professional_summary,
                    skills,
                    experience_level,
                    years_of_experience,
                    current_company,
                    current_job_title,
                    linkedin_url,
                    github_url,
                    portfolio_url,
                    cover_letter,
                    current_ctc,
                    expected_ctc,
                    resume_path
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicationId,
                    fullName,
                    email,
                    mobile,
                    details.location || null,
                    details.professional_summary || null,
                    JSON.stringify(skills || []),
                    details.experience_level || null,
                    yearsOfExperience,
                    details.current_company || null,
                    details.current_job_title || null,
                    details.linkedin_url || null,
                    details.github_url || null,
                    details.portfolio_url || null,
                    details.cover_letter || null,
                    details.current_ctc || null,
                    details.expected_ctc || null,
                    resumePath
                ]
            );

            // Save recruiter question answers
            for (const [questionId, answer] of Object.entries(answers)) {
                if (
                    answer !== undefined &&
                    answer !== null &&
                    answer !== '' &&
                    !(Array.isArray(answer) && answer.length === 0)
                ) {
                    await connection.query(
                        `INSERT INTO application_answers
                         (application_id, question_id, answer)
                         VALUES (?, ?, ?)`,
                        [
                            applicationId,
                            Number(questionId),
                            JSON.stringify(answer)
                        ]
                    );
                }
            }

            // Save all database changes
            await connection.commit();

            // Send notification to the candidate
            io.to(`user-${userId}`).emit('new-notification', {
                message: 'Your job application has been submitted successfully!'
            });

            console.log(
                `Application notification sent to user-${userId}`
            );

            res.status(201).json({
                success: true,
                message: 'Job application submitted successfully!',
                applicationId,
                resumePath
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            // Remove newly uploaded file if submission failed
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'You have already applied for this job.'
                });
            }

            console.error('Application submission error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to submit application.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);


// Recruiter - Get Individual Application Details
app.get(
    '/api/recruiter/applications/:id',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const applicationId = Number(req.params.id);
            const recruiterId = req.recruiterId;

            if (!Number.isInteger(applicationId) || applicationId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application ID.'
                });
            }

            // Verify application belongs to this recruiter's job
            const [applications] = await db.query(
                `SELECT
                    a.application_id AS id,
                    a.application_date AS appliedDate,
                    a.status,
                    j.title AS jobTitle,
                    j.company,
                    j.location AS jobLocation,
                    d.full_name,
                    d.email,
                    d.mobile,
                    d.location,
                    d.professional_summary,
                    d.skills,
                    d.experience_level,
                    d.years_of_experience,
                    d.current_company,
                    d.current_job_title,
                    d.linkedin_url,
                    d.github_url,
                    d.portfolio_url,
                    d.cover_letter,
                    d.current_ctc,
                    d.expected_ctc,
                    d.resume_path
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 LEFT JOIN application_details d
                    ON a.application_id = d.application_id
                 WHERE a.application_id = ?
                 AND j.recruiter_id = ?`,
                [applicationId, recruiterId]
            );

            if (applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found.'
                });
            }

            const [answers] = await db.query(
                `SELECT
                    q.question_text,
                    q.question_type,
                    aa.answer
                 FROM application_answers aa
                 JOIN job_application_questions q
                    ON aa.question_id = q.question_id
                 WHERE aa.application_id = ?
                 ORDER BY q.display_order ASC`,
                [applicationId]
            );

            const application = applications[0];

            // Parse JSON fields safely
            try {
                application.skills = application.skills
                    ? JSON.parse(application.skills)
                    : [];
            } catch {
                application.skills = [];
            }

            answers.forEach(item => {
                try {
                    item.answer = JSON.parse(item.answer);
                } catch {
                    // Keep original answer if it is not JSON
                }
            });

            res.json({
                success: true,
                application,
                answers
            });

        } catch (error) {
            console.error('Fetch application details error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch application details.'
            });
        }
    }
);

// Get applications of the logged-in user
app.get('/api/applications/my-applications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [applications] = await db.query(
            `SELECT
                a.application_id,
                a.application_date,
                a.status,
                j.title,
                j.company,
                j.location
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE a.user_id = ?
             ORDER BY a.application_date DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('Fetch applications error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch applications.'
        });
    }
});

// Withdraw a job application
app.patch('/api/applications/:id/withdraw', verifyToken, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.user.userId;

        const [result] = await db.query(
            `UPDATE applications
             SET status = 'Withdrawn'
             WHERE application_id = ?
             AND user_id = ?
             AND status = 'Pending'`,
            [applicationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Application not found or cannot be withdrawn.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully.'
        });

    } catch (error) {
        console.error('Withdraw application error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to withdraw application.'
        });
    }
});


// ========================================
// RECRUITER - SCHEDULE INTERVIEW API
// ========================================

app.post(
    '/api/recruiter/interviews',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const recruiterId = req.recruiterId;

            const {
                applicationId,
                candidate,
                email,
                jobTitle,
                date,
                time,
                type,
                meetingLink,
                location,
                interviewer
            } = req.body;

            // Validate required fields
            if (
                !candidate?.trim() ||
                !email?.trim() ||
                !jobTitle?.trim() ||
                !date ||
                !time ||
                !type
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required interview details.'
                });
            }

            const allowedTypes = ['Online', 'In-person', 'Phone'];

            if (!allowedTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid interview type.'
                });
            }

            // Validate date and time formats
            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid interview date or time.'
                });
            }

            if (type === 'Online' && !meetingLink?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide the meeting link.'
                });
            }

            if (type === 'In-person' && !location?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide the interview location.'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            let candidateUserId = null;
            let finalCandidate = candidate.trim();
            let finalEmail = email.trim();
            let finalJobTitle = jobTitle.trim();
            let finalApplicationId = null;

            // If an application ID is provided,
            // verify that it belongs to this recruiter's job.
            if (applicationId) {
                const [applications] = await connection.query(
                    `SELECT
                        a.application_id,
                        a.status,
                        u.user_id,
                        u.full_name,
                        u.email,
                        j.title
                     FROM applications a
                     JOIN users u ON a.user_id = u.user_id
                     JOIN jobs j ON a.job_id = j.job_id
                     WHERE a.application_id = ?
                     AND j.recruiter_id = ?
                     AND a.status = 'Shortlisted'`,
                    [applicationId, recruiterId]
                );

                if (applications.length === 0) {
                    await connection.rollback();

                    return res.status(404).json({
                        success: false,
                        message: 'Shortlisted application not found.'
                    });
                }

                const applicant = applications[0];

                candidateUserId = applicant.user_id;
                finalCandidate = applicant.full_name;
                finalEmail = applicant.email;
                finalJobTitle = applicant.title;
                finalApplicationId = applicant.application_id;
            } else {
                // Custom candidate:
                // Check whether their email belongs to a Job Seeker.
                const [users] = await connection.query(
                    `SELECT user_id, full_name, email
                     FROM users
                     WHERE email = ?
                     AND role = 'job_seeker'`,
                    [finalEmail]
                );

                if (users.length > 0) {
                    candidateUserId = users[0].user_id;
                    finalCandidate = users[0].full_name;
                    finalEmail = users[0].email;
                }
            }

            // Save interview
            const [interviewResult] = await connection.query(
                `INSERT INTO interviews (
                    application_id,
                    candidate_user_id,
                    recruiter_id,
                    candidate_name,
                    candidate_email,
                    job_title,
                    interview_date,
                    interview_time,
                    interview_type,
                    meeting_link,
                    location,
                    interviewer,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')`,
                [
                    finalApplicationId,
                    candidateUserId,
                    recruiterId,
                    finalCandidate,
                    finalEmail,
                    finalJobTitle,
                    date,
                    time,
                    type,
                    meetingLink?.trim() || null,
                    location?.trim() || null,
                    interviewer?.trim() || null
                ]
            );

            const interviewId = interviewResult.insertId;

            // Notify registered Job Seekers only.
            // Custom candidates without a Jobify account
            // can still have their interview scheduled.
            if (candidateUserId) {
                const message =
                    `Your interview for ${finalJobTitle} is scheduled on ${date} at ${time}. Interview type: ${type}.`;

                await connection.query(
                    `INSERT INTO notifications (
                        user_id,
                        interview_id,
                        title,
                        message,
                        notification_type
                    )
                    VALUES (?, ?, ?, ?, 'interview_scheduled')`,
                    [
                        candidateUserId,
                        interviewId,
                        'Interview Scheduled',
                        message
                    ]
                );
            }

            await connection.commit();
            // Send real-time notification to the candidate
            if (candidateUserId) {
                io.to(`user-${candidateUserId}`).emit('new-notification', {
                    message: 'You have a new interview notification'
                });

                console.log(
                    `Real-time notification sent to user-${candidateUserId}`
                );
            }

            res.status(201).json({
                success: true,
                message: candidateUserId
                    ? 'Interview scheduled and candidate notified successfully.'
                    : 'Interview scheduled. No registered Jobify account was found for this email.',
                interviewId,
                notificationSent: Boolean(candidateUserId)
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Schedule interview error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to schedule interview.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// ========================================
// RECRUITER - GET SCHEDULED INTERVIEWS
// ========================================

app.get(
    '/api/recruiter/interviews',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const recruiterId = req.recruiterId;

            const [interviews] = await db.query(
                `SELECT
                    interview_id,
                    application_id,
                    candidate_user_id,
                    candidate_name,
                    candidate_email,
                    job_title,
                    interview_date,
                    interview_time,
                    interview_type,
                    meeting_link,
                    location,
                    interviewer,
                    status,
                    created_at
                 FROM interviews
                 WHERE recruiter_id = ?
                 ORDER BY interview_date DESC, interview_time DESC`,
                [recruiterId]
            );

            res.json({
                success: true,
                count: interviews.length,
                interviews
            });

        } catch (error) {
            console.error('Fetch recruiter interviews error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch scheduled interviews.'
            });
        }
    }
);

// ========================================
// RECRUITER - UPDATE INTERVIEW STATUS
// ========================================

app.patch(
    '/api/recruiter/interviews/:id/status',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const recruiterId = req.recruiterId;
            const interviewId = req.params.id;
            const { status, hired } = req.body;

            if (!['Completed', 'Cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid interview status.'
                });
            }

            if (status === 'Completed' && typeof hired !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Please specify whether the candidate was hired.'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            const [interviews] = await connection.query(
                `SELECT interview_id, application_id, status
                 FROM interviews
                 WHERE interview_id = ?
                 AND recruiter_id = ?
                 FOR UPDATE`,
                [interviewId, recruiterId]
            );

            if (interviews.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: 'Interview not found.'
                });
            }

            const interview = interviews[0];

            if (interview.status !== 'Scheduled') {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: 'This interview has already been completed or cancelled.'
                });
            }

            await connection.query(
                `UPDATE interviews
                 SET status = ?
                 WHERE interview_id = ? AND recruiter_id = ?`,
                [status, interviewId, recruiterId]
            );

            if (status === 'Completed' && hired && interview.application_id) {
                await connection.query(
                    `UPDATE applications a
                     JOIN jobs j ON j.job_id = a.job_id
                     SET a.status = 'Hired'
                     WHERE a.application_id = ?
                     AND j.recruiter_id = ?`,
                    [interview.application_id, recruiterId]
                );
            }

            await connection.commit();

            res.json({
                success: true,
                message: hired
                    ? 'Interview completed and candidate marked as hired.'
                    : 'Interview status updated successfully.'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Update interview status error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update interview status.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

/* ========================================
   JOB SEEKER - NOTIFICATION APIs
======================================== */

// Get all notifications for logged-in Job Seeker
app.get(
    '/api/candidate/notifications',
    verifyToken,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            // Confirm Job Seeker account
            const [users] = await db.query(
                `SELECT user_id
                 FROM users
                 WHERE user_id = ? AND role = 'job_seeker'`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Only Job Seekers can access notifications.'
                });
            }

            const [notifications] = await db.query(
                `SELECT
                    n.notification_id,
                    n.title,
                    n.message,
                    n.notification_type,
                    n.is_read,
                    n.created_at,

                    i.interview_id,
                    i.candidate_name,
                    i.job_title,
                    i.interview_date,
                    i.interview_time,
                    i.interview_type,
                    i.interviewer,
                    i.meeting_link,
                    i.location,
                    i.status AS interview_status

                 FROM notifications n

                 LEFT JOIN interviews i
                    ON n.interview_id = i.interview_id

                 WHERE n.user_id = ?

                 ORDER BY n.created_at DESC`,
                [userId]
            );

            const unreadCount = notifications.filter(
                notification => !notification.is_read
            ).length;

            res.json({
                success: true,
                unreadCount,
                count: notifications.length,
                notifications
            });

        } catch (error) {
            console.error('Fetch notifications error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications.'
            });
        }
    }
);


// Mark one notification as read
app.patch(
    '/api/candidate/notifications/:id/read',
    verifyToken,
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const notificationId = Number(req.params.id);

            if (!Number.isInteger(notificationId) || notificationId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid notification ID.'
                });
            }

            const [result] = await db.query(
                `UPDATE notifications n
                 JOIN users u ON u.user_id = n.user_id
                 SET n.is_read = TRUE
                 WHERE n.notification_id = ?
                 AND n.user_id = ?
                 AND u.role = 'job_seeker'`,
                [notificationId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found.'
                });
            }

            res.json({
                success: true,
                message: 'Notification marked as read.'
            });

        } catch (error) {
            console.error('Mark notification read error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update notification.'
            });
        }
    }
);


// Mark all notifications as read
app.patch(
    '/api/candidate/notifications/read-all',
    verifyToken,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const [result] = await db.query(
                `UPDATE notifications n
                 JOIN users u ON u.user_id = n.user_id
                 SET n.is_read = TRUE
                 WHERE n.user_id = ?
                 AND u.role = 'job_seeker'
                 AND n.is_read = FALSE`,
                [userId]
            );

            res.json({
                success: true,
                message: 'All notifications marked as read.',
                updatedCount: result.affectedRows
            });

        } catch (error) {
            console.error('Mark all notifications read error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update notifications.'
            });
        }
    }
);


// ========================================
// RECRUITER - ACCOUNT SETTINGS PROFILE
// ========================================

// GET recruiter account details
app.get(
    '/api/recruiter/settings/profile',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const [rows] = await db.query(
                `SELECT
                    u.full_name,
                    u.email,
                    u.mobile,
                    rp.designation
                 FROM users u
                 JOIN recruiter_profiles rp
                    ON rp.user_id = u.user_id
                 WHERE u.user_id = ?`,
                [userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Recruiter profile not found.'
                });
            }

            res.json({
                success: true,
                profile: {
                    fullName: rows[0].full_name,
                    email: rows[0].email,
                    phone: rows[0].mobile || '',
                    designation: rows[0].designation || ''
                }
            });

        } catch (error) {
            console.error('Fetch settings error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to fetch recruiter details.'
            });
        }
    }
);


// UPDATE recruiter account details
app.put(
    '/api/recruiter/settings/profile',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        let connection;

        try {
            const userId = req.user.userId;

            const {
                fullName,
                email,
                phone,
                designation
            } = req.body;

            if (!fullName?.trim() || !email?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required.'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            // Check duplicate email
            const [existing] = await connection.query(
                `SELECT user_id
                 FROM users
                 WHERE email = ? AND user_id != ?`,
                [email.trim(), userId]
            );

            if (existing.length > 0) {
                await connection.rollback();

                return res.status(409).json({
                    success: false,
                    message: 'This email is already registered.'
                });
            }

            // Update user details
            await connection.query(
                `UPDATE users
                 SET full_name = ?,
                     email = ?,
                     mobile = ?
                 WHERE user_id = ?
                 AND role = 'recruiter'`,
                [
                    fullName.trim(),
                    email.trim(),
                    phone?.trim() || null,
                    userId
                ]
            );

            // Update recruiter designation
            await connection.query(
                `UPDATE recruiter_profiles
                 SET designation = ?
                 WHERE user_id = ?`,
                [
                    designation?.trim() || null,
                    userId
                ]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Account details updated successfully.'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            console.error('Update settings error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update account details.'
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);


// ========================================
// RECRUITER - CHANGE PASSWORD
// ========================================

app.put(
    '/api/recruiter/settings/password',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const {
                currentPassword,
                newPassword
            } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current and new passwords are required.'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must contain at least 8 characters.'
                });
            }

            // Get recruiter's existing password
            const [users] = await db.query(
                `SELECT password
                 FROM users
                 WHERE user_id = ? AND role = 'recruiter'`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Recruiter account not found.'
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                users[0].password
            );

            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect.'
                });
            }

            // Prevent reusing the current password
            const samePassword = await bcrypt.compare(
                newPassword,
                users[0].password
            );

            if (samePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password.'
                });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Save new password in MySQL
            await db.query(
                `UPDATE users
                 SET password = ?
                 WHERE user_id = ? AND role = 'recruiter'`,
                [hashedPassword, userId]
            );

            res.json({
                success: true,
                message: 'Password updated successfully.'
            });

        } catch (error) {
            console.error('Change password error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to update password.'
            });
        }
    }
);


// ========================================
// RECRUITER - REACTIVATE ACCOUNT
// ========================================

app.post('/api/recruiter/reactivate-account', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find recruiter account
        const [users] = await db.query(
            `SELECT user_id, full_name, email, password, role, account_status
             FROM users
             WHERE email = ? AND role = 'recruiter'`,
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check account status
        if (user.account_status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Your account is already active. Please log in.'
            });
        }

        // Reactivate recruiter account
        await db.query(
            `UPDATE users
             SET account_status = 'active'
             WHERE user_id = ? AND role = 'recruiter'`,
            [user.user_id]
        );

        // Generate fresh login token
        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Your recruiter account has been reactivated successfully!',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Account reactivation error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to reactivate your account.'
        });
    }
});


// ========================================
// RECRUITER - DEACTIVATE ACCOUNT
// ========================================

app.put(
    '/api/recruiter/deactivate-account',
    verifyToken,
    verifyRecruiter,
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter your current password.'
                });
            }

            // Get recruiter's current password
            const [users] = await db.query(
                `SELECT password
                 FROM users
                 WHERE user_id = ? AND role = 'recruiter'`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Recruiter account not found.'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(
                password,
                users[0].password
            );

            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect password.'
                });
            }

            // Deactivate account without deleting any records
            await db.query(
                `UPDATE users
                 SET account_status = 'inactive'
                 WHERE user_id = ? AND role = 'recruiter'`,
                [userId]
            );

            res.json({
                success: true,
                message: 'Your recruiter account has been deactivated successfully.'
            });

        } catch (error) {
            console.error('Account deactivation error:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to deactivate your account.'
            });
        }
    }
);

//start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});