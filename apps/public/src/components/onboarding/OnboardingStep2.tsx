"use client";

import { motion } from "framer-motion";
import type { OpeningHours } from "@/lib/utils/onboarding/onboarding-utils";

interface OnboardingStep2Props {
  openingHours: OpeningHours[];
  setOpeningHours: (hours: OpeningHours[]) => void;
  onlineBooking: boolean;
  setOnlineBooking: (enabled: boolean) => void;
  publicBooking: boolean;
  setPublicBooking: (enabled: boolean) => void;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  translations: {
    openingHoursLabel: string;
    openingHoursDescription: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    closedLabel: string;
    onlineBookingLabel: string;
    onlineBookingYes: string;
    onlineBookingNo: string;
    publicBookingLabel: string;
    publicBookingYes: string;
    publicBookingNo: string;
    backButton: string;
    nextButton: string;
  };
}

export function OnboardingStep2({
  openingHours,
  setOpeningHours,
  onlineBooking,
  setOnlineBooking,
  publicBooking,
  setPublicBooking,
  canProceed,
  onNext,
  onBack,
  translations,
}: OnboardingStep2Props) {
  const dayNames = [
    translations.monday,
    translations.tuesday,
    translations.wednesday,
    translations.thursday,
    translations.friday,
    translations.saturday,
    translations.sunday,
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Opening Hours Section */}
      <div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{translations.openingHoursLabel}</h3>
          <p className="mt-1 text-xs text-slate-500/80">{translations.openingHoursDescription}</p>
        </div>
        <div className="mt-3 w-full space-y-1.5">
          {openingHours.map((dayHours, index) => {
            return (
              <div key={dayHours.day}>
                {dayHours.isOpen ? (
                  <div className="grid grid-cols-[20px_90px_1fr_18px_1fr] items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-50/50 transition-colors">
                    {/* Checkbox */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayHours.isOpen}
                        onChange={(e) => {
                          const updated = [...openingHours];
                          updated[index] = {
                            ...dayHours,
                            isOpen: e.target.checked,
                          };
                          setOpeningHours(updated);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                      />
                    </label>

                    {/* Day name */}
                    <span className="text-sm font-medium text-slate-700">
                      {dayNames[dayHours.day]}
                    </span>

                    {/* Start time */}
                    <input
                      type="time"
                      value={dayHours.openTime}
                      onChange={(e) => {
                        const updated = [...openingHours];
                        updated[index] = {
                          ...dayHours,
                          openTime: e.target.value,
                        };
                        setOpeningHours(updated);
                      }}
                      className="h-9 rounded-xl border border-slate-200/60 bg-white/90 px-3 text-sm outline-none ring-0 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />

                    {/* Arrow separator */}
                    <span className="text-center text-sm text-slate-400">→</span>

                    {/* End time */}
                    <input
                      type="time"
                      value={dayHours.closeTime}
                      onChange={(e) => {
                        const updated = [...openingHours];
                        updated[index] = {
                          ...dayHours,
                          closeTime: e.target.value,
                        };
                        setOpeningHours(updated);
                      }}
                      className="h-9 rounded-xl border border-slate-200/60 bg-white/90 px-3 text-sm outline-none ring-0 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-[20px_90px_1fr_18px_1fr] items-center gap-2 rounded-xl px-3 py-1.5 opacity-50 hover:bg-slate-50/50 transition-colors">
                    {/* Checkbox */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => {
                          const updated = [...openingHours];
                          updated[index] = {
                            ...dayHours,
                            isOpen: e.target.checked,
                          };
                          setOpeningHours(updated);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                      />
                    </label>

                    {/* Day name */}
                    <span className="text-sm font-medium text-slate-700">
                      {dayNames[dayHours.day]}
                    </span>

                    {/* Closed text spanning remaining columns */}
                    <span className="col-span-3 text-right text-sm text-slate-400">
                      {translations.closedLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Settings Section */}
      <div className="mt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Booking settings</h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              {translations.onlineBookingLabel}
            </label>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="onlineBooking"
                  checked={onlineBooking === true}
                  onChange={() => setOnlineBooking(true)}
                  className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <span className="text-sm text-slate-700">{translations.onlineBookingYes}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="onlineBooking"
                  checked={onlineBooking === false}
                  onChange={() => setOnlineBooking(false)}
                  className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <span className="text-sm text-slate-700">{translations.onlineBookingNo}</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              {translations.publicBookingLabel}
            </label>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publicBooking"
                  checked={publicBooking === true}
                  onChange={() => setPublicBooking(true)}
                  className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <span className="text-sm text-slate-700">{translations.publicBookingYes}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publicBooking"
                  checked={publicBooking === false}
                  onChange={() => setPublicBooking(false)}
                  className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <span className="text-sm text-slate-700">{translations.publicBookingNo}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.75 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white"
        >
          {translations.backButton}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center justify-center h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold tracking-tight text-white shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {translations.nextButton}
        </button>
      </div>
    </motion.div>
  );
}

