import React from "react";

const AnalyticsCard = ({ title, value }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className="text-3xl font-bold text-white mt-2">{value}</h2>
    </div>
  );
};

export default AnalyticsCard;
