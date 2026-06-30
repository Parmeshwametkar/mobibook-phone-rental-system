import React, { useState, useEffect } from "react";
import { Phone, User, Booking } from "./types";
import Navbar from "./components/Navbar";
import PhoneCard from "./components/PhoneCard";
import PhoneDetailModal from "./components/PhoneDetailModal";
import BookingModal from "./components/BookingModal";
import AdminPhoneModal from "./components/AdminPhoneModal";
import AuthModal from "./components/AuthModal";
import {
  Smartphone,
  Search,
  Plus,
  History,
  Calendar,
  Sparkles,
  AlertCircle,
  X,
  Filter,
  CheckCircle,
  Clock,
  UserCheck,
  Building,
  DollarSign
} from "lucide-react";

export default function App() {
  // Authentication & View Session States
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<"catalog" | "bookings" | "admin">("catalog");

  // Phone Catalogue & Filtering States
  const [phones, setPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [brands, setBrands] = useState<string[]>(["All", "Apple", "Samsung", "Google", "OnePlus"]);

  // Booking history lists
  const [bookings, setBookings] = useState<Booking[]>([]);

  // UI Modals states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Focus entity states
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  // Status & Feedback alerts
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loadingPhones, setLoadingPhones] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Initialize: Load user session and fetch phones
  useEffect(() => {
    const savedUser = localStorage.getItem("mobibook-user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("mobibook-user");
      }
    }
    fetchPhones();
  }, []);

  // Sync Booking List when view shifts or user logs in
  useEffect(() => {
    if (user && currentView === "bookings") {
      fetchBookings();
    }
  }, [user, currentView]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // API Call: Fetch all phones from the server
  const fetchPhones = async (search = "", brand = "") => {
    setLoadingPhones(true);
    try {
      const qParams = new URLSearchParams();
      if (search) qParams.append("search", search);
      if (brand && brand !== "All") qParams.append("brand", brand);

      const res = await fetch(`/api/phones?${qParams.toString()}`);
      if (!res.ok) throw new Error("Could not fetch phone inventory.");
      const data = await res.json();
      setPhones(data);

      // Extract unique brands dynamically from current inventory to keep options updated
      const dynamicBrands = ["All", ...new Set(data.map((p: Phone) => p.brand)) as Set<string>];
      setBrands(dynamicBrands);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load phones.", "error");
    } finally {
      setLoadingPhones(false);
    }
  };

  // API Call: Fetch booking history
  const fetchBookings = async () => {
    if (!user || !user.token) return;
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/bookings", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (!res.ok) throw new Error("Could not fetch bookings.");
      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load bookings.", "error");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Search & Filter Trigger
  const handleSearchAndFilter = (search: string, brand: string) => {
    setSearchQuery(search);
    setSelectedBrand(brand);
    fetchPhones(search, brand);
  };

  // Auth Callback
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem("mobibook-user", JSON.stringify(userData));
    showToast(`Welcome back, ${userData.username}!`);
    fetchPhones();
  };

  // Log out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("mobibook-user");
    setView("catalog");
    showToast("Signed out successfully.");
  };

  // Modal open helpers
  const triggerBookingModal = (phone: Phone) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (phone.stock <= 0) {
      showToast("This phone is currently out of stock.", "error");
      return;
    }
    setSelectedPhone(phone);
    setBookingModalOpen(true);
  };

  const triggerDetailModal = (phone: Phone) => {
    setSelectedPhone(phone);
    setDetailModalOpen(true);
  };

  const triggerAddPhone = () => {
    setSelectedPhone(null);
    setAdminModalOpen(true);
  };

  const triggerEditPhone = (phone: Phone) => {
    setSelectedPhone(phone);
    setAdminModalOpen(true);
  };

  // API Action: Book Phone
  const handleBookPhoneSubmit = async (phoneId: number, startDate: string, endDate: string): Promise<boolean> => {
    if (!user || !user.token) return false;
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ phoneId, startDate, endDate })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to finalize booking.");
      }

      showToast("Booking created successfully!");
      // Refresh database records
      fetchPhones(searchQuery, selectedBrand);
      return true;
    } catch (err: any) {
      throw new Error(err.message || "Error submitting booking details.");
    }
  };

  // API Action: Cancel Booking
  const handleCancelBooking = async (bookingId: number) => {
    if (!user || !user.token) return;
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking.");
      }

      showToast("Booking cancelled successfully.");
      fetchBookings();
      fetchPhones(searchQuery, selectedBrand);
    } catch (err: any) {
      showToast(err.message || "Could not cancel booking.", "error");
    }
  };

  // API Action: Admin Delete Phone
  const handleDeletePhone = async (phoneId: number) => {
    if (!user || !user.token) return;
    if (!confirm("Are you absolutely sure you want to delete this phone from the inventory catalog?")) return;

    try {
      const response = await fetch(`/api/phones/${phoneId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete phone record.");
      }

      showToast("Phone removed from inventory.");
      fetchPhones(searchQuery, selectedBrand);
    } catch (err: any) {
      showToast(err.message || "Could not delete phone.", "error");
    }
  };

  // API Action: Admin Create/Update Phone
  const handleSavePhoneSubmit = async (phoneData: any): Promise<boolean> => {
    if (!user || !user.token) return false;

    const isEdit = selectedPhone !== null;
    const endpoint = isEdit ? `/api/phones/${selectedPhone.id}` : "/api/phones";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(phoneData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save phone details.");
      }

      showToast(isEdit ? "Phone updated successfully." : "Phone created successfully!");
      fetchPhones(searchQuery, selectedBrand);
      return true;
    } catch (err: any) {
      showToast(err.message || "Could not save phone details.", "error");
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg animate-slide-up">
          <div
            className={`h-2 w-2 rounded-full ${
              notification.type === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          ></div>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        currentView={currentView}
        setView={setView}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* MAIN VIEW CONTROLLER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* VIEW 1: CATALOGUE DASHBOARD */}
        {currentView === "catalog" && (
          <div className="space-y-8">
            {/* Elegant Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-indigo-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16 shadow-lg shadow-indigo-900/20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-800/40 via-transparent to-transparent"></div>
              <div className="relative mx-auto max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Device Rentals Made Simple
                </span>
                <h1 className="font-sans text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Book Your Next Flagship
                </h1>
                <p className="text-sm sm:text-base text-indigo-200">
                  Secure instant rentals of the latest smartphones. Test hardware, develop applications, or stay connected with ease.
                </p>

                {/* Integrated Search and Filter Console */}
                <div className="mx-auto max-w-xl pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-2 shadow-xl border border-gray-100">
                    <div className="relative flex-1">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search model or brand..."
                        value={searchQuery}
                        onChange={(e) => handleSearchAndFilter(e.target.value, selectedBrand)}
                        className="w-full rounded-xl border-none pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-0"
                        id="catalog-search-input"
                      />
                    </div>
                    
                    {/* Brand Selector */}
                    <div className="flex items-center border-t sm:border-t-0 sm:border-l border-gray-100 px-3 pt-2 sm:pt-0">
                      <Filter className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                      <select
                        value={selectedBrand}
                        onChange={(e) => handleSearchAndFilter(searchQuery, e.target.value)}
                        className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer font-medium py-1.5"
                        id="catalog-brand-select"
                      >
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Listing */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-sans text-xl font-bold text-gray-950">
                    Available Smartphones
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {phones.length} devices matching your search parameters
                  </p>
                </div>

                {user?.role === "ADMIN" && (
                  <button
                    onClick={triggerAddPhone}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 shadow-indigo-100 transition-all"
                    id="btn-add-phone-shortcut"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Phone</span>
                  </button>
                )}
              </div>

              {loadingPhones ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
                  <p className="text-sm text-gray-500 mt-4 font-medium">Scanning catalog inventory...</p>
                </div>
              ) : phones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Phones Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    No models matching "{searchQuery}" could be located. Try adjusting your brand filters or spelling.
                  </p>
                  <button
                    onClick={() => handleSearchAndFilter("", "All")}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Clear Filter Queries
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phones.map((phone) => (
                    <PhoneCard
                      key={phone.id}
                      phone={phone}
                      user={user}
                      onViewDetails={triggerDetailModal}
                      onBook={triggerBookingModal}
                      onEdit={triggerEditPhone}
                      onDelete={(id) => { handleDeletePhone(id); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: BOOKING HISTORY */}
        {currentView === "bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-sans text-2xl font-bold text-gray-950 flex items-center gap-2">
                  <History className="h-6 w-6 text-indigo-600" />
                  {user?.role === "ADMIN" ? "All Reservation Bookings" : "Your Booking History"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {user?.role === "ADMIN"
                    ? "Monitor system-wide active bookings, cancellations, and status logs"
                    : "Track your active phone bookings, daily pricing, and device schedules"}
                </p>
              </div>

              <button
                onClick={() => setView("catalog")}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Back to Catalog
              </button>
            </div>

            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
                <p className="text-sm text-gray-500 mt-4">Retrieving reservation logs...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No Reservations Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  You do not have any active or previous phone bookings in this catalog.
                </p>
                <button
                  onClick={() => setView("catalog")}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Browse Available Phones
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isCancelled = booking.status === "CANCELLED";
                  return (
                    <div
                      key={booking.id}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl border p-5 bg-white transition-all shadow-sm ${
                        isCancelled
                          ? "border-gray-100 opacity-75"
                          : "border-gray-100 hover:border-gray-200 hover:shadow"
                      }`}
                    >
                      {/* Left: Device details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={booking.phoneDetails.imageUrl}
                            alt={booking.phoneDetails.model}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase tracking-widest block">
                            {booking.phoneDetails.brand}
                          </span>
                          <h4 className="font-sans text-base font-bold text-gray-950 truncate">
                            {booking.phoneDetails.model}
                          </h4>
                          
                          {/* Booking metadata info */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span>
                              Booking ID: <strong className="font-mono text-gray-700">#{booking.id}</strong>
                            </span>
                            {user?.role === "ADMIN" && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3 text-indigo-400" />
                                Customer: <strong className="text-gray-700">@{booking.username}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Reservation Date Range */}
                      <div className="mt-4 md:mt-0 flex flex-wrap gap-4 items-center justify-between w-full md:w-auto border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
                        <div className="text-left md:text-center">
                          <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                            Rental Period
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-gray-800">
                            <span>{booking.startDate}</span>
                            <span className="text-gray-400">&rarr;</span>
                            <span>{booking.endDate}</span>
                          </div>
                        </div>

                        <div className="text-left md:text-center md:min-w-[100px]">
                          <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">
                            Total Price
                          </span>
                          <span className="text-sm font-extrabold text-indigo-600 block mt-0.5">
                            ${booking.totalPrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isCancelled
                                ? "bg-rose-50 text-rose-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {booking.status}
                          </span>

                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="rounded-xl border border-rose-100 bg-rose-50/50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ADMIN LISTING MANAGEMENT PANELS */}
        {currentView === "admin" && user?.role === "ADMIN" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-sans text-2xl font-bold text-gray-950 flex items-center gap-2">
                  <Building className="h-6 w-6 text-indigo-600" />
                  Inventory Management Panel
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Update product features, technical specifications, daily rates, and stock metrics instantly
                </p>
              </div>

              <button
                onClick={triggerAddPhone}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 shadow-indigo-100 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Phone</span>
              </button>
            </div>

            {/* Structured Table Layout for Inventory Management */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 font-sans text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4">Phone Item Details</th>
                      <th className="px-6 py-4">Daily Cost</th>
                      <th className="px-6 py-4">Current Stock</th>
                      <th className="px-6 py-4">Hardware specs</th>
                      <th className="px-6 py-4 text-right">Inventory Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {phones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          No phone records registered. Add a smartphone to get started.
                        </td>
                      </tr>
                    ) : (
                      phones.map((phone) => (
                        <tr key={phone.id} className="hover:bg-gray-50/50">
                          {/* Details Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={phone.imageUrl}
                                alt={phone.model}
                                className="h-12 w-12 rounded-lg object-cover bg-gray-50 border border-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-semibold text-gray-900 block leading-tight">
                                  {phone.model}
                                </span>
                                <span className="text-xs text-gray-500 font-medium block mt-0.5">
                                  {phone.brand}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Price Column */}
                          <td className="px-6 py-4 font-semibold text-indigo-600">
                            ${phone.pricePerDay} / day
                          </td>

                          {/* Stock Column */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                phone.stock > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {phone.stock > 0 ? `${phone.stock} units` : "Out of Stock"}
                            </span>
                          </td>

                          {/* Hardware specs shortcut column */}
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                            <span className="block truncate max-w-[150px]" title={phone.specs.processor}>
                              CPU: {phone.specs.processor}
                            </span>
                            <span className="block mt-0.5 truncate max-w-[150px]" title={phone.specs.storage}>
                              ROM: {phone.specs.storage}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => triggerEditPhone(phone)}
                                className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePhone(phone.id)}
                                className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
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
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-8 text-center text-xs text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-sans font-medium text-gray-500">
            &copy; 2026 MobiBook Full-Stack Rental Services. Developed with Spring Boot & React.
          </p>
          <div className="mt-2 flex justify-center gap-4 font-mono text-[10px] uppercase tracking-wider text-gray-400">
            <span>MySQL Schema V1.0</span>
            <span>&bull;</span>
            <span>REST API Verified</span>
            <span>&bull;</span>
            <span>Local Cloud Sandbox</span>
          </div>
        </div>
      </footer>

      {/* GLOBAL MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <BookingModal
        phone={selectedPhone}
        user={user}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSubmit={handleBookPhoneSubmit}
      />

      <PhoneDetailModal
        phone={selectedPhone}
        user={user}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onBook={triggerBookingModal}
      />

      <AdminPhoneModal
        phone={selectedPhone}
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSubmit={handleSavePhoneSubmit}
      />
    </div>
  );
}
