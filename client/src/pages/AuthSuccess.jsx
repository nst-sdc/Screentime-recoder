import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, token } = useAuth();

  useEffect(
    () => {
      if (!isLoading) {
        if (isAuthenticated && token) {
          // Send token to extension
          try {
            chrome.runtime.sendMessage(
              process.env.REACT_APP_EXTENSION_ID || "your-extension-id",
              {
                type: "AUTH_SUCCESS",
                token: token
              },
              response => {
                if (chrome.runtime.lastError) {
                  console.log(
                    "Extension not found or not responding:",
                    chrome.runtime.lastError
                  );
                } else {
                  console.log(
                    "Token sent to extension successfully:",
                    response
                  );
                }
                // Navigate to dashboard regardless
                navigate("/dashboard");
              }
            );
          } catch (error) {
            console.log("Error communicating with extension:", error);
            // Navigate to dashboard even if extension communication fails
            navigate("/dashboard");
          }
        } else {
          navigate("/login?error=authentication_failed");
        }
      }
    },
    [isAuthenticated, isLoading, token, navigate]
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
