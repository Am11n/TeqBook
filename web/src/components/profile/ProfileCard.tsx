"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { Field } from "@/components/form/Field";
import { InfoRow } from "./info-row";
import { getRoleDisplayName } from "@/lib/utils/access-control";
import { getInitials } from "@/lib/utils/profile/profile-utils";

interface ProfileCardProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  avatarUrl: string | null;
  userEmail: string | null;
  profile: {
    role?: string | null;
    is_superadmin?: boolean;
  } | null;
  uploadingAvatar: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
}

export function ProfileCard({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  avatarUrl,
  userEmail,
  profile,
  uploadingAvatar,
  fileInputRef,
  onAvatarUpload,
  onRemoveAvatar,
}: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
        <CardDescription>Your personal account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile avatar" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-xl font-semibold text-white">
                {getInitials(firstName, lastName, userEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingAvatar ? "Uploading..." : "Upload new"}
                </Button>
                {avatarUrl && (
                  <Button variant="outline" size="sm" onClick={onRemoveAvatar} disabled={uploadingAvatar}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP. Max 2MB. Square images work best.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Readonly Info */}
        <div className="space-y-4 border-t pt-6">
          <InfoRow label="Email" value={userEmail || "No email"} />
          <InfoRow
            label="Role"
            value={
              profile?.is_superadmin ? (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                >
                  Super Admin
                </Badge>
              ) : profile?.role ? (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {getRoleDisplayName(profile.role)}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )
            }
          />
        </div>

        {/* Editable Fields */}
        <div className="space-y-6 border-t pt-6">
          <Field label="First Name" htmlFor="first_name" required>
            <Input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              maxLength={50}
            />
          </Field>

          <Field label="Last Name" htmlFor="last_name" required>
            <Input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              maxLength={50}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

