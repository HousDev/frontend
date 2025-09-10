export function canAddLead(user: any) {
  const role = (user?.role || "").toLowerCase();
  return role === "admin" || role === "manager"; // सिर्फ admin और manager को add का option
}

export function canEditLead(user: any, lead: any) {
  const role = (user?.role || "").toLowerCase();

  if (role === "admin") return true; // admin हमेशा edit कर सकता
  if (role === "manager") return true; // manager भी edit कर सकता
  if (role === "executive") {
    // executive सिर्फ अपने lead edit कर सकता
    return String(lead.assigned_executive) === String(user?.id);
  }
  return false;
}

export function canDeleteLead(user: any) {
  const role = (user?.role || "").toLowerCase();
  return role === "admin"; // सिर्फ admin को delete allowed
}

export function canViewLead(user: any, lead: any) {
  const role = (user?.role || "").toLowerCase();

  if (role === "admin" || role === "manager") return true;
  if (role === "executive") {
    return String(lead.assigned_executive) === String(user?.id);
  }
  return false;
}
export function canExportLeads(user: any) {
  const role = (user?.role || "").toLowerCase();
  // Export का access admin + manager को दो
  return role === "admin" || role === "manager";
}

export function canImportLeads(user: any) {
  const role = (user?.role || "").toLowerCase();
  // Import सिर्फ admin को allow करो
  return role === "admin";
}
