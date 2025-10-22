import React from 'react';
import { Inbox, Activity } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-content">
        <Inbox size={64} className="empty-icon" aria-hidden="true" />
        <h3>No Activities Yet</h3>
        <p>Start browsing to track your screen time activities.</p>
        <p className="empty-hint">
          Your recent activities will appear here once you start using the browser extension.
        </p>
        <div className="empty-actions">
          <button className="primary-button">
            <Activity size={16} />
            Learn How It Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
