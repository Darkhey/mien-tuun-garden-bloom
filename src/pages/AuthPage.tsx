
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Login fehlgeschlagen: " + error.message);
      } else {
        toast.success("Login erfolgreich!");
        navigate("/profil");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (error) {
        toast.error("Registrierung fehlgeschlagen: " + error.message);
      } else {
        toast.success("Bitte E-Mail bestätigen, dann kannst du dich einloggen!");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xs mx-auto py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "Login" : "Registrieren"}
      </h1>
      <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pw">Passwort</Label>
          <Input id="pw" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Bitte warten..." : isLogin ? "Login" : "Registrieren"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        {isLogin ? (
          <button className="text-primary hover:underline" onClick={() => setIsLogin(false)}>
            Noch keinen Account? Jetzt registrieren.
          </button>
        ) : (
          <button className="text-primary hover:underline" onClick={() => setIsLogin(true)}>
            Bereits Account? Login hier.
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
