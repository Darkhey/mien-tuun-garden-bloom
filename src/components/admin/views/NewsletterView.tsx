import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewsletterView: React.FC = () => {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const confirmed = subscribers?.filter((s) => s.confirmed).length ?? 0;
  const unconfirmed = (subscribers?.length ?? 0) - confirmed;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Newsletter-Verwaltung</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{subscribers?.length ?? 0}</p><p className="text-sm text-muted-foreground">Gesamt</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{confirmed}</p><p className="text-sm text-muted-foreground">Bestätigt</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{unconfirmed}</p><p className="text-sm text-muted-foreground">Unbestätigt</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Abonnenten</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Lade...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Angemeldet am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>
                      {sub.confirmed ? (
                        <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Bestätigt</Badge>
                      ) : (
                        <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Ausstehend</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(sub.created_at).toLocaleDateString("de-DE")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterView;
