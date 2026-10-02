import { MotionConfig } from "motion/react";
import { useReducedMotionSafe } from "@/lib/motion";
import { useEffect, useState } from "react";

const USER_MSG = "Necesito un nombre para nuestra nueva bebida de té frío con limón.";

const PERSONAS = [
  {
    id: "creativo",
    label: "Director creativo",
    system:
      "Eres el director creativo de una agencia joven. Propones ideas atrevidas, con humor y juegos de palabras. Respondes en tono informal y breve.",
    answer:
      "¡Me encanta el briefing! Tres propuestas:\n1. **Limonazo Frío** — directo y con chispa.\n2. **TéLimón** — suena a «teléfono», fácil de recordar y muy compartible.\n3. **Escalofrío Cítrico** — para una campaña de verano con mucho humor.\nMi favorita: TéLimón. ¿Lo llevamos a moodboard?",
  },
  {
    id: "legal",
    label: "Asesor de marcas",
    system:
      "Eres un asesor de propiedad industrial. Antes de proponer, adviertes de los riesgos de registro y confusión con marcas existentes. Tono formal y prudente.",
    answer:
      "Puedo sugerir opciones, pero antes de usarlas conviene una búsqueda de anterioridades en la OEPM y la EUIPO:\n1. **Citrea Infusión** — término descriptivo débil; más difícil de proteger.\n2. **Aurelia Tea** — nombre de fantasía, más registrable.\nEvite nombres genéricos como «Té Limón», que no serían registrables. ¿Desea que prepare una lista de clases de Niza aplicables?",
  },
  {
    id: "tienda",
    label: "Chatbot de una marca",
    system:
      "Eres el asistente de atención al cliente de la marca Frescor. Solo hablas de productos Frescor. Si te piden algo fuera de tu ámbito, lo indicas con amabilidad y rediriges.",
    answer:
      "¡Gracias por escribir a Frescor! Crear nombres para productos queda fuera de lo que puedo hacer aquí. Si buscas un té frío con limón, te recomiendo nuestro **Frescor Té Limón 0 %**, disponible en botellas de 500 ml. ¿Te ayudo a encontrar un punto de venta?",
  },
];

export default function SystemPromptDemo() {
  const reduce = useReducedMotionSafe();
  const [id, setId] = useState(PERSONAS[0]!.id);
  const p = PERSONAS.find((x) => x.id === id)!;
  const [shown, setShown] = useState(p.answer.length);

  // Efecto «máquina de escribir», como en los chats reales que muestran la respuesta token a token
  useEffect(() => {
    if (reduce) {
      setShown(p.answer.length);
      return;
    }
    setShown(0);
    const iv = setInterval(() => {
      setShown((n) => {
        if (n >= p.answer.length) {
          clearInterval(iv);
          return n;
        }
        return n + 3;
      });
    }, 16);
    return () => clearInterval(iv);
  }, [id, reduce, p.answer.length]);

  const text = p.answer.slice(0, shown);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Elige el system prompt">
        {PERSONAS.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === id}
            onClick={() => setId(x.id)}
            className={`rounded-full border px-3 py-1 text-sm ${x.id === id ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "border-line hover:bg-bg-soft"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-muted/60 bg-bg-soft p-3 text-sm">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">
          🔒 System prompt (el usuario no lo ve)
        </p>
        <p className="mt-1 font-mono text-[13px]">{p.system}</p>
      </div>

      <div className="mt-4 space-y-3" role="log" aria-live="polite">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-sky-100 px-4 py-2.5 dark:bg-sky-900/60">
          <p className="text-xs text-muted">Usuario</p>
          {USER_MSG}
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-2.5">
          <p className="text-xs text-muted">Asistente</p>
          <div className="min-h-24 whitespace-pre-line">
            {renderBold(text)}
            {shown < p.answer.length && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fg align-middle" />
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function renderBold(s: string) {
  return s
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}
