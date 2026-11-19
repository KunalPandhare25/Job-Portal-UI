
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Users, CheckCircle2, ArrowRight } from "lucide-react";

const RegisterChoice = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 60, rotateX: 12 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const cards = [
    {
      number: "01",
      title: "I'm a Job Seeker",
      description:
        "Discover job opportunities, create your professional profile, upload your resume and track applications.",
      features: [
        "Build your professional profile",
        "Showcase your education and skills",
        "Apply for jobs and internships",
        "Track your applications",
      ],
      button: "Register as Job Seeker",
      route: "/register/job-seeker",
      icon: Users,
    },
    {
      number: "02",
      title: "I'm a Recruiter",
      description:
        "Create your company profile, publish job openings and connect with talented candidates.",
      features: [
        "Create a company profile",
        "Post job openings",
        "Review candidate applications",
        "Manage your hiring process",
      ],
      button: "Register as Recruiter",
      route: "/register/recruiter",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-3 sm:px-5 md:px-8 py-10 sm:py-12 md:py-16 text-white"
      style={{
        background: "linear-gradient(120deg, #0f172a, #35145f, #581c87, #0f172a)",
        backgroundSize: "300% 300%",
        animation: "registerGradient 12s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes registerGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* Background glow */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 blur-[110px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, -40, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-5xl">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <p className="text-purple-300 uppercase tracking-[4px] text-sm mb-3">
            Get started with Jobify
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Join <span className="text-purple-300">Jobify</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">
            Choose how you want to use Jobify
          </p>
        </motion.div>

        {/* Registration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">

          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.number}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.2 }}
                whileHover={{
                  y: -12,
                  rotateX: 5,
                  rotateY: index === 0 ? -5 : 5,
                  scale: 1.025,
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformPerspective: 1200,
                  transformStyle: "preserve-3d",
                }}
                className="group relative min-w-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-white/10 hover:border-purple-400/60 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-purple-500/20 transition-colors duration-300"
              >
                {/* Card glow */}
                <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-hover:bg-purple-500/[0.06] transition-colors duration-500 pointer-events-none" />

                <div className="relative z-10">

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-bold text-purple-400/80">
                      {card.number}
                    </span>

                    <motion.div
                      whileHover={{ rotateY: 180, scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 bg-purple-500/15 border border-purple-400/20 rounded-xl"
                    >
                      <Icon size={30} className="text-purple-300" />
                    </motion.div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-semibold mb-2 break-words">
                    {card.title}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-300 leading-6 sm:leading-7 mb-5 sm:mb-7">
                    {card.description}
                  </p>

                  <div className="space-y-3 mb-6 sm:mb-8">
                    {card.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.5 + index * 0.2 + featureIndex * 0.1,
                        }}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300"
                      >
                        <CheckCircle2
                          size={17}
                          className="text-purple-400 shrink-0"
                        />
                        {feature}
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(card.route)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors duration-300 shadow-lg shadow-purple-900/30"
                  >
                    {card.button}
                    <ArrowRight size={18} />
                  </motion.button>

                </div>
              </motion.div>
            );
          })}

        </div>

        {/* Login */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-300 mt-10"
        >
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-300 font-semibold hover:text-white hover:underline transition"
          >
            Login
          </button>
        </motion.p>

      </div>
    </div>
  );
};

export default RegisterChoice;
