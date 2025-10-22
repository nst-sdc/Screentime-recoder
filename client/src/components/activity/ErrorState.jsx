import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ error }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-state" role="alert" aria-live="assertive">
      <div className="error-content">
        <AlertCircle size={64} className="error-icon" aria-hidden="true" />
        <h3>Unable to Load Activities</h3>
        <p className="error-message">
          {error?.message || 'An unexpected error occurred while loading your activities.'}
        </p>
        <button className="retry-button" onClick={handleRetry}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
