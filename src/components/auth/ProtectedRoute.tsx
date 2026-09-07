// // components/auth/ProtectedRoute.tsx
// import React, { ReactNode } from 'react';
// import { Navigate, useLocation, matchPath } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';


// interface ProtectedRouteProps {
//   children: ReactNode;
//   roles?: string[];
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
//   const { user, loading, isAuthenticated, hasRole } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If roles were explicitly required for this route, enforce them first.
//   if (roles && !hasRole(roles)) {
//     return <Navigate to="/" replace />;
//   }

//   const path = location.pathname;

//   // Admin/Manager/Agent: full access
//   if (hasRole(['admin', 'manager', 'agent'])) {
//     return <>{children}</>;
//   }

//   // Buyer: only /buyer-dashboard/:id, AND must own that id
//   if (hasRole('buyer')) {
//     const buyerMatch = matchPath('/buyer-dashboard/:id', path);
//     if (!buyerMatch || !buyerMatch.params?.id) {
//       return <Navigate to="/" replace />;
//     }

//     const paramId = String(buyerMatch.params.id);
//     const buyerId = user?.buyer_id != null ? String(user.buyer_id) : '';

//     if (!buyerId || buyerId !== paramId) {
//       return <Navigate to="/" replace />;
//     }

//     return <>{children}</>;
//   }

//   // Seller: only /seller-dashboard/:id, AND must own that id
//   if (hasRole('seller')) {
//     const sellerMatch = matchPath('/seller-dashboard/:id', path);
//     if (!sellerMatch || !sellerMatch.params?.id) {
//       return <Navigate to="/" replace />;
//     }

//     const paramId = String(sellerMatch.params.id);
//     const sellerId = user?.seller_id != null ? String(user.seller_id) : '';

//     if (!sellerId || sellerId !== paramId) {
//       return <Navigate to="/" replace />;
//     }

//     return <>{children}</>;
//   }

//   // Any other role -> home
//   return <Navigate to="/" replace />;
// };

// export default ProtectedRoute;



// // components/auth/ProtectedRoute.tsx
// import React, { ReactNode } from 'react';
// import { Navigate, useLocation, matchPath } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

// interface ProtectedRouteProps {
//   children: ReactNode;
//   roles?: string[];
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
//   const { user, loading, isAuthenticated, hasRole } = useAuth();
//   const location = useLocation();
//   const path = location.pathname;

//   // ✅ 1) PUBLIC ALLOWLIST — bypass auth/roles for e-Sign routes
//   const isEsignPublic =
//     !!matchPath('/session/:id', path) ||         // the e-Sign session page
//     !!matchPath('/artifacts/:id', path);        // optional: signed PDF/audit links

//   if (isEsignPublic) {
//     // No spinner, no auth redirect — completely public
//     return <>{children}</>;
//   }

//   // (rest stays as-is)

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If roles were explicitly required for this route, enforce them first.
//   if (roles && !hasRole(roles)) {
//     return <Navigate to="/" replace />;
//   }

//   // Admin/Manager/Agent: full access
//   if (hasRole(['admin', 'manager', 'agent'])) {
//     return <>{children}</>;
//   }

//   // Buyer: only /buyer-dashboard/:id, AND must own that id
//   if (hasRole('buyer')) {
//     const buyerMatch = matchPath('/buyer-dashboard/:id', path);
//     if (!buyerMatch || !buyerMatch.params?.id) {
//       return <Navigate to="/" replace />;
//     }
//     const paramId = String(buyerMatch.params.id);
//     const buyerId = user?.buyer_id != null ? String(user.buyer_id) : '';
//     if (!buyerId || buyerId !== paramId) {
//       return <Navigate to="/" replace />;
//     }
//     return <>{children}</>;
//   }

//   // Seller: only /seller-dashboard/:id, AND must own that id
//   if (hasRole('seller')) {
//     const sellerMatch = matchPath('/seller-dashboard/:id', path);
//     if (!sellerMatch || !sellerMatch.params?.id) {
//       return <Navigate to="/" replace />;
//     }
//     const paramId = String(sellerMatch.params.id);
//     const sellerId = user?.seller_id != null ? String(user.seller_id) : '';
//     if (!sellerId || sellerId !== paramId) {
//       return <Navigate to="/" replace />;
//     }
//     return <>{children}</>;
//   }

//   // Any other role -> home
//   return <Navigate to="/" replace />;
// };

// export default ProtectedRoute;

// components/auth/ProtectedRoute.tsx
import React, { ReactNode } from "react";
import { Navigate, useLocation, matchPath } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // PUBLIC: e-Sign routes
  const isEsignPublic =
    !!matchPath("/session/:id", path) ||
    !!matchPath("/artifacts/:id", path);

  if (isEsignPublic) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route explicitly requires certain roles
  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  // ADMIN GROUP → Full Access
  if (hasRole(["admin", "manager", "agent"])) {
    return <>{children}</>;
  }

  // ✔ NEW ADD: Marketing, Sales, Presales Executive → Allow Dashboard Access
  if (
    hasRole([
      "marketing executive",
      "sales executive",
      "presales executive"
    ])
  ) {
    return <>{children}</>;
  }

  // Buyer: allow /dashboard/buyers-account/:id and /buyer-dashboard/:id
  if (hasRole("buyer")) {
    const targetId = String(user?.buyer_id || user?.id || "1");
    if (path.startsWith("/dashboard/buyers-account") || path.startsWith("/buyer-dashboard")) {
      return <>{children}</>;
    }
    return <Navigate to={`/buyer-dashboard/${targetId}`} replace />;
  }

  // Tenant: allow /tenant-dashboard/:id and /dashboard/tenants-account/:id
  if (hasRole("tenant")) {
    const targetId = String((user as any)?.tenant_id || user?.id || "1");
    if (path.startsWith("/dashboard/tenants-account") || path.startsWith("/tenant-dashboard")) {
      return <>{children}</>;
    }
    return <Navigate to={`/tenant-dashboard/${targetId}`} replace />;
  }

  // Seller: allow /dashboard/sellers-account/:id and /seller-dashboard/:id
  if (hasRole("seller")) {
    const targetId = String(user?.seller_id || user?.id || "1");
    if (path.startsWith("/dashboard/sellers-account") || path.startsWith("/seller-dashboard")) {
      return <>{children}</>;
    }
    return <Navigate to={`/seller-dashboard/${targetId}`} replace />;
  }

  // Owner: allow /owner-dashboard, /owner-dashboard/:id and /dashboard/owners-account/:id
  if (hasRole("owner")) {
    const targetId = String((user as any)?.owner_id || user?.id || "1");
    if (path.startsWith("/dashboard/owners-account") || path.startsWith("/owner-dashboard")) {
      return <>{children}</>;
    }
    return <Navigate to={`/owner-dashboard/${targetId}`} replace />;
  }

  // Broker: redirect to /properties
  if (hasRole("broker")) {
    if (path === "/properties" || path.startsWith("/properties/")) {
      return <>{children}</>;
    }
    return <Navigate to="/properties" replace />;
  }

  // Anything else → allow or redirect
  return <>{children}</>;
};

export default ProtectedRoute;
