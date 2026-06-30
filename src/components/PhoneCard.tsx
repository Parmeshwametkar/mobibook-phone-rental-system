import React from "react";
import { Phone, User } from "../types";
import { Eye, CalendarDays, Edit3, Trash2, Tag, Layers } from "lucide-react";

interface PhoneCardProps {
  key?: React.Key;
  phone: Phone;
  user: User | null;
  onViewDetails: (phone: Phone) => void;
  onBook: (phone: Phone) => void;
  onEdit: (phone: Phone) => void;
  onDelete: (phoneId: number) => void;
}

export default function PhoneCard({
  phone,
  user,
  onViewDetails,
  onBook,
  onEdit,
  onDelete,
}: PhoneCardProps) {
  const isAvailable = phone.stock > 0;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md"
      id={`phone-card-${phone.id}`}
    >
      {/* Brand Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
        <Tag className="h-3 w-3 text-indigo-500" />
        {phone.brand}
      </div>

      {/* Stock Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
            isAvailable
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          {isAvailable ? `${phone.stock} Available` : "Out of Stock"}
        </span>
      </div>

      {/* Phone Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <img
          src={phone.imageUrl}
          alt={`${phone.brand} ${phone.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          id={`phone-image-${phone.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>

      {/* Details Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-lg font-bold text-gray-950 group-hover:text-indigo-600 transition-colors">
          {phone.model}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 flex-1">
          {phone.description || "No description provided."}
        </p>

        {/* Technical highlight */}
        <div className="mt-4 flex items-center gap-3 border-t border-b border-gray-50 py-3 text-xs text-gray-600">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">
              Storage
            </span>
            <span className="font-medium text-gray-800 truncate max-w-[120px]">
              {phone.specs.storage.split("/")[0].trim()}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-100"></div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">
              Processor
            </span>
            <span className="font-medium text-gray-800 truncate">
              {phone.specs.processor}
            </span>
          </div>
        </div>

        {/* Pricing & CTA footer */}
        <div className="mt-4 flex items-center justify-between pt-1">
          <div>
            <span className="font-sans text-xl font-extrabold text-indigo-600">
              ${phone.pricePerDay}
            </span>
            <span className="text-xs text-gray-400">/day</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(phone)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              title="View Specs & Details"
              id={`btn-view-${phone.id}`}
            >
              <Eye className="h-4 w-4" />
            </button>

            {isAdmin ? (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(phone)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                  title="Edit Phone"
                  id={`btn-edit-${phone.id}`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(phone.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                  title="Delete Phone"
                  id={`btn-delete-${phone.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onBook(phone)}
                disabled={!isAvailable}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                  isAvailable
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                }`}
                id={`btn-book-${phone.id}`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Book Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
