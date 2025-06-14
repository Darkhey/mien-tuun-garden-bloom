
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const NewsletterSignup: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/functions/v1/send-newsletter-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Fast geschafft!",
          description: "Bitte bestätige deine Anmeldung in der E-Mail, die wir gerade geschickt haben.",
        });
        setEmail("");
      } else {
        toast({
          title: "Fehler",
          description: data?.error || "Anmeldung nicht möglich. Evtl. ist die E-Mail schon eingetragen.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Anmeldung nicht möglich.",
        variant: "destructive"
      });
    }
    setSending(false);
  };

  return (
    <form className={compact ? "flex gap-2 items-center" : "space-y-4"} onSubmit={handleSubmit}>
      <Input
        type="email"
        name="email"
        placeholder="Deine E-Mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={compact ? "w-48" : ""}
        autoComplete="email"
        disabled={sending}
      />
      <Button type="submit" disabled={sending || email.length < 5}>
        {sending ? "Wird gesendet..." : "Anmelden"}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
