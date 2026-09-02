// src/utils/guestViewTracker.ts

/**
 * Checks and records guest property views in localStorage against system settings limit.
 */
export const recordAndCheckGuestPropertyLimit = (
  propertyId?: number | string | null,
  user?: any,
  systemSettings?: any
): { isLocked: boolean; viewedCount: number; limit: number } => {
  // If user is logged in, no lock applies
  if (user && user.id) {
    return { isLocked: false, viewedCount: 0, limit: 999 };
  }

  // Check if token exists in localStorage as an extra check
  if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    return { isLocked: false, viewedCount: 0, limit: 999 };
  }

  const isEnabled = systemSettings?.enable_guest_property_limit !== false;
  const limit = Number(systemSettings?.guest_property_view_limit ?? 5);

  if (!isEnabled) {
    return { isLocked: false, viewedCount: 0, limit };
  }

  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('guest_viewed_properties') : null;
    const viewedIds: Array<string> = stored ? JSON.parse(stored) : [];

    // Add propertyId if provided and not yet tracked
    if (propertyId) {
      const pidStr = String(propertyId);
      if (!viewedIds.includes(pidStr)) {
        viewedIds.push(pidStr);
        if (typeof window !== 'undefined') {
          localStorage.setItem('guest_viewed_properties', JSON.stringify(viewedIds));
        }
      }
    }

    const isLocked = viewedIds.length > limit;
    return { isLocked, viewedCount: viewedIds.length, limit };
  } catch (e) {
    console.error('Guest view tracking error:', e);
    return { isLocked: false, viewedCount: 0, limit };
  }
};
