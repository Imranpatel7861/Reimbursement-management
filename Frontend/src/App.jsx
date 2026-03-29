import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import AdminLogin from './pages/Auth/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageManager from './pages/Admin/Managemanager'
import ManageDirector from './pages/Admin/Managedirector';
import Managemanager from './pages/Admin/Managemanager';
import ManageFinancer from './pages/Admin/ManageFinancer';
import ManageEmployee from './pages/Admin/Manageemployee';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import FinancerDashboard from './pages/Finance/FinanceDashboard'
import DirectorDashboard from './pages/Director/DirectorDashboard';
import ManagerDashboard from './pages/Manager/ManagerDashboard'
import SubmitExpense from './pages/Employee/SubmitExpense'
import ExpenseHistory from './pages/Employee/ExpenseHistory';
import PendingApprovals from './pages/Manager/PendingApprovals';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<AdminLogin />} />

      {/* {Admindashboard} */}
      <Route path="/admindashboard" element={<AdminDashboard />}>
  
        <Route index element={<Navigate to="director" replace />} />

        <Route path="director"  element={<ManageDirector/>} />
        <Route path="financer"  element={<ManageFinancer/>} />
        <Route path="manager"   element={<Managemanager />} />
        <Route path="employee"  element={<ManageEmployee/>} />
      </Route>
    
      
  {/* {Employeedashboard} */}
      <Route path="/Employeedashboard" element={<EmployeeDashboard />}>
  
        <Route index element={<Navigate to="submitexpense" replace />} />
          <Route path="submitexpense"  element={<SubmitExpense/>} />
            <Route path="expensehistory"  element={<ExpenseHistory/>} />
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
          <Route path="pendingapprovals"  element={<PendingApprovals/>} />
            {/*<Route path="expensehistory"  element={<ExpenseHistory/>} /> */}
</Route>

      
    </Routes>
    

  )
}


export default App