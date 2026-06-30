import React from "react";
import { Phone, User } from "../types";
import { X, Cpu, Smartphone, Camera, Battery, Database, ShieldAlert, BadgeInfo } from "lucide-react";

interface PhoneDetailModalProps {
  phone: Phone | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (phone: Phone) => void;
}

export default function PhoneDetailModal({
  phone,
  user,
  isOpen,
  onClose,
  onBook,
}: PhoneDetailModalProps) {
  if (!isOpen || !phone) return null;

  const isAvailable = phone.stock > 0;
  const isAdmin = user?.role === "ADMIN";

  const specsList = [
    { label: "Processor", value: phone.specs.processor, icon: Cpu },
    { label: "Display", value: phone.specs.screen, icon: Smartphone },
    { label: "Camera Setup", value: phone.specs.camera, icon: Camera },
    { label: "Battery & Charging", value: phone.specs.battery, icon: Battery },
    { label: "Storage Capacities", value: phone.specs.storage, icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
        id="phone-detail-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              Detailed Specifications
            </span>
            <h3 className="font-sans text-xl font-bold text-gray-950 mt-0.5">
              {phone.brand} {phone.model}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            id="close-detail-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Phone Image */}
            <div className="md:col-span-2 aspect-[4/3] md:aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
              <img
                src={phone.imageUrl}
                alt={phone.model}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* General details */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isAvailable ? `In Stock (${phone.stock} units)` : "Out of Stock"}
                </span>

                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {phone.description || "No full description provided."}
                </p>
              </div>

              <div className="mt-6 flex items-baseline justify-between border-t border-gray-50 pt-4">
                <div>
                  <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">
                    Rate per day
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold text-indigo-600">
                      ${phone.pricePerDay}
                    </span>
                    <span className="text-xs text-gray-500 ml-0.5">/day</span>
                  </div>
                </div>

                {!isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onBook(phone);
                    }}
                    disabled={!isAvailable}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all ${
                      isAvailable
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isAvailable ? "Book This Phone" : "Out of Stock"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <h4 className="font-sans text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <BadgeInfo className="h-4 w-4 text-indigo-500" />
              Technical Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specsList.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {spec.label}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-snug">
                        {spec.value || "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close Spec Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
