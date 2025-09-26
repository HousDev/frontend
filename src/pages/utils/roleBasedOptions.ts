

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
export function getAssignableExecutives(user: any, presalesUsers: any[]) {
  const norm = (s: any) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-_/]+/g, "");

  // Multiple possible field names check करें
  const role = norm(
    user?.role || 
    user?.user_role || 
    user?.userRole || 
    user?.position || 
    user?.job_title || 
    ""
  );
  
  const dept = norm(
    user?.department || 
    user?.dept || 
    user?.department_name || 
    user?.departmentName ||
    ""
  );

  // Debug logging
  console.log("🔍 getAssignableExecutives Debug:", {
    userRole: role,
    userDept: dept,
    originalUser: user,
    presalesUsersCount: presalesUsers.length
  });

  // Executive (Presales) → सिर्फ खुद
  if (role === "executive" && dept === "presales") {
    // console.log("✅ Executive access - showing self only");
    return [{
      id: user.id,
      name: user.name || user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Self",
      selfOnly: true,
    }];
  }

  // Manager (Presales) → सभी presales executives
  if (role === "manager" && dept === "presales") {
    // console.log("✅ Manager access - showing all presales executives");
    return presalesUsers.map((u: any) => ({
      id: u.id,
      name: u.name || u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Executive",
      selfOnly: false,
    }));
  }

  // Admin → सभी presales executives
  if (role === "admin") {
    // console.log("✅ Admin access - showing all presales executives");
    return presalesUsers.map((u: any) => ({
      id: u.id,
      name: u.name || u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Executive",
      selfOnly: false,
    }));
  }

  // Default → सभी executives (fallback - यह हटा सकते हैं)
  // console.log("⚠️ No role match - showing all executives as fallback");
  return presalesUsers.map((u: any) => ({
    id: u.id,
    name: u.name || u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Executive",
    selfOnly: false,
  }));
}