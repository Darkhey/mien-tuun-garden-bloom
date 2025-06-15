
import React, { useState, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthToggleButtons from "./auth/AuthToggleButtons";
import AuthForm from "./auth/AuthForm";

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
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto sm:w-full">
        <div className="flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-center text-xl font-bold mb-3">
              {isLogin ? "Login" : "Konto anlegen"}
            </DialogTitle>
            <AuthToggleButtons isLogin={isLogin} onToggle={setIsLogin} />
          </DialogHeader>

          <AuthForm
            isLogin={isLogin}
            loading={loading}
            form={form}
            errors={errors}
            newsletter={newsletter}
            emailRef={emailRef}
            onFormChange={setForm}
            onNewsletterChange={setNewsletter}
            onSubmit={handleSubmit}
          />
          
          <div className="text-center mt-4">
            <button
              className="text-primary hover:underline text-sm"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Noch keinen Account? Jetzt registrieren."
                : "Bereits Account? Login hier."}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
