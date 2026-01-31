"use client";

import { useState } from "react";

type UserProfileProps = {
  userId: string;
  initialData?: {
    licenseNumber?: string;
    licenseState?: string;
    licenseType?: string;
  };
  onSaved?: () => void;
};

const LICENSE_TYPES = ["DC", "PT", "DPT", "DO", "MD", "OT", "ATC", "LAc"];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function UserProfile({ userId, initialData, onSaved }: UserProfileProps) {
  const [licenseType, setLicenseType] = useState(initialData?.licenseType || "");
  const [licenseNumber, setLicenseNumber] = useState(initialData?.licenseNumber || "");
  const [licenseState, setLicenseState] = useState(initialData?.licenseState || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/users/${userId}/license`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseType, licenseNumber, licenseState }),
      });
      setSaved(true);
      onSaved?.();
    } catch {
      // silently fail for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">License Information</h3>
      <p className="text-sm text-black/60 dark:text-white/60">
        Required for PACE continuing education credit records.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium block mb-1">License Type</label>
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
          >
            <option value="">Select...</option>
            {LICENSE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">License Number</label>
          <input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
            placeholder="e.g., DC-12345"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">State</label>
          <select
            value={licenseState}
            onChange={(e) => setLicenseState(e.target.value)}
            className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
          >
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save License Info"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        )}
      </div>
    </div>
  );
}
