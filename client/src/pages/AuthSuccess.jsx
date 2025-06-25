import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(
    () => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigate("/dashboard");
        } else {
          navigate("/login?error=authentication_failed");
        }
      }
    },
    [isAuthenticated, isLoading, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121b22]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-white">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess;
