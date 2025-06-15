
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { AdminUser } from "@/types/admin";

interface UsersViewProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onTogglePremium: (id: string, isPremium: boolean) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, loading, error, onTogglePremium }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Nutzer werden geladen...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Custom-Rolle</TableHead>
          <TableHead>Premium</TableHead>
          <TableHead>Erstellt</TableHead>
          <TableHead>Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.display_name}</TableCell>
            <TableCell>{user.custom_role || "-"}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={user.is_premium ? "default" : "outline"}
                onClick={() => onTogglePremium(user.id, user.is_premium)}
              >
                {user.is_premium ? "Premium" : "Standard"}
              </Button>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString('de-DE')}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersView;
