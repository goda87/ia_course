// Progreso de lectura por módulo, guardado solo en este navegador.
const KEY = "ia-curso:leidos";

export function readDone(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeDone(done: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    /* sin almacenamiento: el progreso no se recuerda */
  }
}

function render() {
  const done = readDone();
  document.querySelectorAll<HTMLElement>("[data-progress-check]").forEach((el) => {
    el.classList.toggle("hidden", !done.has(el.dataset.progressCheck!));
  });
  const totalEl = document.querySelector<HTMLElement>("[data-total-modules]");
  const total = Number(totalEl?.dataset.totalModules ?? 0);
  const count = [...done].filter((id) =>
    document.querySelector(`[data-progress-check="${CSS.escape(id)}"]`),
  ).length;
  document.querySelectorAll<HTMLElement>("[data-progress-bar]").forEach((el) => {
    el.style.width = total ? `${Math.round((count / total) * 100)}%` : "0%";
  });
  document.querySelectorAll<HTMLElement>("[data-progress-label]").forEach((el) => {
    el.textContent = `${count} de ${total} módulos leídos`;
  });
  document.querySelectorAll<HTMLButtonElement>("[data-mark-read]").forEach((b) => {
    const isDone = done.has(b.dataset.markRead!);
    b.setAttribute("aria-pressed", String(isDone));
    const label = b.querySelector("[data-label]");
    if (label) label.textContent = isDone ? "Leído ✓ (desmarcar)" : "Marcar como leído";
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-mark-read]").forEach((b) => {
  b.addEventListener("click", () => {
    const done = readDone();
    const id = b.dataset.markRead!;
    if (done.has(id)) done.delete(id);
    else done.add(id);
    writeDone(done);
    render();
  });
});

render();
