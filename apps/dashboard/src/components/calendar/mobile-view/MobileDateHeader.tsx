import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Calendar, ArrowRight } from "lucide-react";
import { changeDate } from "@/lib/utils/calendar/calendar-utils";

interface MobileDateHeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isToday: boolean;
  dateHeading: { day: string; weekday: string };
  onGoToToday?: () => void;
  onFindAvailable?: () => void;
  onSwitchToWeek?: () => void;
}

export function MobileDateHeader({
  selectedDate,
  setSelectedDate,
  isToday,
  dateHeading,
  onGoToToday,
  onFindAvailable,
  onSwitchToWeek,
}: MobileDateHeaderProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [showOverflow, setShowOverflow] = useState(false);

  useEffect(() => {
    if (!showOverflow) return;
    const handler = () => setShowOverflow(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showOverflow]);

  return (
    <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm px-3 py-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedDate(changeDate(selectedDate, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.()}
          className="flex flex-col items-center"
        >
          <span className="text-base font-semibold leading-tight">{dateHeading.day}</span>
          <span className="text-xs text-muted-foreground capitalize">{dateHeading.weekday}</span>
        </button>

        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="invisible absolute h-0 w-0"
          tabIndex={-1}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedDate(changeDate(selectedDate, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowOverflow((v) => !v);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showOverflow && (
              <div
                className="absolute right-0 top-9 z-50 w-40 rounded-md border bg-popover py-1 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                {!isToday && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent active:bg-accent"
                    onClick={() => { onGoToToday?.(); setShowOverflow(false); }}
                  >
                    <Calendar className="h-4 w-4" />
                    I dag
                  </button>
                )}
                {onFindAvailable && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent active:bg-accent"
                    onClick={() => { onFindAvailable(); setShowOverflow(false); }}
                  >
                    <Search className="h-4 w-4" />
                    Finn ledig tid
                  </button>
                )}
                {onSwitchToWeek && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent active:bg-accent"
                    onClick={() => { onSwitchToWeek(); setShowOverflow(false); }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Ukevisning
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
