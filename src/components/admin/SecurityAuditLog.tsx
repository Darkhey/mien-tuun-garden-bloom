import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Eye, Trash2, Loader2 } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  target_user_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityAuditLog: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data to handle IP address type
      const transformedEvents: SecurityEvent[] = (data || []).map(event => ({
        ...event,
        ip_address: event.ip_address ? String(event.ip_address) : null,
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'user_created': return 'Benutzer erstellt';
      case 'user_updated': return 'Benutzer aktualisiert';
      case 'user_deleted': return 'Benutzer gelöscht';
      case 'login_attempt': return 'Anmeldeversuch';
      case 'permission_denied': return 'Zugriff verweigert';
      default: return eventType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheits-Audit-Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin mr-2" />
            Lade Sicherheitsereignisse...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sicherheits-Audit-Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Sicherheitsereignisse gefunden.</p>
            <p className="text-sm mt-2">Das ist ein gutes Zeichen! 🛡️</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <span className="font-medium">{getEventTypeLabel(event.event_type)}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(event.created_at).toLocaleString('de-DE')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {event.ip_address && <span>IP: {event.ip_address}</span>}
                  {event.user_id && <span className="ml-4">User: {event.user_id}</span>}
                  {event.target_user_id && <span className="ml-4">Target: {event.target_user_id}</span>}
                </div>
                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Implementierte Sicherheitsmaßnahmen:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• RLS-Richtlinien für alle Datenbanktabellen aktiviert</li>
            <li>• Admin-only Zugriff auf Benutzerverwaltung</li>
            <li>• Sicherheits-Audit-Logging für kritische Aktionen</li>
            <li>• Öffentlicher Zugriff nur auf veröffentlichte Inhalte</li>
            <li>• Rate-Limiting für Edge Functions implementiert</li>
            <li>• Input-Validierung und Sanitization in Edge Functions</li>
            <li>• Benutzer können nur ihre eigenen Daten verwalten</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
