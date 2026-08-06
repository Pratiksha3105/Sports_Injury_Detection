import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="animate-fade-up min-w-0 flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
