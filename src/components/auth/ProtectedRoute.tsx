// components/auth/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';


interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

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

  // If roles were explicitly required for this route, enforce them first.
  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  const path = location.pathname;

  // Admin/Manager/Agent: full access
  if (hasRole(['admin', 'manager', 'agent'])) {
    return <>{children}</>;
  }

  // Buyer: only /buyer-dashboard/:id, AND must own that id
  if (hasRole('buyer')) {
    const buyerMatch = matchPath('/buyer-dashboard/:id', path);
    if (!buyerMatch || !buyerMatch.params?.id) {
      return <Navigate to="/" replace />;
    }

    const paramId = String(buyerMatch.params.id);
    const buyerId = user?.buyer_id != null ? String(user.buyer_id) : '';

    if (!buyerId || buyerId !== paramId) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  // Seller: only /seller-dashboard/:id, AND must own that id
  if (hasRole('seller')) {
    const sellerMatch = matchPath('/seller-dashboard/:id', path);
    if (!sellerMatch || !sellerMatch.params?.id) {
      return <Navigate to="/" replace />;
    }

    const paramId = String(sellerMatch.params.id);
    const sellerId = user?.seller_id != null ? String(user.seller_id) : '';

    if (!sellerId || sellerId !== paramId) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  // Any other role -> home
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
