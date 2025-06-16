
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import SecurityAuditLog from "../SecurityAuditLog";

const SecurityLogView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sicherheits-Log</h1>
          <p className="text-gray-600">Überwache Sicherheitsereignisse und verdächtige Aktivitäten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Sicherheitsstatus</p>
                <p className="text-lg font-semibold">Sicher</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Warnungen heute</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Letzte Prüfung</p>
                <p className="text-lg font-semibold">Vor 5 Min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SecurityAuditLog />
    </div>
  );
};

export default SecurityLogView;
