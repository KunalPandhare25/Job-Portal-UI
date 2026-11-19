
import React, { useEffect, useState } from 'react';
import { API_URL } from "../../config";

const initialFormData = {
  companyName: '',
  website: '',
  industry: '',
  companySize: '',
  location: '',
  email: '',
  phone: '',
  about: '',
  linkedin: '',
  twitter: '',
};

const CompanyProfile = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [savedLogoPath, setSavedLogoPath] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Please login as a recruiter.');
        }

        const response = await fetch(
          `${API_URL}/api/recruiter/company-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load company profile.');
        }

        if (data.profile) {
          const profile = data.profile;

          setFormData({
            companyName: profile.company_name || '',
            website: profile.company_website || '',
            industry: profile.industry || '',
            companySize: profile.company_size || '',
            location: profile.location || '',
            email: profile.email || '',
            phone: profile.phone || '',
            about: profile.about || '',
            linkedin: profile.linkedin || '',
            twitter: profile.twitter || '',
          });

          if (profile.company_logo) {
            setSavedLogoPath(profile.company_logo);

            setLogoPreview(
              profile.company_logo.startsWith('http')
                ? profile.company_logo
                : `${API_URL}/${profile.company_logo.replace(/^\/+/, '')}`
            );
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Select company logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please select a PNG, JPG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo size must be less than 2 MB.');
      e.target.value = '';
      return;
    }

    setError('');
    setSuccess('');
    setLogo(file);

    setLogoPreview(URL.createObjectURL(file));
  };

  // Save company profile and upload logo
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login as a recruiter.');
      }

      let logoPath = savedLogoPath;

      // Upload new logo if selected
      if (logo) {
        const uploadData = new FormData();
        uploadData.append('logo', logo);

        const uploadResponse = await fetch(
          `${API_URL}/api/recruiter/company-logo`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.message || 'Company logo upload failed.'
          );
        }

        logoPath = uploadResult.logo;
        setSavedLogoPath(logoPath);
        setLogo(null);
      }

      // Save company details while preserving the logo path
      const response = await fetch(
        `${API_URL}/api/recruiter/company-profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            companyLogo: logoPath,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to save company profile.'
        );
      }

      setSuccess('Company profile saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500';

  const labelClass =
    'block text-sm text-gray-300 mb-2 font-medium';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">

      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-gray-400 mt-2">
          Manage your company information and public profile.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl w-full mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-8"
      >

        {/* Company Logo */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            Company Branding
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500 text-sm">Logo</span>
              )}
            </div>

            <div>
              <label className={labelClass}>Upload Company Logo</label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />

              <p className="text-gray-500 text-xs mt-2">
                PNG, JPG or WEBP. Maximum 2 MB.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-800" />

        {/* Basic Information */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>Company Name *</label>
              <input
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select industry</option>
                <option>Information Technology</option>
                <option>Software Development</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Manufacturing</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select company size</option>
                <option>1-10 Employees</option>
                <option>11-50 Employees</option>
                <option>51-200 Employees</option>
                <option>201-500 Employees</option>
                <option>501-1000 Employees</option>
                <option>1000+ Employees</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Company Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Goa, India"
                className={inputClass}
              />
            </div>

          </div>
        </section>

        <div className="border-t border-gray-800" />

        {/* Contact Information */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hr@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={inputClass}
              />
            </div>

          </div>
        </section>

        <div className="border-t border-gray-800" />

        {/* About Company */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            About Company
          </h2>

          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="5"
            placeholder="Tell candidates about your company, culture and mission..."
            className={inputClass}
          />
        </section>

        <div className="border-t border-gray-800" />

        {/* Social Links */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            Social Media Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Twitter / X</label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://x.com/..."
                className={inputClass}
              />
            </div>

          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-400 text-sm">{success}</p>
        )}

        <div className="flex flex-wrap gap-4 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-7 py-3 rounded-lg font-medium transition"
          >
            {saving ? 'Saving...' : 'Save Company Profile'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setLogo(null);
              setLogoPreview('');
              setSuccess('');
              setError('');
            }}
            className="bg-gray-800 hover:bg-gray-700 px-7 py-3 rounded-lg font-medium transition"
          >
            Clear Form
          </button>
        </div>

      </form>
    </div>
  );
};

export default CompanyProfile;
