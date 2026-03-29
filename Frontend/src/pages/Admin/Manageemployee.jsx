import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageEmployee() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Employee",
    manager_id: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/users?role=EMPLOYEE",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/users?role=MANAGER",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setManagers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (editId !== null) {
        await axios.put(
          `http://localhost:5000/api/users/${editId}`,
          { ...form, role: "EMPLOYEE", manager_id: form.manager_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/users",
          { ...form, role: "EMPLOYEE", manager_id: form.manager_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      fetchEmployees();
      fetchManagers(); // Refetch managers after employee operation
      setForm({ name: "", email: "", role: "Employee", manager_id: "" });
      setEditId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e) => {
    setEditId(e.id);
    setForm({
      name: e.name,
      email: e.email,
      role: e.role,
      manager_id: e.manager_id || "",
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees();
      if (editId === id) {
        setEditId(null);
        setForm({ name: "", email: "", role: "Employee", manager_id: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewPassword = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/users/${id}/send-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert("New password sent to the employee's email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getManagerName = (manager_id) => {
    if (!manager_id) return null;
    const m = managers.find(
      (manager) => String(manager.id) === String(manager_id),
    );
    return m ? m.name : null;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">
          Employee Management
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editId !== null ? "Edit Employee" : "Add Employee"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Email
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Role
            </label>
            <input
              type="text"
              value="Employee"
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Manager
            </label>
            <select
              value={form.manager_id}
              onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700"
            >
              <option value="">— Select Manager —</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : editId !== null
                ? "Update"
                : "Add Employee"}
          </button>
          {editId !== null && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({
                  name: "",
                  email: "",
                  role: "Employee",
                  manager_id: "",
                });
              }}
              className="border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

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
              {["Name", "Email", "Role", "Manager", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left font-semibold text-gray-500 uppercase px-4 py-2 tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-gray-400 text-xs"
                >
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-gray-400 text-xs"
                >
                  No employees added yet.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {e.name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{e.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {e.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {getManagerName(e.manager_id) ? (
                      <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {getManagerName(e.manager_id)}
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
                      <button
                        onClick={() => handleSendNewPassword(e.id)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        Send New Password
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
