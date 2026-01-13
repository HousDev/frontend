// // src/utils/roleBasedBuyerFilter.ts - FIXED VERSION
// import { User } from '@/contexts/AuthContext';

// export const filterBuyersByRole = (
//   user: User | null,
//   buyers: any[],
//   executives: any[],
//   includeUnassigned: boolean = false // नया parameter
// ): any[] => {
//   if (!user || !buyers || buyers.length === 0) return [];

//   const userRole = (user.role || '').toLowerCase();
//   const userDept = (user.department || '').toLowerCase();
//   const userId = String(user.id || '');

//   // Admin, Manager, SuperAdmin को सभी buyers दिखाएँ
//   const isAdmin = userRole.includes('admin') || userRole.includes('manager');
//   const isSuperUser = userRole.includes('superadmin') || userRole.includes('owner');
  
//   if (isAdmin || isSuperUser) {
//     return buyers; // सभी buyers return करें
//   }

//   // Sales Executive के लिए
//   const isExecutive =
//     userRole.includes('executive') ||
//     userDept.includes('sales') ||
//     userDept.includes('presales');

//   if (isExecutive) {
//     return buyers.filter(buyer => {
//       const assignedExecId = String(buyer.assigned_executive || '');
      
//       // 1. अपने assigned buyers
//       if (assignedExecId === userId) return true;
      
//       // 2. (Optional) Unassigned buyers
//       if (includeUnassigned && (!assignedExecId || assignedExecId === 'null' || assignedExecId === '')) {
//         return true;
//       }
      
//       return false;
//     });
//   }

//   // Default: empty array (no access)
//   return [];
// };

// src/utils/roleBasedBuyerFilter.ts
import { User } from '@/contexts/AuthContext';

export const filterBuyersByRole = (
  user: User | null,
  buyers: any[],
  executives: any[],
  includeUnassigned: boolean = false
) => {
  if (!user || !Array.isArray(buyers) || buyers.length === 0) return [];

  const userRole = (user.role || '').toLowerCase();
  const userId = String(user.id || '');

  // ✅ Admin / Manager / SuperAdmin → ALL buyers
  const isAdmin =
    userRole.includes('admin') ||
    userRole.includes('manager') ||
    userRole.includes('superadmin') ||
    userRole.includes('owner');

  if (isAdmin) {
    return buyers;
  }

  // ✅ STRICT Executive check (IMPORTANT)
  const isExecutive = userRole.includes('executive');

  if (isExecutive) {
    return buyers.filter(buyer => {
      const assignedExecId = String(buyer.assigned_executive ?? '');

      // 1️⃣ Assigned to me
      if (assignedExecId === userId) return true;

      // 2️⃣ Optional unassigned
      if (
        includeUnassigned &&
        (!assignedExecId || assignedExecId === 'null')
      ) {
        return true;
      }

      return false;
    });
  }

  // ❌ Others → no access
  return [];
};
