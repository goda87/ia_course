// Menú lateral en móvil: abrir/cerrar con botón, fondo y tecla Escape.
const btn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("sidebar-backdrop");

function setOpen(open: boolean) {
  if (!sidebar || !btn || !backdrop) return;
  sidebar.dataset.open = String(open);
  btn.setAttribute("aria-expanded", String(open));
  backdrop.classList.toggle("hidden", !open);
}

btn?.addEventListener("click", () => setOpen(sidebar?.dataset.open !== "true"));
backdrop?.addEventListener("click", () => setOpen(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setOpen(false);
});
