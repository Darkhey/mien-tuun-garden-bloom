
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";
import AuthNewsletterCheckbox from "./AuthNewsletterCheckbox";

type AuthFormProps = {
  isLogin: boolean;
  loading: boolean;
  form: { email: string; password: string; confirm: string };
  errors: { email?: string; password?: string; confirm?: string };
  newsletter: boolean;
  emailRef: React.RefObject<HTMLInputElement>;
  onFormChange: (form: { email: string; password: string; confirm: string }) => void;
  onNewsletterChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  loading,
  form,
  errors,
  newsletter,
  emailRef,
  onFormChange,
  onNewsletterChange,
  onSubmit
}) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="email">E-Mail</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoFocus
            value={form.email}
            onChange={e => onFormChange({ ...form, email: e.target.value })}
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
            onChange={e => onFormChange({ ...form, password: e.target.value })}
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
              onChange={e => onFormChange({ ...form, confirm: e.target.value })}
              className={`${errors.confirm ? "border-destructive" : ""} pl-10`}
              autoComplete="new-password"
            />
            <Lock className="absolute left-2 top-2.5 h-5 w-5 text-sage-400" />
          </div>
          {errors.confirm && <div className="text-destructive text-xs mt-1">{errors.confirm}</div>}
        </div>
      )}
      
      {!isLogin && (
        <AuthNewsletterCheckbox
          checked={newsletter}
          onCheckedChange={onNewsletterChange}
        />
      )}

      <Button type="submit" disabled={loading} className="w-full mt-4">
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
            Bitte warten...
          </>
        ) : (
          isLogin ? "Login" : "Registrieren"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
