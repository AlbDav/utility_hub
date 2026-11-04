import { setVista, useVista, type Vista } from './vista';

const VISTE: { vista: Vista; etichetta: string }[] = [
  { vista: 'prova', etichetta: 'Prossima prova' },
  { vista: 'scene', etichetta: 'Scene' },
];

/** Selettore delle viste, nell'intestazione della pagina. */
export default function VistaTabs() {
  const attiva = useVista();
  return (
    <nav aria-label="Viste" className="grid grid-cols-2 overflow-hidden rounded-[10px] border-2 border-base-content">
      {VISTE.map(({ vista, etichetta }, i) => (
        <button
          key={vista}
          type="button"
          aria-pressed={attiva === vista}
          onClick={() => {
            setVista(vista);
            window.scrollTo({ top: 0 });
          }}
          className={`min-h-11 font-semibold ${i > 0 ? 'border-l-2 border-base-content' : ''} ${
            attiva === vista ? 'bg-base-content text-base-200' : 'bg-base-100'
          }`}
        >
          {etichetta}
        </button>
      ))}
    </nav>
  );
}
