export const loginWithOutlook = async () => {
  alert("Outlook sync requires Azure Client ID configuration. Feature coming soon!");
  throw new Error("Outlook not configured");
};

export const fetchOutlookEvents = async (token: string) => {
  return [];
};