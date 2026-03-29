import { useState } from "react";

const initialEmployees = [
  { id: 1, name: "Karan Singh", email: "karan@company.com", password: "Emp@123", role: "Employee", managerId: "" },
  { id: 2, name: "Neha Joshi", email: "neha@company.com", password: "Emp@456", role: "Employee", managerId: "" },
];

export default function ManageEmployee() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee", managerId: "" });
  const [editId, setEditId] = useState(null);
  const [showPass, setShowPass] = useState({});

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return;
    if (editId !== null) {
      setEmployees(employees.map((e) => (e.id === editId ? { ...e, ...form } : e)));
      setEditId(null);
    } else {
      setEmployees([...employees, { ...form, id: Date.now() }]);
    }
    setForm({ name: "", email: "", password: "", role: "Employee", managerId: "" });
  };

  const handleEdit = (e) => {
    setEditId(e.id);
    setForm({ name: e.name, email: e.email, password: e.password, role: e.role, managerId: e.managerId || "" });
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter((e) => e.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ name: "", email: "", password: "", role: "Employee", managerId: "" });
    }
  };

  const getManagerName = (managerId) => {
    if (!managerId) return null;
    const m = employees.find((e) => String(e.id) === String(managerId));
    return m ? m.name : null;
  };

  // Dropdown options: exclude the employee being edited
  const managerOptions = employees.filter((e) => String(e.id) !== String(editId));

  return (
    <div className="p-4 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Employee Management</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editId !== null ? "Edit Employee" : "Add Employee"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input
              type="text"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
            <input
              type="text"
              value="Employee"
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Manager</label>
            <select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700"
            >
              <option value="">— Select Manager —</option>
              {managerOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
          >
            {editId !== null ? "Update" : "Add Employee"}
          </button>
          {editId !== null && (
            <button
              onClick={() => { setEditId(null); setForm({ name: "", email: "", password: "", role: "Employee", managerId: "" }); }}
              className="border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Employees</h2>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {employees.length} total
          </span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Password", "Role", "Manager", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold text-gray-500 uppercase px-4 py-2 tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                  No employees added yet.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{e.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{e.email}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>{showPass[e.id] ? e.password : "••••••••"}</span>
                      <button
                        onClick={() => setShowPass((p) => ({ ...p, [e.id]: !p[e.id] }))}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPass[e.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {e.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {getManagerName(e.managerId) ? (
                      <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {getManagerName(e.managerId)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}