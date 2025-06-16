import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types/admin";
import { X } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: AdminUser | null;
}

interface FormData {
  email: string;
  password: string;
  displayName: string;
  customRole: string;
  description: string;
  isPremium: boolean;
  roles: string[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUserUpdated, user }) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    displayName: "",
    customRole: "",
    description: "",
    isPremium: false,
    roles: []
  });
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: "",
        password: "",
        displayName: user.display_name || "",
        customRole: user.custom_role || "",
        description: user.description || "",
        isPremium: user.is_premium || false,
        roles: []
      });
      loadUserRoles(user.id);
    }
  }, [user]);

  const loadUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      
      const roles = data?.map(r => r.role) || [];
      setUserRoles(roles);
      setFormData(prev => ({ ...prev, roles }));
    } catch (error) {
      console.error("Error loading user roles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }

      const requestBody: any = {
        userId: user.id,
        profile: {
          display_name: formData.displayName,
          custom_role: formData.customRole || null,
          description: formData.description || null,
          is_premium: formData.isPremium
        },
        roles: formData.roles
      };

      // Only include email/password if they were changed
      if (formData.email.trim()) {
        requestBody.email = formData.email;
      }
      if (formData.password.trim()) {
        requestBody.password = formData.password;
      }

      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: requestBody
      });

      if (error) throw error;

      toast({
        title: "Benutzer aktualisiert",
        description: `Benutzer ${user.display_name} wurde erfolgreich aktualisiert.`,
      });

      onUserUpdated();
      onClose();

    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Benutzers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Benutzer bearbeiten: {user.display_name}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Neue E-Mail (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Leer lassen, um E-Mail unverändert zu lassen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Anzeigename</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort (optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Leer lassen, um Passwort unverändert zu lassen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customRole">Benutzerdefinierte Rolle</Label>
            <Select value={formData.customRole} onValueChange={(value) => setFormData(prev => ({ ...prev, customRole: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Rolle</SelectItem>
                <SelectItem value="Autor">Autor</SelectItem>
                <SelectItem value="Redakteur">Redakteur</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
                <SelectItem value="Koch">Koch</SelectItem>
                <SelectItem value="Gärtner">Gärtner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optionale Beschreibung des Benutzers"
            />
          </div>

          <div className="space-y-3">
            <Label>System-Rollen</Label>
            <div className="space-y-2">
              {['admin', 'moderator', 'user'].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={formData.roles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                  />
                  <Label htmlFor={role} className="text-sm font-normal capitalize">
                    {role === 'admin' ? 'Administrator' : role === 'moderator' ? 'Moderator' : 'Benutzer'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPremium"
              checked={formData.isPremium}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked as boolean }))}
            />
            <Label htmlFor="isPremium" className="text-sm font-normal">
              Premium-Benutzer
            </Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichere..." : "Änderungen speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
