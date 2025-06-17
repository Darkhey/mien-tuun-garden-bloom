
import React from "react";
import { Activity } from "lucide-react";
import SystemDiagnosticsDashboard from "../SystemDiagnosticsDashboard";

const SystemDiagnosticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Diagnostics</h1>
          <p className="text-gray-600">Umfassende KI-System-Performance-Analyse und Monitoring</p>
        </div>
      </div>

      <SystemDiagnosticsDashboard />
    </div>
  );
};

export default SystemDiagnosticsView;
