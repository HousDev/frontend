// // utils/roleBasedOptions.ts
// export function getAssignableExecutives(user: any, presalesUsers: any[]) {
  

//   const role = (user?.role || "").toLowerCase();
//   const dept = (user?.department || "").toLowerCase();

//   // ✅ Executive (Presales) → सिर्फ खुद
//   if (role === "executive" && dept === "presales") {
//     return [{
//       id: user.id,
//       name: `${user.first_name || ""} ${user.last_name || ""}`,
//       selfOnly: true
//     }];
//   }

//   // ✅ Manager (Presales) → सभी presales executives
//   if (role === "manager" && dept === "presales") {
//     return presalesUsers
//       .filter((u: any) => (u.role || "").toLowerCase() === "executive")
//       .map((u: any) => ({
//         id: u.id,
//         name: `${u.first_name || ""} ${u.last_name || ""}`,
//         selfOnly: false
//       }));
//   }

//   // ✅ Admin (Presales) → सभी presales executives
//   if (role === "admin" && dept === "admin") {
//     return presalesUsers
//       .filter((u: any) => (u.role || "").toLowerCase() === "executive")
//       .map((u: any) => ({
//         id: u.id,
//         name: `${u.first_name || ""} ${u.last_name || ""}`,
//         selfOnly: false
//       }));
//   }

//   // ✅ Default → कोई नहीं
//   return [];
// }



// utils/roleBasedOptions.ts
export function getAssignableExecutives(user: any, presalesUsers: any[]) {
  const norm = (s: any) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-_/]+/g, ""); // "Pre Sales" -> "presales"

  const role = norm(user?.role);
  const dept = norm(user?.department);

  // Executive (Presales) → सिर्फ खुद
  if (role === "executive" && dept === "presales") {
    return [{
      id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      selfOnly: true,
    }];
  }

  // Manager (Presales) → सभी presales executives
  if (role === "manager" && dept === "presales") {
    return presalesUsers.map((u: any) => ({
      id: u.id,
      name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      selfOnly: false,
    }));
  }

  // Admin → सभी presales executives (department कुछ भी हो तो भी)
  if (role === "admin") {
    return presalesUsers.map((u: any) => ({
      id: u.id,
      name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      selfOnly: false,
    }));
  }

  // Default → खाली
  return [];
}
