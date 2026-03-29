import { useState } from "react";
import ManageDirector from "./Managedirector";
import ManageManager from "./Managemanager";
import ManageFinance from "./ManageFinancer";
import ManageEmployee from "./Manageemployee";

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("DIRECTOR");

  const tabs = [
    { label: "Directors", value: "DIRECTOR" },
    { label: "Managers", value: "MANAGER" },
    { label: "Finance", value: "FINANCE" },
    { label: "Employees", value: "EMPLOYEE" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">User Management</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === tab.value
                ? "bg-purple-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "DIRECTOR" && <ManageDirector />}
      {activeTab === "MANAGER" && <ManageManager />}
      {activeTab === "FINANCE" && <ManageFinance />}
      {activeTab === "EMPLOYEE" && <ManageEmployee />}
    </div>
  );
}
