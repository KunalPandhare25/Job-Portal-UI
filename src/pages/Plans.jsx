import React from 'react';
import PlanDetails from '../components/PlanDetails';

const plans = [
  {
    name: 'Basic',
    duration: '1 Month',
    price: '₹2,499',
    features: ['1 Job Posting', 'Basic Support', 'Limited Visibility'],
  },
  {
    name: 'Standard',
    duration: '3 Months',
    price: '₹6,499',
    features: ['5 Job Postings', 'Priority Support', 'Increased Visibility'],
    highlight: true, // This will highlight the plan
  },
  {
    name: 'Premium',
    duration: '6 Months',
    price: '₹11,999',
    features: ['Unlimited Job Postings', '24/7 Support', 'Maximum Visibility'],
  },
];

export default function Plans() {
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
      }}
    >
      <h1 className="text-4xl font-bold text-white text-center mb-10">Choose Your Plan</h1>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanDetails key={plan.name} {...plan} /> // Passing plan data as props
        ))}
      </div>
    </div>
  );
}
