
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
} from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#35145f] via-[#21183e] to-[#10172d] text-white px-5 py-16">

      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-purple-300 uppercase tracking-[4px] text-sm mb-3">
            Get in touch
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact <span className="text-purple-400">Us</span>
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto">
            Have a question, suggestion, or need assistance?
            We're here to help you make your hiring journey easier.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-10 items-stretch">

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Let's connect
            </h2>

            <p className="text-gray-300 leading-7 mb-10">
              Whether you're a job seeker looking for your next opportunity
              or a recruiter searching for the right talent, feel free to
              reach out to us.
            </p>

            <div className="space-y-7">

              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Mail className="text-purple-300" size={22} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email us</p>
                  <p className="font-medium">support@jobify.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Phone className="text-purple-300" size={22} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Call us</p>
                  <p className="font-medium">+91 XXXXX XXXXX</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <MapPin className="text-purple-300" size={22} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="font-medium">India</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Clock className="text-purple-300" size={22} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Working hours</p>
                  <p className="font-medium">Monday – Friday</p>
                </div>
              </div>

            </div>

            <div className="mt-12 p-5 rounded-xl bg-purple-500/10 border border-purple-400/20">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="text-purple-300" size={20} />
                <h3 className="font-semibold">We're here to help</h3>
              </div>
              <p className="text-gray-300 text-sm leading-6">
                Your feedback helps us improve Jobify and create a better
                experience for everyone.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Send us a message
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              Fill out the form and we'll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full bg-[#11182c]/80 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-purple-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#11182c]/80 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-purple-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                  className="w-full bg-[#11182c]/80 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-purple-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="5"
                  required
                  className="w-full bg-[#11182c]/80 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-purple-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1"
              >
                Send Message
                <Send size={18} />
              </button>

              {submitted && (
                <p className="text-green-400 text-center text-sm">
                  Your demo message has been submitted successfully!
                </p>
              )}

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
