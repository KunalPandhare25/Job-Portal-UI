import React from 'react';

// This component shows details of a pricing plan
export default function PlanDetails({ name, duration, price, features, highlight }) {
  return (
    <div
      className={`p-4 rounded-xl shadow-md border ${
        highlight ? 'border-purple-400' : 'border-gray-300'
      } bg-white hover:scale-105 transition duration-300`}
    >
      {/* Plan Name */}
      <h2 className="text-xl font-bold text-gray-800 mb-1">{name}</h2>

      {/* Duration */}
      <p className="text-sm text-gray-500 mb-2">{duration}</p>

      {/* Price */}
      <p className="text-3xl font-bold text-purple-700 mb-4">{price}</p>

      {/* Feature List */}
      <ul className="mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700 mb-2">
            {/* Checkmark Icon */}
            <svg
              className="w-4 h-4 text-purple-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 010 1.414L9 14.414 5.293 10.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Select Button */}
      <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
        Select Plan
      </button>
    </div>
  );
}
