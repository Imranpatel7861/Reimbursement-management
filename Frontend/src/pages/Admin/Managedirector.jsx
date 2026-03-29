import { useState } from "react";

const initialDirectors = [
  { id: 1, name: "Amit Verma", email: "amit@company.com", password: "Dir@123", role: "Director" },
  { id: 2, name: "Sunita Rao", email: "sunita@company.com", password: "Dir@456", role: "Director" },
];

export default function ManageDirector() {
  const [directors, setDirectors] = useState(initialDirectors);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Director" });
  const [editId, setEditId] = useState(null);
  const [showPass, setShowPass] = useState({});

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return;
    if (editId !== null) {
      setDirectors(directors.map((d) => (d.id === editId ? { ...d, ...form } : d)));
      setEditId(null);
    } else {
      setDirectors([...directors, { ...form, id: Date.now() }]);
    }
    setForm({ name: "", email: "", password: "", role: "Director" });
  };

  const handleEdit = (d) => {
    setEditId(d.id);
    setForm({ name: d.name, email: d.email, password: d.password, role: d.role });
  };

  const handleDelete = (id) => {
    setDirectors(directors.filter((d) => d.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ name: "", email: "", password: "", role: "Director" });
    }
  };

  return (
    <div className="p-4 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Director Management</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editId !== null ? "Edit Director" : "Add Director"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input
              type="text"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
            <input
              type="text"
              value="Director"
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
          >
            {editId !== null ? "Update" : "Add Director"}
          </button>
          {editId !== null && (
            <button
              onClick={() => { setEditId(null); setForm({ name: "", email: "", password: "", role: "Director" }); }}
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
          <h2 className="text-sm font-semibold text-gray-700">Directors</h2>
          <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {directors.length} total
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
            {directors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-xs">
                  No directors added yet.
                </td>
              </tr>
            ) : (
              directors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{d.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{d.email}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>{showPass[d.id] ? d.password : "••••••••"}</span>
                      <button
                        onClick={() => setShowPass((p) => ({ ...p, [d.id]: !p[d.id] }))}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPass[d.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-purple-50 text-purple-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {d.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(d)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
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