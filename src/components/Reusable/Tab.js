'use client';
import { useState } from 'react';

const Tab = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div>
      <div className="flex space-x-4 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`py-2 px-4 text-sm font-medium ${activeTab === tab.name ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          activeTab === tab.name && <div key={tab.name}>{tab.content}</div>
        ))}
      </div>
    </div>
  );
};

export default Tab;