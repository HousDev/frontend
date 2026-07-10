// utils/roleBasedOptions.ts - CORRECTED VERSION
export function getAssignableExecutives(user: any, salesUsers: any[]) {
  const norm = (s: any) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-_/]+/g, "");

  const role = norm(user?.role || "");
  const dept = norm(user?.department || "");

  const toExecutive = (u: any, isSelf = false) => {
    const salutation = u.salutation || "";
    const firstName = u.first_name || u.name || "You";
    const lastName = u.last_name || "";
    
    let name = `${salutation ? salutation + " " : ""}${firstName}${lastName ? " " + lastName : ""}`;
    if (isSelf) {
      name += " (Self)";
    }
    
    return {
      id: u.id ?? u.user_id ?? u._id,
      salutation: salutation,
      name: name,
      phone: u.phone ?? "",
      email: u.email ?? "",
      designation: u.designation ?? "",
      department: u.department ?? "",
      raw: u,
      selfOnly: isSelf,
    };
  };

  // Presales Executive - can only assign to themselves
  if (role.includes("executive") && (dept === "presales" || dept === "presale")) {
    return [toExecutive(user, true)];
  }

  // Presales Manager - can assign to all presales executives
  if (role.includes("manager") && (dept === "presales" || dept === "presale")) {
    return salesUsers.map(u => toExecutive(u, false));
  }

  // Admin - can assign to all presales executives
  if (role.includes("admin")) {
    return salesUsers.map(u => toExecutive(u, false));
  }

  return [];
}