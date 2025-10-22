import React from 'react';
import { FileJson, FileSpreadsheet } from 'lucide-react';

const ActivityExport = ({ onExportCSV, onExportJSON, activityCount }) => {
  return (
    <div id="export-options" className="export-options" role="region" aria-label="Export Options">
      <p className="export-description">
        Export {activityCount} activities to your preferred format
      </p>
      <div className="export-buttons">
        <button
          className="export-button csv"
          onClick={onExportCSV}
          aria-label="Export activities as CSV"
        >
          <FileSpreadsheet size={20} />
          <span>Export as CSV</span>
        </button>
        <button
          className="export-button json"
          onClick={onExportJSON}
          aria-label="Export activities as JSON"
        >
          <FileJson size={20} />
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
};

export default ActivityExport;
