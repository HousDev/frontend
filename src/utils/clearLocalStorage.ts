export const clearLocalStorage = () => {
  const keysToClear = [
    "token",
    "user",
    "systemSettings",
    "activityHistory",
    "loginDate",
    "todayLoginTime",
    // future keys
    "theme",
    "filters"
  ];

  keysToClear.forEach((k) => localStorage.removeItem(k));
};
