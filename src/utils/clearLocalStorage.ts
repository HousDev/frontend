export const clearLocalStorage = () => {
  const keysToClear = [
    "token",
    "user",
    "systemSettings",
    "activityHistory",
    "loginDate",
    "todayLoginTime",
    "theme",
    "filters",
    "tenant_shortlisted_properties",
    "verified_tenant",
    "last_unlocked_owner",
    "show_password_reminder",
    "prompt_tenant_preferences",
  ];

  keysToClear.forEach((k) => localStorage.removeItem(k));

  // Also remove any dynamic user-scoped shortlist keys
  try {
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((k) => {
      if (k.startsWith("tenant_shortlisted_properties")) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // Ignore in case of storage restrictions
  }
};
