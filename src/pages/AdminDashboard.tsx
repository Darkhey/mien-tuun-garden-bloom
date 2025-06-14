
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  display_name: string;
  email?: string;
  is_premium: boolean;
  custom_role?: string | null;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    getUsers();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin mr-2" /> Nutzer werden geladen ...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead>
          <tr className="bg-sage-100 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Custom-Rolle</th>
            <th className="p-2">Premium</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b last:border-none">
              <td className="p-2">{u.display_name}</td>
              <td className="p-2">{u.custom_role || "-"}</td>
              <td className="p-2">{u.is_premium ? "Ja" : "Nein"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

export default AdminDashboard;
