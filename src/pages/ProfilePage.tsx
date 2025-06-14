
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileForm from "../components/ProfileForm";
import { Loader2 } from "lucide-react";

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      if (!sessionData.session) {
        navigate("/"); // logout fallback, /auth gibt es ja nicht mehr
        return;
      }
      const userId = sessionData.session.user.id;
      // Erst versuchen auszulesen
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!data) {
        // Profil existiert nicht – versuche es jetzt zu erstellen
        const defaultName =
          sessionData.session.user.email?.split("@")[0] || "Nutzer";
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              display_name: defaultName,
            },
          ])
          .select()
          .maybeSingle();

        if (insertError) {
          setError(
            "Profil konnte nicht angelegt werden: " +
              (insertError.message || "Unbekannter Fehler")
          );
          setProfile(null);
        } else {
          setProfile(inserted);
        }
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate("/");
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin mr-2" /> Profil wird geladen...
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto p-8 text-center text-red-600">
        {error}
        <div className="text-sm text-gray-500 mt-4">
          Bitte versuche es später erneut oder kontaktiere den Support.
        </div>
      </div>
    );
  }
  if (!profile) return <div className="mx-auto p-8 text-center">Kein Profil gefunden.</div>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Dein Profil</h1>
      <ProfileForm profile={profile} onUpdate={setProfile} />
    </div>
  );
};

export default ProfilePage;
