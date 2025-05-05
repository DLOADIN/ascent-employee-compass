
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppContext } from "@/context/AppContext";
import { Navigate } from "react-router-dom";

// Import recharts components with proper casing
import {
  PieChart, Pie, Tooltip as RechartsTooltip,
  CartesianGrid, XAxis, YAxis, Bar, BarChart
} from 'recharts';

// This component ensures that the chart components are registered globally
const ChartsRegistry = () => {
  return (
    <div className="hidden">
      <PieChart width={100} height={100}>
        <Pie data={[]} dataKey="value" nameKey="name" cx="50%" cy="50%" />
        <RechartsTooltip />
      </PieChart>
      <BarChart width={100} height={100}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <RechartsTooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Register chart components - invisible but needed to fix JSX errors */}
      <ChartsRegistry />
      
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
