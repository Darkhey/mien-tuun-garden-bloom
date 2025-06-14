
import React, { useState, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

const AuthDialog: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  // Focus auf das erste Feld wenn Dialog öffnet
  const emailRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setForm({ email: "", password: "", confirm: "" });
    setErrors({});
    setNewsletter(false);
    setLoading(false);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email) newErrors.email = "Bitte E-Mail angeben";
    if (!form.password) newErrors.password = "Bitte Passwort angeben";
    if (!isLogin && form.password !== form.confirm)
      newErrors.confirm = "Passwörter stimmen nicht überein";
    if (!isLogin && form.password.length < 8)
      newErrors.password = "Mindestens 8 Zeichen!";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const valErrs = validate();
    if (Object.keys(valErrs).length > 0) {
      setErrors(valErrs);
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) {
        toast.error("Login fehlgeschlagen: " + error.message);
        setLoading(false);
        return;
      }
      toast.success("Login erfolgreich!");
      setOpen(false);
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (error) {
        toast.error("Registrierung fehlgeschlagen: " + error.message);
        setLoading(false);
        return;
      }
      toast.success("Bitte bestätige deine E-Mail für die Anmeldung.");
      // Newsletter separate Endpoint
      if (newsletter && form.email) {
        try {
          const res = await fetch("/functions/v1/send-newsletter-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.info("Newsletter: Bitte bestätige via Mail.");
          } else {
            toast.error("Newsletter: " + (data?.error || "Anmeldung nicht möglich."));
          }
        } catch {
          toast.error("Newsletter: Anmeldung aktuell nicht möglich.");
        }
      }
      setOpen(false);
    }
    setLoading(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setTimeout(() => emailRef.current?.focus(), 100); }}>
      <DialogTrigger asChild>
        {/* Das Child ist meist der Login/Reg Button im Header */}
        {children}
      </DialogTrigger>
      <DialogContent className="w-full max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2">
            {isLogin ? "Login" : "Konto anlegen"}
          </DialogTitle>
          <div className="flex justify-center gap-2 text-sm mb-4">
            <button
              className={`px-3 py-1 rounded-full font-medium transition-colors ${isLogin ? "bg-sage-600 text-white" : "text-sage-700 bg-sage-100 hover:bg-sage-200"}`}
              onClick={() => setIsLogin(true)}
              disabled={isLogin}
              type="button"
            >
              Login
            </button>
            <button
              className={`px-3 py-1 rounded-full font-medium transition-colors ${!isLogin ? "bg-sage-600 text-white" : "text-sage-700 bg-sage-100 hover:bg-sage-200"}`}
              onClick={() => setIsLogin(false)}
              disabled={!isLogin}
              type="button"
            >
              Registrieren
            </button>
          </div>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                autoFocus
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`${errors.email ? "border-destructive" : ""} pl-10`}
                ref={emailRef}
              />
              <Mail className="absolute left-2 top-2.5 h-5 w-5 text-sage-400" />
            </div>
            {errors.email && <div className="text-destructive text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <Label htmlFor="pw">Passwort</Label>
            <div className="relative">
              <Input
                id="pw"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`${errors.password ? "border-destructive" : ""} pl-10`}
                minLength={8}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <Lock className="absolute left-2 top-2.5 h-5 w-5 text-sage-400" />
            </div>
            {errors.password && <div className="text-destructive text-xs mt-1">{errors.password}</div>}
          </div>
          {!isLogin && (
            <div>
              <Label htmlFor="pw2">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="pw2"
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className={`${errors.confirm ? "border-destructive" : ""} pl-10`}
                  autoComplete="new-password"
                />
                <Lock className="absolute left-2 top-2.5 h-5 w-5 text-sage-400" />
              </div>
              {errors.confirm && <div className="text-destructive text-xs mt-1">{errors.confirm}</div>}
            </div>
          )}
          {!isLogin && (
            <div className="flex items-center gap-3 rounded-lg bg-sage-50 px-2 py-2">
              <Checkbox id="newsletter" checked={newsletter} onCheckedChange={v => setNewsletter(!!v)} />
              <Label htmlFor="newsletter" className="cursor-pointer text-sage-800 select-none">
                Garten-Newsletter abonnieren
                <span className="block text-xs text-sage-600 font-normal">Tipps, Ideen & Aktionen. Kein Spam!</span>
              </Label>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? <><Loader2 className="animate-spin mr-2" /> Bitte warten...</> : (isLogin ? "Login" : "Registrieren")}
          </Button>
        </form>
        <div className="text-center mt-3">
          <button
            className="text-primary hover:underline text-xs"
            type="button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Noch keinen Account? Jetzt registrieren."
              : "Bereits Account? Login hier."}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AuthDialog;

