import React from "react";
import { User } from "../types";
import { Smartphone, LogOut, Shield, History, Grid, LogIn } from "lucide-react";

interface NavbarProps {
  user: User | null;
  currentView: "catalog" | "bookings" | "admin";
  setView: (view: "catalog" | "bookings" | "admin") => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  user,
  currentView,
  setView,
  onLogout,
  onOpenAuth,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setView("catalog")}
          className="flex items-center gap-2 text-left focus:outline-none"
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <span className="font-sans text-lg font-bold tracking-tight text-gray-950">
              MobiBook
            </span>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              Phone Bookings
            </p>
          </div>
        </button>

        {/* Navigation / User Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setView("catalog")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentView === "catalog"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              id="nav-btn-catalog"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Catalog</span>
            </button>

            {user && (
              <button
                onClick={() => setView("bookings")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentView === "bookings"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                id="nav-btn-bookings"
              >
                <History className="h-4 w-4" />
                <span>
                  {user.role === "ADMIN" ? "All Bookings" : "My Bookings"}
                </span>
              </button>
            )}

            {user && user.role === "ADMIN" && (
              <button
                onClick={() => setView("admin")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentView === "admin"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                id="nav-btn-admin"
              >
                <Shield className="h-4 w-4" />
                <span>Manage</span>
              </button>
            )}
          </nav>

          <div className="h-6 w-px bg-gray-200"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-950">
                    @{user.username}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold uppercase">
                  {user.username.charAt(0)}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                title="Log Out"
                id="btn-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800"
              id="btn-login"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
