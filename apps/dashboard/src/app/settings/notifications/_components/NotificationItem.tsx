"use client";

import { Badge } from "@/components/ui/badge";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Clock, Eye } from "lucide-react";
import type { NotificationForm } from "./constants";

type NotificationItemProps = {
  icon: React.ElementType;
  label: string;
  description: string;
  fieldKey: keyof NotificationForm;
  showTiming?: boolean;
  isChecked: boolean;
  reminderTiming: string;
  onToggle: (fieldKey: keyof NotificationForm, value: boolean) => void;
  onTimingChange: (value: string) => void;
  onPreview: (fieldKey: string) => void;
  activeLabel: string;
  disabledLabel: string;
};

export function NotificationItem({
  icon: Icon, label, description, fieldKey, showTiming,
  isChecked, reminderTiming,
  onToggle, onTimingChange, onPreview,
  activeLabel, disabledLabel,
}: NotificationItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <label className="flex items-center pt-0.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onToggle(fieldKey, e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{label}</span>
          <Badge
            variant={isChecked ? "default" : "secondary"}
            className="text-[10px] px-1.5 py-0 h-4 leading-4"
          >
            {isChecked ? activeLabel : disabledLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>

        {showTiming && (
          <div className={`overflow-hidden transition-all duration-200 ${isChecked ? "max-h-12 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <DialogSelect
                value={reminderTiming}
                onChange={onTimingChange}
                options={[
                  { value: "24h", label: "24 hours before" },
                  { value: "2h", label: "2 hours before" },
                  { value: "both", label: "Both (24h + 2h)" },
                ]}
              />
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onPreview(fieldKey)}
        className="text-xs text-primary hover:underline whitespace-nowrap flex items-center gap-1"
      >
        <Eye className="h-3 w-3" />
        Preview
      </button>
    </div>
  );
}
