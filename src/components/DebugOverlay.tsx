import React, { useState } from 'react';
import { useEventLogger } from '@/hooks/useEventLogger';
import { supabase } from '@/integrations/supabase/client';

const DebugOverlay: React.FC = () => {
  const { logs, log } = useEventLogger();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      log(`LOGIN ERROR: ${error.message}`);
    } else {
      log('LOGIN SUCCESS');
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-2 rounded"
      >
        Debug
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded p-4 shadow-lg text-sm">
            <h2 className="text-lg font-bold mb-2">Debug Login</h2>
            <form onSubmit={handleLogin} className="space-y-2">
              <input
                type="email"
                placeholder="email"
                className="w-full border px-2 py-1"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="password"
                className="w-full border px-2 py-1"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-600 text-white py-1 rounded"
              >
                {loading ? '...' : 'Login'}
              </button>
            </form>
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold">Logs</span>
              <button
                className="underline"
                onClick={() => navigator.clipboard.writeText(logs.join('\n'))}
              >
                Kopieren
              </button>
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border p-2">
              {logs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugOverlay;
