import React from "react";
import { useOutletContext } from "react-router";
import ProfileEditor from "../components/profile/ProfileEditor";
import type { DashboardContext } from "../layouts/DashboardLayout";

export default function ProfilePage() {
  const { user, onRequireAuth } = useOutletContext<DashboardContext>();

  return (
    <ProfileEditor
      user={user}
      onRequireAuth={onRequireAuth}
    />
  );
}
