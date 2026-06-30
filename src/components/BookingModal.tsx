import React, { useState, useEffect } from "react";
import { Phone, User } from "../types";
import { X, Calendar, AlertCircle, Sparkles, CheckCircle } from "lucide-react";

interface BookingModalProps {
  phone: Phone | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneId: number, startDate: string, endDate: string) => Promise<boolean>;
}

export default function BookingModal({
  phone,
  user,
  isOpen,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default dates: tomorrow as start, day after tomorrow as end
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 2);

      setStartDate(tomorrow.toISOString().split("T")[0]);
      setEndDate(dayAfter.toISOString().split("T")[0]);
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (startDate && endDate && phone) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setDays(diffDays);
        setTotalPrice(diffDays * phone.pricePerDay);
        setError("");
      } else {
        setDays(0);
        setTotalPrice(0);
        setError("End date must be at least 1 day after the start date.");
      }
    }
  }, [startDate, endDate, phone]);

  if (!isOpen || !phone) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (days <= 0) {
      setError("Please select a valid date range.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isSuccess = await onSubmit(phone.id, startDate, endDate);
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
        id="booking-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <h3 className="font-sans text-lg font-bold text-gray-950">
              Book a Phone
            </h3>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Secure Checkout
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            id="close-booking-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Booking Confirmed!</h4>
            <p className="text-sm text-gray-500 mt-1">
              Your device has been booked successfully. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="p-6">
            {/* Phone Info Card Summary */}
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 mb-5 border border-gray-100">
              <img
                src={phone.imageUrl}
                alt={phone.model}
                className="h-14 w-14 rounded-lg object-cover bg-white border border-gray-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                  {phone.brand}
                </span>
                <span className="font-sans text-sm font-bold text-gray-900 block truncate">
                  {phone.model}
                </span>
                <span className="text-xs text-gray-500">
                  ${phone.pricePerDay} / day
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    id="input-start-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    id="input-end-date"
                  />
                </div>
              </div>
            </div>

            {/* Summary calculations */}
            <div className="mt-6 space-y-2 border-t border-dashed border-gray-200 pt-5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-semibold text-gray-900">
                  {days} {days === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Daily Rate</span>
                <span className="font-semibold text-gray-900">
                  ${phone.pricePerDay}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-50">
                <span>Total Cost</span>
                <span className="text-indigo-600 font-extrabold text-lg">
                  ${totalPrice}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                id="btn-cancel-booking-modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || days <= 0}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-all ${
                  loading || days <= 0
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                }`}
                id="btn-confirm-booking"
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
