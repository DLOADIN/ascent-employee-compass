
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppContext } from "@/context/AppContext";
import { Navigate } from "react-router-dom";

// Import recharts components with proper casing for JSX
import {
  PieChart, Pie, Tooltip as RechartsTooltip,
  CartesianGrid, XAxis, YAxis, Bar, BarChart
} from 'recharts';

// This component ensures that we have the proper chart components available globally
const ChartsRegistry = () => {
  // Component is not rendered, just ensuring the imports are available
  return null;
}

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
      {/* Register chart components */}
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
