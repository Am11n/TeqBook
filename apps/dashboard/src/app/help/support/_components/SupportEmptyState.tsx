import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

export function SupportEmptyState({ onNewCase }: { onNewCase: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-1">No support cases yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Need help? Create a new case and our team will assist you.
      </p>
      <Button size="sm" onClick={onNewCase} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Create a new case
      </Button>
    </div>
  );
}
