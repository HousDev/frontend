import { User } from '@/contexts/AuthContext';

export const filterLeadsByRole = (
  user: User | null,
  leads: any[],
  allUsers: any[] = []
): any[] => {
  if (!user) return [];

  const userRole = (user.role || '').toLowerCase();
  const userDept = (user.department || '').toLowerCase();
  const userId = String(user.id|| '');

  // 1. Super Admin / Admin - सभी leads दिखें
  if (userRole.includes('admin') || userRole.includes('super') || userRole.includes('owner') || userRole === 'all') {
    return leads;
  }

  // 2. Presales Executive - केवल अपनी assigned leads
  if (userDept.includes('presales') && userRole.includes('executive')) {
    return leads.filter((lead) => {
      // यदि lead assigned है
      if (lead.assigned_executive) {
        return String(lead.assigned_executive) === userId;
      }
      // Unassigned leads न दिखें
      return false;
    });
  }

  // 3. Presales Manager - अपनी team की सभी leads + unassigned leads
  if (userDept.includes('presales') && userRole.includes('manager')) {
    // अपने under के executives ढूंढें
    const teamExecutives = allUsers.filter((u: any) => {
      const uDept = (u.department || '').toLowerCase();
      const uRole = (u.role || '').toLowerCase();
      const uManagerId = String(u.reports_to || u.manager_id || '');
      
      return (
        uDept.includes('presales') && 
        uRole.includes('executive') &&
        uManagerId === userId
      );
    });

    const teamExecutiveIds = teamExecutives.map((e: any) => 
      String(e.id || e._id || e.user_id || '')
    );

    return leads.filter((lead) => {
      // Unassigned leads
      if (!lead.assigned_executive || lead.assigned_executive === '') {
        return true;
      }
      
      // अपनी team की assigned leads
      return teamExecutiveIds.includes(String(lead.assigned_executive)) ||
             String(lead.assigned_executive) === userId;
    });
  }

  // 4. Sales Executive - केवल अपनी assigned leads
  if (userDept.includes('sales') && userRole.includes('executive')) {
    return leads.filter((lead) => {
      if (lead.assigned_executive) {
        return String(lead.assigned_executive) === userId;
      }
      return false;
    });
  }

  // 5. Sales Manager - अपनी team की leads
  if (userDept.includes('sales') && userRole.includes('manager')) {
    const teamExecutives = allUsers.filter((u: any) => {
      const uDept = (u.department || '').toLowerCase();
      const uRole = (u.role || '').toLowerCase();
      const uManagerId = String(u.reports_to || u.manager_id || '');
      
      return (
        uDept.includes('sales') && 
        uRole.includes('executive') &&
        uManagerId === userId
      );
    });

    const teamExecutiveIds = teamExecutives.map((e: any) => 
      String(e.id || e._id || e.user_id || '')
    );

    return leads.filter((lead) => {
      if (!lead.assigned_executive || lead.assigned_executive === '') {
        return true;
      }
      return teamExecutiveIds.includes(String(lead.assigned_executive)) ||
             String(lead.assigned_executive) === userId;
    });
  }

  // 6. Default: केवल अपनी created leads
  return leads.filter((lead) => 
    String(lead.created_by) === userId
  );
};