import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { useNotification } from "../hooks/useNotification";

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectPath = "/login",
  showNotification = true
}) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const notification = useNotification();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    if (showNotification) {
      notification.show('error', 'يجب تسجيل الدخول للوصول إلى هذه الصفحة');
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    notification.show('error', 'غير مصرح لك بالوصول إلى هذه الصفحة');
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
  showNotification: PropTypes.bool
};

export default ProtectedRoute;