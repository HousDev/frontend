export function filterLeadsByRole(user: any, allLeads: any[], presalesUsers: any[]) {
    const role = (user?.role || "").toLowerCase();
    const dept = (user?.department || "").toLowerCase();

    // Executive (Presales) → सिर्फ खुद के leads
    if (role === "executive" && dept === "presales") {
        return allLeads.filter(l => String(l.assigned_executive) === String(user.id));
    }

    // Manager (Presales) → presales executives के सारे leads
    if (role === "manager" && dept === "presales") {
        const presalesExecIds = presalesUsers
            .filter(u => (u.role || "").toLowerCase() === "executive")
            .map(u => String(u.id));

        return allLeads.filter(l => presalesExecIds.includes(String(l.assigned_executive)));
    }

    // Admin (Admin) → सारे leads दिखने चाहिए
    if (role === "admin") {
        return allLeads;
    }

    // Default → कोई restriction नहीं
    return allLeads;
}
