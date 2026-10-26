// ============================================================================
//  Trace view: every project opens as an execution trace. Stages are nodes on
//  a rail, resume points are spans hanging off them, and the rail fills as you
//  read. The particles morph to the project's shape beside the panel.
// ============================================================================
import gsap from "gsap";
import { TRACES } from "./data/traces.js";

const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mark = s => esc(s).replace(/\[\[(.+?)\]\]/g, "<b>$1</b>");
const fmt = (n, decimals) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function createTraces({ onOpen, onClose, sound, reduce }) {
  const root = document.getElementById("trace");
  const panel = root.querySelector(".trace-panel");
  const body = document.getElementById("traceBody");
  const runLabel = document.getElementById("traceRun");
  const fill = root.querySelector(".trace-progress i");
  let current = null, opener = null, observer = null;

  function render(t) {
    const next = TRACES[(TRACES.indexOf(t) + 1) % TRACES.length];
    const spanCount = t.stages.reduce((n, s) => n + s.items.length, 0);
    runLabel.textContent = `${t.run} · ${t.stages.length} nodes · ${spanCount} spans`;
    body.innerHTML = `
      <p class="trace-meta"><span>${esc(t.org)}</span><span>${esc(t.role)}</span><span>${esc(t.when)}</span><span>${esc(t.where)}</span></p>
      <h2 id="trace-title" class="trace-title">${esc(t.title)}</h2>
      <p class="trace-summary">${esc(t.summary)}</p>
      ${t.brief ? `<div class="trace-brief"><p class="trace-label">In plain words</p><dl>${t.brief.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>` : ""}
      ${t.metrics.length ? `<dl class="trace-metrics">${t.metrics.map(([v, suf, label, pre = ""]) => `
        <div><dt>${esc(label)}</dt><dd>${esc(pre)}<b data-to="${v}">${reduce ? fmt(+v, v.includes(".") ? v.split(".")[1].length : 0) : "0"}</b>${esc(suf)}</dd></div>`).join("")}</dl>` : ""}
      <ol class="trace-graph">${t.stages.map((s, i) => `
        <li class="stage">
          <p class="stage-head"><span class="stage-id">node ${String(i + 1).padStart(2, "0")}</span><span class="stage-name">${esc(s.name)}</span><span class="stage-count">${s.items.length} ${s.items.length === 1 ? "span" : "spans"}</span></p>
          <ul>${s.items.map(([tag, text]) => `<li class="span" data-tag="${tag}"><span class="tag">${tag}</span><p>${mark(text)}</p></li>`).join("")}</ul>
        </li>`).join("")}
      </ol>
      <div class="trace-stack"><p class="trace-label">Stack</p><ul>${t.stack.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
      <button class="trace-next" type="button" data-next="${next.id}"><span class="trace-label">Next trace</span><span class="trace-next-title">${esc(next.title)}</span><span class="trace-next-arrow" aria-hidden="true">→</span></button>`;
  }

  function animateIn() {
    if (reduce) return;
    gsap.fromTo(body.querySelectorAll(".trace-meta span, .trace-title, .trace-summary, .trace-brief"), { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: .9, stagger: .06, ease: "expo.out", delay: .25 });
    body.querySelectorAll(".trace-metrics b").forEach(b => {
      const to = +b.dataset.to, decimals = b.dataset.to.includes(".") ? b.dataset.to.split(".")[1].length : 0, o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, delay: .45, ease: "power3.out", onUpdate: () => { b.textContent = fmt(o.v, decimals); } });
    });
    // spans arrive as they scroll into the panel
    observer?.disconnect();
    observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("seen");
      observer.unobserve(e.target);
    }), { root: panel, threshold: .2 });
    body.querySelectorAll(".stage, .span").forEach(el => observer.observe(el));
  }

  function show(t) {
    current = t;
    render(t);
    panel.scrollTop = 0;
    fill.style.transform = "scaleY(0)";
    if (reduce) body.querySelectorAll(".stage, .span").forEach(el => el.classList.add("seen"));
    animateIn();
    onOpen(t.scene);
    history.replaceState(null, "", `#trace-${t.id}`);
  }

  function open(id, from) {
    const t = TRACES.find(x => x.id === id);
    if (!t) return;
    if (!root.hidden) {
      // already open: swap traces with a quick cross-fade
      gsap.to(body, { opacity: 0, y: -16, duration: .25, ease: "power2.in", onComplete: () => {
        show(t);
        gsap.fromTo(body, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, ease: "expo.out" });
      } });
      return;
    }
    opener = from || document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("trace-open");
    show(t);
    sound.swell();
    if (reduce) { panel.focus({ preventScroll: true }); return; }
    gsap.fromTo(".trace-scrim, .trace-progress", { opacity: 0 }, { opacity: 1, duration: .5, ease: "power2.out" });
    gsap.fromTo(panel, { xPercent: 104 }, { xPercent: 0, duration: .9, ease: "expo.out", onComplete: () => panel.focus({ preventScroll: true }) });
  }

  function close() {
    if (root.hidden) return;
    onClose();
    history.replaceState(null, "", location.pathname + location.search);
    const done = () => {
      root.hidden = true;
      document.documentElement.classList.remove("trace-open");
      current = null;
      opener?.focus?.({ preventScroll: true });
    };
    if (reduce) return done();
    gsap.to(".trace-scrim, .trace-progress", { opacity: 0, duration: .45, ease: "power2.in" });
    gsap.to(panel, { xPercent: 104, duration: .6, ease: "expo.in", onComplete: done });
  }

  panel.addEventListener("scroll", () => {
    const max = panel.scrollHeight - panel.clientHeight;
    fill.style.transform = `scaleY(${max > 0 ? panel.scrollTop / max : 1})`;
  }, { passive: true });
  root.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) close();
    const next = e.target.closest("[data-next]");
    if (next) open(next.dataset.next);
  });
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-trace]");
    if (btn) { e.preventDefault(); open(btn.dataset.trace, btn); }
  });
  document.addEventListener("keydown", e => {
    if (root.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      // keep focus inside the dialog
      const items = [...root.querySelectorAll("button, a[href]")].filter(el => !el.disabled && el.offsetParent);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  return {
    open, close,
    get isOpen() { return !!current; },
    // open straight from a shared link like #trace-estimation
    fromHash() { const m = location.hash.match(/^#trace-([\w-]+)$/); if (m) open(m[1]); },
  };
}
