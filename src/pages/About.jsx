
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Eye, Users, BriefcaseBusiness, Search,
  Building2, UserCheck, ArrowRight, CheckCircle2
} from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 }
};

function TiltCard({ children, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      transition={{ duration: 0.6 }}
      whileHover={{
        y: -10,
        rotateX: 3,
        rotateY: -3,
        scale: 1.025
      }}
      style={{ transformStyle: "preserve-3d" }}
      className={`group transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(139,92,246,0.18)] ${className}`}
    >
      <div style={{ transform: "translateZ(18px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

function About() {
  const features = [
    {
      icon: Search,
      title: "Discover Jobs",
      description: "Find opportunities that match your interests and skills."
    },
    {
      icon: Building2,
      title: "Find Talent",
      description: "Help recruiters connect with suitable candidates."
    },
    {
      icon: BriefcaseBusiness,
      title: "Apply Easily",
      description: "Make job applications easier to manage."
    },
    {
      icon: Users,
      title: "Build Connections",
      description: "Bring job seekers and companies together."
    }
  ];

  const steps = [
    ["01", "Create an Account", "Register as a job seeker or recruiter."],
    ["02", "Explore the Platform", "Discover jobs or create job postings."],
    ["03", "Connect", "Apply for jobs or review candidates."],
    ["04", "Move Forward", "Manage applications and interviews."]
  ];

  const benefits = {
    "For Job Seekers": [
      "Explore available job opportunities",
      "Filter jobs by skills and location",
      "Apply for suitable positions",
      "Track application status",
      "Stay informed about notifications"
    ],
    "For Recruiters": [
      "Create and manage job postings",
      "Review candidate applications",
      "Manage candidate selection",
      "Schedule and manage interviews",
      "Manage company information"
    ]
  };

  return (
    <div className="min-h-screen text-white overflow-hidden">

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-16 left-[12%] w-32 h-32 bg-purple-600/20 blur-3xl rounded-full pointer-events-none"
        />

        <motion.div
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-10 right-[12%] w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <p className="text-purple-300 font-semibold tracking-[0.3em] text-sm mb-5">
            ABOUT JOBIFY
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight max-w-5xl mx-auto">
            Connecting Talent With
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-400">
              Opportunity
            </span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mt-7 leading-relaxed">
            Jobify makes finding the right job and hiring the right talent
            simpler, smarter and more accessible.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-9">
            <Link
              to="/"
              className="bg-purple-600 hover:bg-purple-500 px-7 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30"
            >
              Explore Jobs <ArrowRight className="inline ml-2" size={18} />
            </Link>

            <Link
              to="/register"
              className="border border-purple-400/60 hover:border-purple-300 hover:bg-purple-500/10 px-7 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-gray-950/40 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ duration: 0.7 }}
          >
            <p className="text-purple-300 font-semibold text-sm mb-3">WHO WE ARE</p>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Making Recruitment More Accessible
            </h2>

            <p className="text-gray-300 leading-relaxed mb-5">
              Jobify connects people looking for career opportunities
              with organizations searching for the right talent.
            </p>

            <p className="text-gray-300 leading-relaxed">
              From discovering relevant jobs to managing applications
              and scheduling interviews, Jobify aims to simplify the
              recruitment journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4" style={{ perspective: 1000 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <TiltCard
                  key={feature.title}
                  className="bg-white/[0.05] border border-white/10 hover:border-purple-400/60 rounded-2xl p-5 md:p-7"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="text-purple-400 mb-5" size={30} />
                  </motion.div>

                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-14"
        >
          <p className="text-purple-300 font-semibold text-sm mb-3">OUR PURPOSE</p>
          <h2 className="text-3xl md:text-5xl font-bold">Our Mission & Vision</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8" style={{ perspective: 1000 }}>
          {[
            {
              icon: Target,
              title: "Our Mission",
              description: "To simplify the job search and recruitment process by providing an accessible platform where candidates can discover opportunities and recruiters can find talent."
            },
            {
              icon: Eye,
              title: "Our Vision",
              description: "To create a more connected employment experience where finding opportunities and discovering talent becomes simpler, more transparent and more efficient."
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <TiltCard
                key={item.title}
                className="bg-gradient-to-br from-purple-900/50 to-gray-900 border border-purple-400/20 hover:border-purple-400/60 rounded-2xl p-9"
              >
                <Icon className="text-purple-400 mb-6" size={38} />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* WHY JOBIFY */}
      <section className="bg-gray-950/40 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="text-center mb-14">
            <p className="text-purple-300 font-semibold text-sm mb-3">WHY JOBIFY</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Designed for Both Sides of Hiring
            </h2>
            <p className="text-gray-400 mt-5 max-w-2xl mx-auto">
              Useful tools for candidates and recruiters throughout the recruitment process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8" style={{ perspective: 1000 }}>
            {Object.entries(benefits).map(([title, items]) => (
              <TiltCard
                key={title}
                className="bg-white/[0.05] border border-white/10 hover:border-purple-400/60 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-7">
                  {title === "For Job Seekers" ? (
                    <UserCheck className="text-purple-400" size={32} />
                  ) : (
                    <BriefcaseBusiness className="text-purple-400" size={32} />
                  )}
                  <h3 className="text-2xl font-bold">{title}</h3>
                </div>

                {items.map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-5">
                    <CheckCircle2 className="text-purple-400 mt-0.5 shrink-0" size={18} />
                    <p className="text-gray-300 text-sm">{item}</p>
                  </div>
                ))}
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-purple-300 font-semibold text-sm mb-3">GETTING STARTED</p>
          <h2 className="text-3xl md:text-5xl font-bold">How Jobify Works</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: 1000 }}>
          {steps.map(([number, title, description]) => (
            <TiltCard
              key={number}
              className="bg-white/[0.05] border border-white/10 hover:border-purple-400/60 rounded-xl p-7"
            >
              <p className="text-purple-400 text-4xl font-bold mb-6">{number}</p>
              <h3 className="text-lg font-semibold mb-3">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-700 rounded-3xl p-10 md:p-16 text-center border border-purple-400/20"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-5">
              Your Next Opportunity Starts Here
            </h2>

            <p className="text-purple-100 max-w-xl mx-auto mb-9">
              Whether you are looking for your next career move or
              searching for the right candidate, Jobify is here to help.
            </p>

            <Link
              to="/"
              className="inline-flex items-center bg-white text-purple-800 font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 hover:-translate-y-1 transition-all duration-300"
            >
              Explore Opportunities <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

export default About;
