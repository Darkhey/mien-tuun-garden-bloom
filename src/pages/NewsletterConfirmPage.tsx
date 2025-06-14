
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "react-router-dom";

const NewsletterConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      return;
    }
    fetch(`/functions/v1/newsletter-confirm?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => setStatus(data.success ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [email, token]);

  return (
    <Layout title="Newsletter-Bestätigung">
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        {status === "loading" && <p>Bestätige Anmeldung...</p>}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Danke für die Bestätigung!</h1>
            <p className="mb-4">Deine Anmeldung ist nun abgeschlossen. Willkommen im Newsletter von Mien Tuun 🌸</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-destructive">Bestätigung fehlgeschlagen</h1>
            <p className="mb-4">Bitte prüfe den Link oder registriere dich erneut.</p>
          </>
        )}
      </div>
    </Layout>
  );
};
export default NewsletterConfirmPage;
