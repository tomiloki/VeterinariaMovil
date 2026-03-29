import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PagoReturn() {
  const { search }   = useLocation();
  const navigate      = useNavigate();
  const [msg, setMsg] = useState('Confirmando pago…');

  useEffect(() => {
    const params   = new URLSearchParams(search);
    const token_ws = params.get('token_ws');
    if (!token_ws) {
      setMsg('token_ws faltante'); return;
    }

    (async () => {
      try {
        // NO usamos fetchWithAuth: este endpoint es público
        const raw  = await fetch('/api/pago/commit/', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ token_ws }),
        });
        const data = await raw.json();

        if (raw.status === 200) {
          navigate('/reservar/confirmar', { state: data });
          return;
        }
        throw new Error(data.detail);
      } catch (e) {
        console.error(e);
        setMsg('No se pudo confirmar el pago.');
      }
    })();
  }, [search, navigate]);

  return <h2 style={{ textAlign: 'center' }}>{msg}</h2>;
}
