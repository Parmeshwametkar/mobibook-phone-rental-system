import React, { useState, useEffect } from "react";
import { Phone } from "../types";
import { X, Sparkles, AlertCircle } from "lucide-react";

interface AdminPhoneModalProps {
  phone: Phone | null; // Null means Add Phone, non-null means Edit Phone
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneData: any) => Promise<boolean>;
}

export default function AdminPhoneModal({
  phone,
  isOpen,
  onClose,
  onSubmit,
}: AdminPhoneModalProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  // Specs
  const [processor, setProcessor] = useState("");
  const [screen, setScreen] = useState("");
  const [camera, setCamera] = useState("");
  const [battery, setBattery] = useState("");
  const [storage, setStorage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (phone) {
        // Edit Mode
        setBrand(phone.brand);
        setModel(phone.model);
        setImageUrl(phone.imageUrl);
        setPricePerDay(phone.pricePerDay.toString());
        setStock(phone.stock.toString());
        setDescription(phone.description);

        setProcessor(phone.specs.processor);
        setScreen(phone.specs.screen);
        setCamera(phone.specs.camera);
        setBattery(phone.specs.battery);
        setStorage(phone.specs.storage);
      } else {
        // Add Mode
        setBrand("");
        setModel("");
        setImageUrl("");
        setPricePerDay("");
        setStock("");
        setDescription("");

        setProcessor("");
        setScreen("");
        setCamera("");
        setBattery("");
        setStorage("");
      }
      setError("");
    }
  }, [isOpen, phone]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !pricePerDay || stock === "") {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    const phoneData = {
      brand,
      model,
      imageUrl: imageUrl.trim() || undefined,
      pricePerDay: parseFloat(pricePerDay),
      stock: parseInt(stock, 10),
      description,
      specs: {
        processor: processor || "N/A",
        screen: screen || "N/A",
        camera: camera || "N/A",
        battery: battery || "N/A",
        storage: storage || "N/A",
      },
    };

    try {
      const success = await onSubmit(phoneData);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the phone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
        id="admin-phone-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              Inventory Controls
            </span>
            <h3 className="font-sans text-lg font-bold text-gray-950 mt-0.5">
              {phone ? "Edit Phone Record" : "Add New Phone"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            id="close-admin-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleFormSubmit}>
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Samsung, Google"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Model Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro Max"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Rental Rate per Day ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 45"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Starting Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 5"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Image URL (Unsplash or direct image link)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Brief Description
              </label>
              <textarea
                placeholder="A short overview of the device highlight features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Technical specs header */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Hardware Specifications
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Processor / Chipset
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple A17 Pro (3nm)"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Screen / Display Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6.7-inch Super Retina XDR OLED, 120Hz"
                    value={screen}
                    onChange={(e) => setScreen(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Camera Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 48MP Main + 12MP Ultra Wide"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Battery & Charging Specs
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4441 mAh with 25W"
                      value={battery}
                      onChange={(e) => setBattery(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Available Storage Variants
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 128GB / 256GB / 512GB"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-50 bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 shadow-indigo-100 transition-all"
            >
              {loading ? "Saving..." : phone ? "Save Changes" : "Create Phone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
