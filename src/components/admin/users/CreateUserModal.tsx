
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
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

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          profile: {
            display_name: formData.displayName || formData.email.split('@')[0],
            custom_role: formData.customRole || null,
            description: formData.description || null,
            is_premium: formData.isPremium
          },
          roles: formData.roles
        }
      });

      if (error) throw error;

      toast({
        title: "Benutzer erstellt",
        description: `Benutzer ${formData.email} wurde erfolgreich erstellt.`,
      });

      // Reset form and close modal
      setFormData({
        email: "",
        password: "",
        displayName: "",
        customRole: "",
        description: "",
        isPremium: false,
        roles: []
      });
      
      onUserCreated();
      onClose();

    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Erstellen des Benutzers",
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

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Neuen Benutzer erstellen
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Anzeigename</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Wird aus E-Mail generiert, falls leer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort *</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generieren
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customRole">Benutzerdefinierte Rolle</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, customRole: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
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
              {loading ? "Erstelle..." : "Benutzer erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
