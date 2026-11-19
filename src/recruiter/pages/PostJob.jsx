import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';

const PostJob = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const [editingJobId, setEditingJobId] = useState(
        searchParams.get('edit')
    );

    const [isLoadingJob, setIsLoadingJob] = useState(false);

    // Job form state
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        workplaceType: 'On-site',
        employmentType: 'Full-time',
        experience: '',
        salaryMin: '',
        salaryMax: '',
        description: '',
        responsibilities: '',
        skills: '',
        deadline: '',
    });

    // Application question states
    const [askQuestions, setAskQuestions] = useState(false);
    const [applicationQuestions, setApplicationQuestions] = useState([]);

    const [customQuestion, setCustomQuestion] = useState({
        question_text: '',
        question_type: 'short_answer',
        is_required: false,
        options: [],
    });

    // Existing states
    const [optionsText, setOptionsText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (!editingJobId) return;

        const loadDraft = async () => {
            try {
                setIsLoadingJob(true);
                setError('');

                const token = localStorage.getItem('token');

                const response = await fetch(
                    `${API_URL}/api/recruiter/jobs/${editingJobId}/details`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load draft.');
                }

                const job = data.job;
                const questions = job.applicationQuestions || [];

                setFormData({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    workplaceType: job.workplaceType || 'On-site',
                    employmentType: job.employmentType || 'Full-time',
                    experience: job.experience || '',
                    salaryMin: job.salaryMin ?? '',
                    salaryMax: job.salaryMax ?? '',
                    description: job.description || '',
                    responsibilities: (job.responsibilities || []).join('\n'),
                    skills: (job.skills || []).join(', '),
                    deadline: job.deadline
                        ? String(job.deadline).slice(0, 10)
                        : ''
                });

                setApplicationQuestions(questions);
                setAskQuestions(questions.length > 0);

                setSuccess('Draft loaded successfully. You can now edit it.');

            } catch (error) {
                console.error('Load draft error:', error);
                setError(error.message);
            } finally {
                setIsLoadingJob(false);
            }
        };

        loadDraft();
    }, [editingJobId]);


    // Basic question library
    const basicQuestions = [
        {
            question_text: 'Why are you interested in this position?',
            question_type: 'long_answer',
        },
        {
            question_text: 'What is your notice period?',
            question_type: 'multiple_choice',
            options: ['Immediate', '15 days', '30 days', '60 days', '90 days'],
        },
        {
            question_text: 'What is your expected CTC?',
            question_type: 'number',
        },
        {
            question_text: 'Are you willing to relocate?',
            question_type: 'yes_no',
        },
        {
            question_text: 'When can you join?',
            question_type: 'short_answer',
        },
        {
            question_text: 'Do you have relevant work experience?',
            question_type: 'yes_no',
        },
    ];

    // Reset application question settings
    const resetQuestions = () => {
        setAskQuestions(false);
        setApplicationQuestions([]);

        setCustomQuestion({
            question_text: '',
            question_type: 'short_answer',
            is_required: false,
            options: [],
        });

        setOptionsText('');
    };

    // Handle job form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Select or deselect a basic question
    const toggleBasicQuestion = (question) => {
        setApplicationQuestions((prev) => {
            const exists = prev.some(
                (item) => item.question_text === question.question_text
            );

            if (exists) {
                return prev.filter(
                    (item) => item.question_text !== question.question_text
                );
            }

            return [
                ...prev,
                {
                    ...question,
                    is_required: false,
                    options: question.options || [],
                },
            ];
        });
    };

    // Add custom question


    const addCustomQuestion = () => {
        if (!customQuestion.question_text.trim()) {
            setError('Please enter your custom question.');
            return;
        }

        const needsOptions = [
            'multiple_choice',
            'checkboxes',
            'dropdown',
        ].includes(customQuestion.question_type);

        // Convert multiline text into individual options
        const parsedOptions = optionsText
            .split('\n')
            .map((option) => option.trim())
            .filter(Boolean);

        // Validate answer options
        if (needsOptions && parsedOptions.length < 2) {
            setError('Please add at least two answer options.');
            return;
        }

        // Add custom question
        setApplicationQuestions((prev) => [
            ...prev,
            {
                ...customQuestion,
                question_text: customQuestion.question_text.trim(),
                options: needsOptions ? parsedOptions : [],
            },
        ]);

        // Reset custom question form
        setCustomQuestion({
            question_text: '',
            question_type: 'short_answer',
            is_required: false,
            options: [],
        });

        setOptionsText('');
        setError('');
    };

    // Remove selected question
    const removeQuestion = (index) => {
        setApplicationQuestions((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // Update selected question
    const updateQuestion = (index, field, value) => {
        setApplicationQuestions((prev) =>
            prev.map((question, i) =>
                i === index
                    ? { ...question, [field]: value }
                    : question
            )
        );
    };


    // Publish job
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        // Validate required fields
        if (
            !formData.title.trim() ||
            !formData.company.trim() ||
            !formData.location.trim() ||
            !formData.experience ||
            !formData.description.trim() ||
            !formData.skills.trim()
        ) {
            setError('Please complete all required fields.');
            return;
        }

        // Validate salary
        if (
            formData.salaryMin &&
            formData.salaryMax &&
            Number(formData.salaryMin) > Number(formData.salaryMax)
        ) {
            setError(
                'Minimum salary cannot be greater than maximum salary.'
            );
            return;
        }

        // Validate application questions
        if (askQuestions) {
            for (const question of applicationQuestions) {
                if (
                    ['multiple_choice', 'checkboxes', 'dropdown'].includes(
                        question.question_type
                    ) &&
                    (!question.options || question.options.length < 2)
                ) {
                    setError(
                        `Please provide at least two options for: ${question.question_text}`
                    );
                    return;
                }
            }
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Please login as a recruiter before posting a job.');
            return;
        }

        const skillsArray = formData.skills
            .split(',')
            .map(skill => skill.trim())
            .filter(Boolean);

        const responsibilitiesArray = formData.responsibilities
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean);

        const jobData = {
            ...formData,
            skills: skillsArray,
            responsibilities: responsibilitiesArray,
            status: 'Active',
            askQuestions,
            applicationQuestions: askQuestions
                ? applicationQuestions
                : [],
        };

        try {
            setIsSubmitting(true);

            const response = await fetch(
                editingJobId
                     ? `${API_URL}/api/recruiter/jobs/${editingJobId}`
                     : `${API_URL}/api/recruiter/jobs`,
                {
                    method: editingJobId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(jobData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to publish job.'
                );
            }

            setSuccess(
                editingJobId
                    ? 'Draft published successfully!'
                    : `Job published successfully! Job ID: ${data.jobId}`
            );

            // Reset form after successful publishing
            setFormData({
                title: '',
                company: '',
                location: '',
                workplaceType: 'On-site',
                employmentType: 'Full-time',
                experience: '',
                salaryMin: '',
                salaryMax: '',
                description: '',
                responsibilities: '',
                skills: '',
                deadline: '',
            });

            resetQuestions();

            setEditingJobId(null);
            setSearchParams({});

        } catch (err) {
            console.error('Publish job error:', err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save job as Draft
    const handleSaveDraft = async () => {
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Please login as a recruiter.');
            return;
        }

        // Convert textareas into arrays
        const skillsArray = formData.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);

        const responsibilitiesArray = formData.responsibilities
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        const jobData = {
            ...formData,
            skills: skillsArray,
            responsibilities: responsibilitiesArray,
            status: 'Draft',
            askQuestions,
            applicationQuestions: askQuestions
                ? applicationQuestions
                : [],
        };

        try {
            setIsSubmitting(true);


            const response = await fetch(
                editingJobId
                    ? `${API_URL}/api/recruiter/jobs/${editingJobId}`
                    : `${API_URL}/api/recruiter/jobs`,
                {
                    method: editingJobId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(jobData),
                }
            );


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save draft.');
            }

            if (!editingJobId && data.jobId) {
                setEditingJobId(String(data.jobId));
                setSearchParams({ edit: String(data.jobId) });
            }

            setSuccess(
                editingJobId
                    ? 'Draft updated successfully!'
                    : `Draft saved successfully! Job ID: ${data.jobId}`
            );

        } catch (err) {
            setError(err.message || 'Failed to save draft.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear entire form
    const handleClearForm = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            workplaceType: 'On-site',
            employmentType: 'Full-time',
            experience: '',
            salaryMin: '',
            salaryMax: '',
            description: '',
            responsibilities: '',
            skills: '',
            deadline: '',
        });

        resetQuestions();
        setError('');
        setSuccess('');
    };

    const inputClass =
        'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500';

    const labelClass =
        'block text-sm text-gray-300 mb-2 font-medium';

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">

            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <h1 className="text-3xl font-bold">
                    {editingJobId ? 'Edit Draft Job' : 'Post a Job'}
                </h1>
                <p className="text-gray-400 mt-2">
                    {editingJobId
                        ? 'Update your saved job details or publish this draft.'
                        : 'Create a new job opening and find the right candidates.'}
                </p>
            </div>

            {/* Job Form */}
            <form
                onSubmit={handleSubmit}
                className="max-w-5xl w-full mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-7"
            >

                {/* Basic Information */}
                <section>
                    <h2 className="text-xl font-semibold mb-5">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className={labelClass}>Job Title *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Frontend Developer"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Company Name *</label>
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Job Location *</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Bengaluru, India"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Workplace Type</label>
                            <select
                                name="workplaceType"
                                value={formData.workplaceType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option>On-site</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Employment Type</label>
                            <select
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Internship</option>
                                <option>Contract</option>
                                <option>Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Experience Required *
                            </label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">Select experience</option>
                                <option>Fresher</option>
                                <option>0-1 Years</option>
                                <option>1-3 Years</option>
                                <option>3-5 Years</option>
                                <option>5+ Years</option>
                            </select>
                        </div>

                    </div>
                </section>

                <div className="border-t border-gray-800" />

                {/* Salary Details */}
                <section>
                    <h2 className="text-xl font-semibold mb-5">
                        Salary Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className={labelClass}>
                                Minimum Salary (₹ / year)
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="salaryMin"
                                value={formData.salaryMin}
                                onChange={handleChange}
                                placeholder="e.g. 300000"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Maximum Salary (₹ / year)
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={handleChange}
                                placeholder="e.g. 600000"
                                className={inputClass}
                            />
                        </div>

                    </div>
                </section>

                <div className="border-t border-gray-800" />

                {/* Job Description */}
                <section>
                    <h2 className="text-xl font-semibold mb-5">
                        Job Description
                    </h2>

                    <div className="space-y-5">

                        <div>
                            <label className={labelClass}>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe the job role and expectations..."
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Responsibilities</label>
                            <textarea
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter each responsibility on a new line..."
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Required Skills *</label>
                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                rows="3"
                                placeholder="e.g. React.js, JavaScript, HTML, CSS"
                                className={inputClass}
                            />
                            <p className="text-gray-500 text-xs mt-2">
                                Separate skills using commas.
                            </p>
                        </div>

                    </div>
                </section>

                <div className="border-t border-gray-800" />

                {/* Application Questions */}
                <section>
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold">
                            Application Questions
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                (Optional)
                            </span>
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Choose additional questions candidates should answer when applying.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
                        <input
                            type="checkbox"
                            checked={askQuestions}
                            onChange={(e) => {
                                setAskQuestions(e.target.checked);
                                setError('');
                            }}
                            className="h-4 w-4 accent-purple-600"
                        />
                        <div>
                            <p className="font-medium text-white">
                                Ask candidates additional questions
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Enable this to select basic questions or add your own.
                            </p>
                        </div>
                    </label>

                    {askQuestions && (
                        <div className="mt-6 space-y-6">

                            {/* Basic Question Library */}
                            <div>
                                <h3 className="mb-3 font-semibold text-white">
                                    Basic Question Library
                                </h3>
                                <p className="mb-4 text-xs text-gray-400">
                                    Select only the questions relevant to this job.
                                </p>

                                <div className="space-y-3">
                                    {basicQuestions.map((question, index) => {
                                        const selected = applicationQuestions.some(
                                            (item) =>
                                                item.question_text === question.question_text
                                        );

                                        return (
                                            <label
                                                key={index}
                                                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 transition hover:border-purple-500"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() =>
                                                        toggleBasicQuestion(question)
                                                    }
                                                    className="mt-1 h-4 w-4 accent-purple-600"
                                                />

                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {question.question_text}
                                                    </p>
                                                    <p className="mt-1 text-xs capitalize text-gray-400">
                                                        {question.question_type.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Question */}
                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="mb-4 font-semibold text-white">
                                    Add Your Own Question
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>
                                            Question
                                        </label>
                                        <textarea
                                            value={customQuestion.question_text}
                                            onChange={(e) =>
                                                setCustomQuestion((prev) => ({
                                                    ...prev,
                                                    question_text: e.target.value,
                                                }))
                                            }
                                            rows="3"
                                            placeholder="e.g. Describe your experience with React.js."
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Answer Type
                                        </label>
                                        <select
                                            value={customQuestion.question_type}
                                            onChange={(e) =>
                                                setCustomQuestion((prev) => ({
                                                    ...prev,
                                                    question_type: e.target.value,
                                                    options: [],
                                                }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="short_answer">Short Answer</option>
                                            <option value="long_answer">Long Answer</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                            <option value="checkboxes">Checkboxes</option>
                                            <option value="dropdown">Dropdown</option>
                                            <option value="number">Number</option>
                                            <option value="yes_no">Yes / No</option>
                                        </select>
                                    </div>

                                    {[
                                        'multiple_choice',
                                        'checkboxes',
                                        'dropdown',
                                    ].includes(customQuestion.question_type) && (
                                            <div>
                                                <label className={labelClass}>
                                                    Answer Options
                                                </label>

                                                <textarea
                                                    rows="3"
                                                    value={optionsText}
                                                    onChange={(e) => setOptionsText(e.target.value)}
                                                    placeholder={'Enter one option per line\nOption 1\nOption 2\nOption 3'}
                                                    className={inputClass}
                                                />
                                            </div>
                                        )}

                                    <label className="flex items-center gap-3 text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={customQuestion.is_required}
                                            onChange={(e) =>
                                                setCustomQuestion((prev) => ({
                                                    ...prev,
                                                    is_required: e.target.checked,
                                                }))
                                            }
                                            className="h-4 w-4 accent-purple-600"
                                        />
                                        Make this question required
                                    </label>

                                    <button
                                        type="button"
                                        onClick={addCustomQuestion}
                                        className="bg-purple-600 hover:bg-purple-700 px-7 py-3 rounded-lg font-medium text-white transition"
                                    >
                                        + Add Custom Question
                                    </button>
                                </div>
                            </div>

                            {/* Selected Questions */}
                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="mb-3 font-semibold text-white">
                                    Selected Questions ({applicationQuestions.length})
                                </h3>

                                {applicationQuestions.length === 0 ? (
                                    <p className="rounded-lg bg-gray-800 p-4 text-sm text-gray-400">
                                        No questions selected yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {applicationQuestions.map((question, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">
                                                            {index + 1}. {question.question_text}
                                                        </p>
                                                        <p className="mt-1 text-xs capitalize text-gray-400">
                                                            {question.question_type.replace('_', ' ')}
                                                        </p>

                                                        {question.options?.length > 0 && (
                                                            <p className="mt-2 text-xs text-gray-400">
                                                                Options: {question.options.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(index)}
                                                        className="text-sm font-medium text-red-400 hover:text-red-300"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <label className="mt-4 flex items-center gap-2 text-xs text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={question.is_required}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                index,
                                                                'is_required',
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="h-4 w-4 accent-purple-600"
                                                    />
                                                    Required question
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <div className="border-t border-gray-800" />

                {/* Application Deadline */}
                <section>
                    <h2 className="text-xl font-semibold mb-5">
                        Application Deadline
                    </h2>

                    <div className="max-w-md">
                        <label className={labelClass}>
                            Last Date to Apply
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.deadline}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>
                </section>

                {/* Messages */}
                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                {success && (
                    <p className="text-green-400 text-sm">{success}</p>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">

                    <div className="flex flex-col sm:flex-row gap-4">

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-7 py-3 rounded-lg font-medium transition"
                        >
                            {isSubmitting
                                ? 'Publishing...'
                                : editingJobId
                                    ? 'Update & Publish Job'
                                    : 'Publish Job'}
                        </button>

                        <button
                            type="button"
                            onClick={handleClearForm}
                            className="bg-gray-800 hover:bg-gray-700 px-7 py-3 rounded-lg font-medium transition"
                        >
                            Clear Form
                        </button>

                    </div>

                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                        className="bg-gray-800 border border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white disabled:opacity-50 px-7 py-3 rounded-lg font-medium transition"
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : editingJobId
                                ? 'Update Draft'
                                : 'Save as Draft'}
                    </button>

                </div>

            </form>
        </div>
    );
};

export default PostJob;