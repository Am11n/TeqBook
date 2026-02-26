import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function SupportEmptyState({ onNewCase }: { onNewCase: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-1">No support cases yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Need help? Create a new case and our team will assist you.
      </p>
      <Button size="sm" onClick={onNewCase}>Create a new case</Button>
    </div>
  );
}
