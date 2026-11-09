import { useEffect, useState } from 'react';
import { aIso } from '../../lib/dates';

const mezzanotte = () => {
  const ora = new Date();
  return new Date(ora.getFullYear(), ora.getMonth(), ora.getDate());
};

/**
 * La data di oggi, a mezzanotte. Si ricontrolla quando si torna sulla pagina:
 * l'app resta aperta sul telefono per giorni, e a mezzanotte deve cambiare
 * giorno da sola invece di restare su quello di ieri.
 */
export function useOggi(): Date {
  const [oggi, setOggi] = useState(mezzanotte);

  useEffect(() => {
    const controlla = () => {
      const adesso = mezzanotte();
      setOggi((precedente) => (aIso(precedente) === aIso(adesso) ? precedente : adesso));
    };
    document.addEventListener('visibilitychange', controlla);
    window.addEventListener('focus', controlla);
    return () => {
      document.removeEventListener('visibilitychange', controlla);
      window.removeEventListener('focus', controlla);
    };
  }, []);

  return oggi;
}
