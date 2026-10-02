import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Como useReducedMotion, pero devuelve false hasta montar en el cliente.
 * Evita diferencias de hidratación: el servidor no conoce la preferencia del usuario.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!reduce;
}
