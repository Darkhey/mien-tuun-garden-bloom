
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, UserPlus, Trash2 } from "lucide-react";
import { AdminUser } from "@/types/admin";
import CreateUserModal from "../users/CreateUserModal";
import EditUserModal from "../users/EditUserModal";

interface UsersViewProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onTogglePremium: (id: string, isPremium: boolean) => void;
  onDeleteUser: (id: string) => void;
  onRefresh: () => void;
}

const UsersView: React.FC<UsersViewProps> = ({ 
  users, 
  loading, 
  error, 
  onTogglePremium, 
  onDeleteUser,
  onRefresh 
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Möchten Sie den Benutzer "${user.display_name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      onDeleteUser(user.id);
    }
  };

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
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Benutzerverwaltung</h2>
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Neuen Benutzer erstellen
          </Button>
        </div>

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
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={onRefresh}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={onRefresh}
        user={selectedUser}
      />
    </>
  );
};

export default UsersView;
