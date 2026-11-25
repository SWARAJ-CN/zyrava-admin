import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="app-bg min-h-screen">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-h-screen lg:pl-[260px]">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="page-enter mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
          <footer className="mt-10 flex flex-col gap-1 border-t border-white/[0.05] py-5 text-[10px] text-default-600 sm:flex-row sm:items-center sm:justify-between">
            <span>ZYRAVA Admin · analytics served by the existing zyrava-server</span>
            <span>MongoDB credentials never leave the backend</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
