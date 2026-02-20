"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, CopyCheck } from "lucide-react";

interface CopyDayPopoverProps {
  onCopyMondayToWeekdays: (opts: CopyOptions) => void;
  onApplyToAllOpenDays: (opts: CopyOptions) => void;
}

export interface CopyOptions {
  overwriteTimes: boolean;
  keepBreaks: boolean;
  keepClosed: boolean;
}

function MergeToggles({
  opts,
  setOpts,
  onApply,
}: {
  opts: CopyOptions;
  setOpts: (o: CopyOptions) => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-3 p-1">
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={opts.overwriteTimes} onChange={(e) => setOpts({ ...opts, overwriteTimes: e.target.checked })} className="h-3.5 w-3.5 rounded" />
        Overwrite opening times
      </label>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={opts.keepBreaks} onChange={(e) => setOpts({ ...opts, keepBreaks: e.target.checked })} className="h-3.5 w-3.5 rounded" />
        Keep existing breaks
      </label>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={opts.keepClosed} onChange={(e) => setOpts({ ...opts, keepClosed: e.target.checked })} className="h-3.5 w-3.5 rounded" />
        Keep closed days as closed
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

export function CopyDayPopover({ onCopyMondayToWeekdays, onApplyToAllOpenDays }: CopyDayPopoverProps) {
  const [opts, setOpts] = useState<CopyOptions>({
    overwriteTimes: true,
    keepBreaks: true,
    keepClosed: true,
  });

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy Mon to Tue-Fri
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <p className="text-xs font-medium mb-2">
            This updates: Tue, Wed, Thu, Fri
          </p>
          <MergeToggles opts={opts} setOpts={setOpts} onApply={() => onCopyMondayToWeekdays(opts)} />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            <CopyCheck className="mr-1.5 h-3.5 w-3.5" />
            Apply to all open days
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <p className="text-xs font-medium mb-2">
            Applies first open day&apos;s schedule to all open days.
          </p>
          <MergeToggles opts={opts} setOpts={setOpts} onApply={() => onApplyToAllOpenDays(opts)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
