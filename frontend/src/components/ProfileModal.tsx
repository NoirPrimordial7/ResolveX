import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Camera, KeyRound, Save, Trash2, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import Button from "./Button";
import { Input } from "./Input";

const maxAvatarBytes = 1_500_000;

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileModal({ onClose, open }: ProfileModalProps) {
  const { changePassword, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const previewUser = useMemo(
    () =>
      user
        ? {
            ...user,
            avatar_url: avatarUrl,
            full_name: fullName
          }
        : null,
    [avatarUrl, fullName, user]
  );

  if (!open || !user) return null;

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setProfileNotice("");
    if (file.size > maxAvatarBytes) {
      setProfileError("Choose an image smaller than 1.5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setProfileError("Profile photo must be an image file.");
      return;
    }

    try {
      setProfileError("");
      setAvatarUrl(await readFileAsDataUrl(file));
    } catch {
      setProfileError("Profile photo could not be loaded.");
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileNotice("");
    try {
      await updateProfile({ full_name: fullName.trim(), avatar_url: avatarUrl });
      setProfileNotice("Profile updated.");
    } catch {
      setProfileError("Profile could not be updated.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordNotice("");
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordNotice("Password updated.");
    } catch {
      setPasswordError("Password could not be changed. Check the current password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation">
      <section
        aria-modal="true"
        aria-labelledby="profile-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md border border-white/10 bg-[#11141B] shadow-2xl shadow-black/45"
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#11141B]/95 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase text-accent-400">Account</p>
            <h2 id="profile-title" className="mt-1 text-lg font-semibold text-[#F5F7FB]">
              Profile settings
            </h2>
          </div>
          <button
            aria-label="Close profile settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-[#AAB3C5] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
            onClick={onClose}
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="ring-4 ring-accent-500/10" size="xl" user={previewUser} />
              <p className="mt-4 max-w-full truncate text-sm font-semibold text-[#F5F7FB]">{fullName}</p>
              <p className="mt-1 max-w-full truncate text-xs text-[#AAB3C5]">{user.email}</p>
            </div>

            <label className="mt-5 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent-500 px-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 transition hover:bg-accent-400">
              <Camera size={16} aria-hidden="true" />
              Upload photo
              <input accept="image/*" className="sr-only" onChange={handleAvatarChange} type="file" />
            </label>
            <Button className="mt-2 w-full" onClick={() => setAvatarUrl(null)} type="button" variant="secondary">
              <Trash2 size={16} aria-hidden="true" />
              Remove
            </Button>
            <p className="mt-3 text-xs leading-5 text-[#AAB3C5]">Images are stored as compact profile data URLs for this workspace.</p>
          </aside>

          <div className="space-y-5">
            <form className="rounded-md border border-white/10 bg-white/[0.03] p-4" onSubmit={handleProfileSubmit}>
              <label className="label" htmlFor="profile-name">
                Display name
              </label>
              <Input
                className="mt-2"
                id="profile-name"
                maxLength={120}
                minLength={2}
                onChange={(event) => setFullName(event.target.value)}
                value={fullName}
                required
              />

              {(profileError || profileNotice) && (
                <p
                  className={cn(
                    "mt-3 rounded-md border p-3 text-sm",
                    profileError
                      ? "border-red-500/25 bg-red-500/10 text-red-200"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  )}
                >
                  {profileError || profileNotice}
                </p>
              )}

              <Button className="mt-4" disabled={savingProfile} type="submit" variant="primary">
                <Save size={17} aria-hidden="true" />
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
            </form>

            <form className="rounded-md border border-white/10 bg-white/[0.03] p-4" onSubmit={handlePasswordSubmit}>
              <div className="flex items-center gap-2">
                <KeyRound className="text-accent-400" size={18} aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Change password</h3>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="current-password">
                    Current password
                  </label>
                  <Input
                    className="mt-2"
                    id="current-password"
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    type="password"
                    value={currentPassword}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="new-password">
                    New password
                  </label>
                  <Input
                    className="mt-2"
                    id="new-password"
                    minLength={8}
                    onChange={(event) => setNewPassword(event.target.value)}
                    type="password"
                    value={newPassword}
                    required
                  />
                </div>
              </div>

              {(passwordError || passwordNotice) && (
                <p
                  className={cn(
                    "mt-3 rounded-md border p-3 text-sm",
                    passwordError
                      ? "border-red-500/25 bg-red-500/10 text-red-200"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  )}
                >
                  {passwordError || passwordNotice}
                </p>
              )}

              <Button className="mt-4" disabled={savingPassword} type="submit" variant="secondary">
                <KeyRound size={17} aria-hidden="true" />
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
