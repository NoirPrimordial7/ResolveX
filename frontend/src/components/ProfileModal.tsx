import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import Button from "./Button";
import { Input } from "./Input";
import PixelIcon from "./PixelIcon";

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

  useEffect(() => {
    if (!open || !user) return;
    setFullName(user.full_name || "");
    setAvatarUrl(user.avatar_url || null);
    setCurrentPassword("");
    setNewPassword("");
    setProfileNotice("");
    setProfileError("");
    setPasswordNotice("");
    setPasswordError("");
  }, [open, user?.id]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

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
  if (typeof document === "undefined") return null;

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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-black/75 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby="profile-title"
        className="app-modal max-h-[calc(100dvh-1rem)] min-h-[calc(100dvh-1rem)] w-full max-w-4xl overflow-y-auto rounded-none sm:min-h-0 sm:max-h-[calc(100vh-2rem)] sm:rounded-sm"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-orange-200/70 bg-[#FFFDF8]/95 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111111]/95">
          <div>
            <p className="eyebrow">Account</p>
            <h2 id="profile-title" className="display-type mt-3 text-4xl leading-none app-text-primary">
              Profile settings
            </h2>
          </div>
          <button
            aria-label="Close profile settings"
            className="app-icon-button"
            onClick={onClose}
            type="button"
          >
            <PixelIcon name="close" size={22} />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="app-card-muted p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 text-3xl ring-4 ring-accent-500/10" size="xl" user={previewUser} />
              <p className="mt-4 max-w-full truncate text-xs font-black uppercase app-text-primary">{fullName}</p>
              <p className="mt-1 max-w-full truncate text-xs app-text-muted">{user.email}</p>
            </div>

            <label className="mt-5 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-accent-500 px-3 text-xs font-black uppercase text-[#0B0B0A] shadow-glow transition hover:bg-accent-400">
              <PixelIcon name="camera" size={18} />
              Upload photo
              <input accept="image/*" className="sr-only" onChange={handleAvatarChange} type="file" />
            </label>
            <Button className="mt-2 w-full" onClick={() => setAvatarUrl(null)} type="button" variant="secondary">
              <PixelIcon name="trash" size={18} />
              Remove
            </Button>
            <p className="mt-3 border-t border-orange-200/70 pt-3 text-xs leading-5 app-text-muted dark:border-white/10">
              Images are stored as compact profile data URLs for this workspace.
            </p>
          </aside>

          <div className="space-y-5">
            <form className="app-card-muted p-4" onSubmit={handleProfileSubmit}>
              <div className="mb-4 flex items-center gap-2 text-accent-400">
                <PixelIcon name="user" size={22} />
                <h3 className="text-xs font-black uppercase app-text-primary">Account details</h3>
              </div>
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
                    "mt-3 rounded-sm border p-3 text-sm",
                    profileError
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  )}
                >
                  {profileError || profileNotice}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button disabled={savingProfile} type="submit" variant="primary">
                  <PixelIcon name="check" size={18} />
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
                <Button onClick={onClose} type="button" variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>

            <form className="app-card-muted p-4" onSubmit={handlePasswordSubmit}>
              <div className="flex items-center gap-2">
                <PixelIcon className="text-accent-400" name="key" size={22} />
                <h3 className="text-xs font-black uppercase app-text-primary">Password</h3>
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
                    "mt-3 rounded-sm border p-3 text-sm",
                    passwordError
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  )}
                >
                  {passwordError || passwordNotice}
                </p>
              )}

              <Button className="mt-4" disabled={savingPassword} type="submit" variant="secondary">
                <PixelIcon name="key" size={18} />
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </form>

            <div className="app-card-muted p-4">
              <div className="flex items-center gap-2 text-accent-400">
                <PixelIcon name="command" size={22} />
                <h3 className="text-xs font-black uppercase app-text-primary">Actions</h3>
              </div>
              <p className="mt-2 text-sm leading-6 app-text-muted">
                Save account changes independently from password updates. Use cancel or the backdrop to leave settings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
