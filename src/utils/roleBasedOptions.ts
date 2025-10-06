

// // utils/roleBasedOptions.ts
// export function getAssignableExecutives(user: any, presalesUsers: any[]) {
//   const norm = (s: any) =>
//     (s ?? "")
//       .toString()
//       .trim()
//       .toLowerCase()
//       .replace(/[\s-_/]+/g, ""); // "Pre Sales" -> "presales"

//   const role = norm(user?.role);
//   const dept = norm(user?.department);

//   // Executive (Presales) → सिर्फ खुद
//   if (role === "executive" && dept === "presales") {
//     return [{
//       id: user.id,
//       name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
//       selfOnly: true,
//     }];
//   }

//   // Manager (Presales) → सभी presales executives
//   if (role === "manager" && dept === "presales") {
//     return presalesUsers.map((u: any) => ({
//       id: u.id,
//       name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
//       selfOnly: false,
//     }));
//   }

//   // Admin → सभी presales executives (department कुछ भी हो तो भी)
//   if (role === "admin") {
//     return presalesUsers.map((u: any) => ({
//       id: u.id,
//       name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
//       selfOnly: false,
//     }));
//   }

//   // Default → खाली
//   return [];
// }

// utils/roleBasedOptions.ts
export function getAssignableExecutives(
  user: any,
  salesUsers: any[] // filtered list: role=executive, department=sales
) {
  const norm = (s: any) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-_/]+/g, "");

  const role = norm(
    user?.role || user?.user_role || user?.userRole || user?.position || user?.job_title || ""
  );

  const dept = norm(
    user?.department || user?.dept || user?.department_name || user?.departmentName || ""
  );

  const toExecutive = (u: any) => ({
    id: u.id ?? u.user_id ?? u._id,
    salutation: u.salutation ?? "", // ✅ added this line
    name:
      `${u.salutation ? u.salutation + " " : ""}${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
      u.name ||
      u.full_name ||
      u.username ||
      u.email ||
      "Executive",
    phone: u.phone ?? u.mobile ?? u.whatsapp ?? "",
    email: u.email ?? "",
    designation: u.designation ?? "",
    department: u.department ?? "",
    raw: u,
    selfOnly: false,
  });

  // Executive (Sales) → sirf khud
  if (role === "executive" && dept === "sales") {
    return [
      {
        ...toExecutive(user),
        selfOnly: true,
      },
    ];
  }

  // Manager (Sales) → sab sales executives
  if (role === "manager" && dept === "sales") {
    return salesUsers.map(toExecutive);
  }

  // Admin → sab sales executives
  if (role === "admin") {
    return salesUsers.map(toExecutive);
  }

  // Fallback → sab sales executives
  return salesUsers.map(toExecutive);
}
