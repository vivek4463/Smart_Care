export const exportUserData = () => {
  const sessionData = localStorage.getItem("smart_care_session");
  const userData = localStorage.getItem("smart_care_user");
  const rlData = localStorage.getItem("smart_care_rl_data");

  const fullData = {
    user: userData ? JSON.parse(userData) : null,
    sessions: sessionData ? JSON.parse(sessionData) : null,
    personalization: rlData ? JSON.parse(rlData) : null,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `smart-care-data-export-${new Date().getTime()}.json`;
  a.click();
};

export const deleteUserData = () => {
  localStorage.removeItem("smart_care_session");
  localStorage.removeItem("smart_care_user");
  localStorage.removeItem("smart_care_rl_data");
  window.location.href = "/";
};
