import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AdminLogin from "./pages/Auth/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import FinancerDashboard from "./pages/Finance/FinanceDashboard";
import DirectorDashboard from "./pages/Director/DirectorDashboard";
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import SubmitExpense from "./pages/Employee/SubmitExpense";
import ExpenseHistory from "./pages/Employee/ExpenseHistory";
import PendingApprovals from "./pages/Manager/PendingApprovals";
import ManageUsers from "./pages/Admin/ManageUsers";
import ApprovalConfig from "./pages/Admin/ApprovalConfig";
import History from "./pages/Manager/ManagerHistory";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<AdminLogin />} />

      {/* {Admindashboard} */}
      <Route path="/admindashboard" element={<AdminDashboard />}>
        <Route index element={<Navigate to="users" replace />} />

        <Route path="users" element={<ManageUsers />} />
        <Route path="approval-config" element={<ApprovalConfig />} />
      </Route>

      {/* {Employeedashboard} */}
      <Route path="/Employeedashboard" element={<EmployeeDashboard />}>
        <Route index element={<Navigate to="submitexpense" replace />} />
        <Route path="submitexpense" element={<SubmitExpense />} />
        <Route path="expensehistory" element={<ExpenseHistory />} />
      </Route>

      {/* {Financerdashboard} */}
      <Route path="/Financerdashboard" element={<FinancerDashboard />}>
        {/* <Route index element={<Navigate to="director" replace />} /> */}
      </Route>

      {/* {Directordashboard} */}
      <Route path="/Directordashboard" element={<DirectorDashboard />}>
        {/* <Route index element={<Navigate to="director" replace />} /> */}
      </Route>

      {/* {Managerdashboard} */}
      <Route path="/Managerdashboard" element={<ManagerDashboard />}>
        <Route index element={<Navigate to="pendingapprovals" replace />} />
        <Route path="pendingapprovals" element={<PendingApprovals />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}

export default App;
