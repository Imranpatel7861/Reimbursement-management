import { useState } from "react";

const initialFinancers = [
  { id: 1, name: "Vivek Gupta", email: "vivek@company.com", password: "Fin@123", role: "Financer" },
  { id: 2, name: "Pooja Shah", email: "pooja@company.com", password: "Fin@456", role: "Financer" },
];

export default function ManageFinancer() {
  const [financers, setFinancers] = useState(initialFinancers);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Financer" });
  const [editId, setEditId] = useState(null);
  const [showPass, setShowPass] = useState({});

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return;
    if (editId !== null) {
      setFinancers(financers.map((f) => (f.id === editId ? { ...f, ...form } : f)));
      setEditId(null);
    } else {
      setFinancers([...financers, { ...form, id: Date.now() }]);
    }
    setForm({ name: "", email: "", password: "", role: "Financer" });
  };

  const handleEdit = (f) => {
    setEditId(f.id);
    setForm({ name: f.name, email: f.email, password: f.password, role: f.role });
  };

  const handleDelete = (id) => {
    setFinancers(financers.filter((f) => f.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ name: "", email: "", password: "", role: "Financer" });
    }
  };

  return (
    <div className="p-4 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Financer Management</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editId !== null ? "Edit Financer" : "Add Financer"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input
              type="text"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
            <input
              type="text"
              value="Financer"
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
          >
            {editId !== null ? "Update" : "Add Financer"}
          </button>
          {editId !== null && (
            <button
              onClick={() => { setEditId(null); setForm({ name: "", email: "", password: "", role: "Financer" }); }}
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
          <h2 className="text-sm font-semibold text-gray-700">Financers</h2>
          <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {financers.length} total
          </span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Password", "Role", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold text-gray-500 uppercase px-4 py-2 tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {financers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-xs">
                  No financers added yet.
                </td>
              </tr>
            ) : (
              financers.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{f.email}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>{showPass[f.id] ? f.password : "••••••••"}</span>
                      <button
                        onClick={() => setShowPass((p) => ({ ...p, [f.id]: !p[f.id] }))}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPass[f.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {f.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(f)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
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