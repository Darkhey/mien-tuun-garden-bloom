
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/functions/v1/send-contact-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Nachricht gesendet", description: "Danke für deine Nachricht! Ich melde mich bald." });
        setForm({ name: "", email: "", message: "" });
      } else {
        toast({ title: "Fehler", description: data?.error || "Nachricht konnte nicht gesendet werden.", variant: "destructive"});
      }
    } catch (err) {
      toast({ title: "Fehler", description: "Nachricht konnte nicht gesendet werden.", variant: "destructive"});
    }
    setLoading(false);
  };

  return (
    <Layout title="Kontakt">
      <section className="max-w-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-serif font-bold text-earth-800 mb-2">Kontaktformular</h1>
        <p className="text-earth-600 mb-8">
          Du hast Fragen, Feedback oder möchtest einfach Hallo sagen? Füll das Formular aus –
          ich antworte dir so schnell wie möglich!
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block mb-1 text-earth-700 font-medium">Dein Name</label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-earth-700 font-medium">Deine E-Mail</label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 text-earth-700 font-medium">Nachricht</label>
            <Textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Wird gesendet..." : "Absenden"}
          </Button>
        </form>
      </section>
    </Layout>
  );
};
export default ContactPage;
