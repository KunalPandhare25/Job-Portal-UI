
import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import PlanDetails from "../components/PlanDetails";

const plans = [
  {
    name: "Basic",
    duration: "1 Month",
    price: "₹2,499",
    features: [
      "1 Job Posting",
      "Basic Support",
      "Limited Visibility",
    ],
  },
  {
    name: "Standard",
    duration: "3 Months",
    price: "₹6,499",
    features: [
      "5 Job Postings",
      "Priority Support",
      "Increased Visibility",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    duration: "6 Months",
    price: "₹11,999",
    features: [
      "Unlimited Job Postings",
      "24/7 Support",
      "Maximum Visibility",
    ],
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen px-5 py-12 bg-gradient-to-br from-slate-950 via-[#21143d] to-slate-950">

      <div className="max-w-5xl mx-auto">

        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-purple-300 text-xs font-semibold tracking-[3px] mb-3">
            JOBIFY PRICING
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Choose Your Plan
          </h1>

          <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
            Flexible pricing plans designed to simplify your recruitment process.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          style={{ perspective: 1200 }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
                rotateX: 4,
                rotateY: index === 0 ? 4 : index === 2 ? -4 : 0,
                scale: 1.015,
              }}
              style={{
                transformStyle: "preserve-3d",
                transformPerspective: 1000,
              }}
              className={`relative flex flex-col rounded-xl p-6 bg-slate-900/90 border transition-shadow duration-300 ${
                plan.highlight
                  ? "border-purple-400 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                  : "border-white/10 hover:border-purple-400/50"
              }`}
            >

              {/* Popular Label */}
              {plan.highlight && (
                <div className="absolute -top-3 left-6 flex items-center gap-1 bg-purple-500 text-white text-[11px] font-semibold px-3 py-1 rounded-md">
                  <Sparkles size={12} />
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  {plan.name}
                </h2>

                <p className="text-gray-400 text-xs mt-1.5">
                  {plan.duration} subscription
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-white">
                  {plan.price}
                </p>

                <p className="text-gray-500 text-xs mt-1.5">
                  For {plan.duration}
                </p>
              </div>

              {/* Features */}
              <div className="border-t border-white/10 pt-5 mb-7 flex-1">

                <p className="text-xs font-semibold text-gray-300 mb-4">
                  What's included
                </p>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5"
                    >
                      <Check
                        size={15}
                        className="text-purple-400 shrink-0"
                      />

                      <span className="text-gray-300 text-xs">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Select Button */}
              <PlanDetails highlight={plan.highlight} />

            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-9">
          Choose the plan that best fits your recruitment requirements.
        </p>

      </div>
    </div>
  );
}
