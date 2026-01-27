import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Building2 } from "lucide-react";
import { getRoleDisplayName } from "@/lib/utils/access-control";

type AvatarBlockProps = {
  initials: string;
  email: string | null;
  salonName?: string | null;
  role?: string | null;
  isSuperAdmin?: boolean;
};

/**
 * Reusable component for displaying avatar with user info
 * Used in profile pages
 */
export function AvatarBlock({
  initials,
  email,
  salonName,
  role,
  isSuperAdmin,
}: AvatarBlockProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-lg font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {email || "No email"}
        </div>
        {salonName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {salonName}
          </div>
        )}
        {(role || isSuperAdmin) && (
          <div className="pt-1">
            {isSuperAdmin ? (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                Super Admin
              </Badge>
            ) : role ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {getRoleDisplayName(role)}
              </Badge>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

