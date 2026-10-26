import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createStage } from "./particles.js";
import { createSound } from "./audio.js";
import { createTraces } from "./trace.js";
import {
  words,
  solarArray,
  rebarCage,
  retrieval,
  orbit,
  shield,
  helix,
  seed,
} from "./shapes.js";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const narrow = matchMedia("(max-width: 900px)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;
const weak =
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 4;
// 0 = phone or weak device, 1 = tablet, 2 = laptop and up
const TIER = narrow || (coarse && weak) ? 0 : coarse || weak ? 1 : 2;
document.documentElement.classList.add(`tier-${TIER}`);

const EASE = "expo.out";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const COUNT = [12000, 22000, 36000][TIER];

/* ---------------------------------------------------------------------------
   Loader: the counter chases real progress
   --------------------------------------------------------------------------- */
const load = { target: 0, shown: 0, live: true };
const loadNum = $("#loadNum"),
  loadBar = $("#loadBar"),
  logLines = $$("#loadLog li");
const STEPS = 3;
let stepsDone = 0;
const step = () => {
  stepsDone++;
  load.target = Math.max(load.target, stepsDone / STEPS);
};
gsap.ticker.add(() => {
  if (!load.live) return;
  load.shown += (load.target - load.shown) * 0.06;
  if (load.target === 1 && load.shown > 0.995) load.shown = 1;
  loadNum.textContent = String(
    Math.min(99, Math.round(load.shown * 100)),
  ).padStart(2, "0");
  if (load.shown === 1) loadNum.textContent = "100";
  loadBar.style.transform = `scaleX(${load.shown})`;
  logLines.forEach((li) => {
    if (!li.classList.contains("in") && load.shown >= +li.dataset.at) {
      li.classList.add("in");
      setTimeout(() => li.classList.add("ok"), 240);
    }
  });
});
const fontsReady = (document.fonts?.ready ?? Promise.resolve())
  .then(() =>
    document.fonts?.load?.('800 100px "Cabinet Grotesk"').catch(() => {}),
  )
  .then(step);
const minimumShow = new Promise((r) =>
  setTimeout(() => {
    step();
    r();
  }, 1200),
);

/* ---------------------------------------------------------------------------
   Smooth scroll
   --------------------------------------------------------------------------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
let anchors = [];
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    e.preventDefault();
    const el = $(id);
    const y =
      el.dataset.scene && anchors.length
        ? anchors[+el.dataset.scene]
        : el.getBoundingClientRect().top + scrollY;
    lenis
      ? lenis.scrollTo(y, { duration: 1.8 })
      : scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }),
);

/* ---------------------------------------------------------------------------
   Chapters: where each shape sits, how big, how it turns, what tint
   --------------------------------------------------------------------------- */
const stage = createStage($("#stage"), {
  count: COUNT,
  maxPixel: [1.25, 1.5, 1.75][TIER],
  tier: TIER,
  reduce,
});
const view = stage?.view ?? { w: 1, h: 1 };
const sections = $$("[data-scene]");
const sideOf = (i) => (sections[i]?.dataset.side === "right" ? -1 : 1);
const beside = (i, k = 0.21) =>
  narrow ? [0, view.h * 0.2] : [view.w * k * sideOf(i), 0];

const CHAPTERS = [
  {
    tint: "#2a1a08",
    size: () => Math.min(view.w * (narrow ? 0.9 : 0.6), view.h * 2.2),
    at: () => [0, view.h * (narrow ? 0.22 : 0.15)],
    turn: "face",
  },
  {
    tint: "#0d1a3a",
    size: () => (narrow ? view.w * 0.9 : view.h * 0.62),
    at: () => beside(1, 0.19),
    turn: "panel",
  },
  {
    tint: "#2b1c0c",
    size: () => (narrow ? view.w * 0.8 : view.h * 0.86),
    at: () => beside(2),
    turn: "cage",
  },
  {
    tint: "#1b1440",
    size: () => (narrow ? view.w * 0.9 : view.h * 0.8),
    at: () => beside(3),
    turn: "face",
  },
  {
    tint: "#0f2236",
    size: () => (narrow ? view.w * 0.95 : view.h * 0.86),
    at: () => beside(4, 0.22),
    turn: "orbit",
  },
  {
    tint: "#2c1508",
    size: () => (narrow ? view.w * 0.6 : view.h * 0.7),
    at: () => beside(5),
    turn: "face",
  },
  {
    tint: "#16203a",
    size: () => (narrow ? view.w * 0.7 : view.h * 0.86),
    at: () => (narrow ? [0, view.h * 0.26] : [view.w * 0.25, view.h * 0.02]),
    turn: "spin",
  },
  {
    tint: "#2a1a08",
    size: () => Math.min(view.w * (narrow ? 0.92 : 0.58), view.h * 2.2),
    at: () => [0, view.h * (narrow ? 0.26 : 0.2)],
    turn: "face",
  },
];
const tints = CHAPTERS.map((c) => new THREE.Color(c.tint));
const FIRST = { size: () => view.h, at: CHAPTERS[0].at, turn: "drift" };
// while a trace is open, its project's shape sits in the space beside the panel
const besidePanel = (scene) => ({
  size: () => (narrow ? view.w * 0.7 : Math.min(view.h * 0.62, view.w * 0.32)),
  at: () => (narrow ? [0, view.h * 0.3] : [-view.w * 0.29, 0]),
  turn: CHAPTERS[scene].turn,
});
const focus = { on: false, from: 0, to: 0, fromBeside: false, t: 0 };

const pointer = { x: 0, y: 0, sx: 0, sy: 0, wx: 1e4, wy: 1e4, active: 0 };
const euler = new THREE.Euler(),
  m4 = new THREE.Matrix4();
function turnFor(kind, t, out) {
  const mx = pointer.sx,
    my = pointer.sy,
    T = reduce ? 0 : t;
  switch (kind) {
    case "face":
      euler.set(my * 0.14, mx * 0.3 + Math.sin(T * 0.4) * 0.06, 0);
      break;
    case "spin":
      euler.set(0.3 + my * 0.1, T * 0.25 + mx * 0.3, 0);
      break;
    case "panel":
      euler.set(-0.75 + my * 0.12, mx * 0.35 + Math.sin(T * 0.3) * 0.1, 0.04);
      break;
    case "cage":
      euler.set(0.22 + my * 0.1, T * 0.3 + mx * 0.3, 0);
      break;
    case "orbit":
      euler.set(0.45 + my * 0.12, T * 0.18 + mx * 0.3, -0.12);
      break;
    default:
      euler.set(my * 0.05, T * 0.02 + mx * 0.05, 0);
  }
  m4.makeRotationFromEuler(euler);
  out.setFromMatrix4(m4);
}

function measure() {
  const max = document.documentElement.scrollHeight - innerHeight;
  anchors = sections.map((el, i) =>
    i === 0
      ? 0
      : Math.min(
          max,
          Math.max(
            0,
            el.getBoundingClientRect().top +
              scrollY +
              el.offsetHeight / 2 -
              innerHeight / 2,
          ),
        ),
  );
}
// which two shapes we're between, and how far along
function chapterAt(y) {
  for (let k = 0; k < anchors.length - 1; k++)
    if (y < anchors[k + 1]) {
      const f = (y - anchors[k]) / Math.max(1, anchors[k + 1] - anchors[k]);
      const t = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
      return [k, k + 1, t * t * (3 - 2 * t)];
    }
  const L = anchors.length - 1;
  return [L - 1, L, 1];
}
function resize() {
  stage?.resize();
  measure();
}

/* ---------------------------------------------------------------------------
   Sound
   --------------------------------------------------------------------------- */
const sound = createSound();
const soundBtn = $("#sound"),
  soundLabel = soundBtn.querySelector(".sound-label");
const showSound = () => {
  soundBtn.setAttribute("aria-pressed", String(sound.on));
  soundLabel.textContent = sound.on ? "Sound on" : "Sound off";
};
soundBtn.addEventListener("click", () => {
  sound.setOn(!sound.on);
  showSound();
});
if (!sound.supported) soundBtn.hidden = true;
const traces = createTraces({
  sound,
  reduce,
  onOpen(scene) {
    lenis?.stop();
    if (focus.on && focus.t > 0.5) {
      focus.from = focus.to;
      focus.fromBeside = true;
    } else {
      focus.from = current;
      focus.fromBeside = false;
    }
    focus.to = scene;
    focus.on = true;
    gsap.fromTo(focus, { t: 0 }, { t: 1, duration: reduce ? 0 : 1.8, ease: "power2.inOut", overwrite: true });
  },
  onClose() {
    // reverse from the chapter in view back out to the panel-side shape
    focus.from = current;
    focus.fromBeside = false;
    gsap.to(focus, {
      t: 0,
      duration: reduce ? 0 : 1.4,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        focus.on = false;
        lenis?.start();
      },
    });
  },
});
document.addEventListener("visibilitychange", () => {
  document.hidden ? sound.suspend() : sound.resume();
});

/* ---------------------------------------------------------------------------
   Frame loop
   --------------------------------------------------------------------------- */
const clock = new THREE.Clock();
const intro = { t: 0, running: true };
const indexLinks = $$(".index a");
const tintNow = new THREE.Color(CHAPTERS[0].tint);
let shapes = [],
  start = null,
  current = -1,
  velocity = 0,
  lastY = 0;

function frame() {
  const t = clock.getElapsedTime();
  const y = lenis ? lenis.scroll : scrollY;
  let [a, b, T] = chapterAt(y);
  if (intro.running) {
    a = -1;
    b = 0;
    T = intro.t;
  }
  const active = T > 0.5 ? b : Math.max(0, a);
  if (active !== current) {
    current = active;
    indexLinks.forEach((l, i) => l.classList.toggle("on", i === active));
    sound.chapter(active);
  }
  if (!stage || !shapes.length || stage.lost) return;

  let shapeA = a < 0 ? start : shapes[a],
    shapeB = shapes[b],
    A = a < 0 ? FIRST : CHAPTERS[a],
    B = CHAPTERS[b];
  if (focus.on) {
    shapeA = shapes[focus.from];
    shapeB = shapes[focus.to];
    A = focus.fromBeside ? besidePanel(focus.from) : CHAPTERS[focus.from];
    B = besidePanel(focus.to);
    T = focus.t;
  }
  stage.setShapes(shapeA, shapeB);
  pointer.sx += (pointer.x - pointer.sx) * 0.06;
  pointer.sy += (pointer.y - pointer.sy) * 0.06;
  const dy = y - lastY;
  lastY = y;
  velocity += ((Math.abs(dy) > 400 ? 0 : dy) - velocity) * 0.12;

  const U = stage.particles;
  U.uScaleA.value = A.size();
  U.uScaleB.value = B.size();
  const pa = A.at(),
    pb = B.at();
  U.uOffA.value.set(pa[0], pa[1], 0);
  U.uOffB.value.set(pb[0], pb[1], 0);
  turnFor(A.turn, t, U.uRotA.value);
  turnFor(B.turn, t, U.uRotB.value);
  U.uMix.value = T;
  U.uTime.value = reduce ? 0 : t;
  U.uLift.value = reduce ? 0 : Math.max(-24, Math.min(24, velocity));
  U.uPointer.value.set(pointer.wx, pointer.wy);
  U.uPointerR.value +=
    ((pointer.active ? view.h * 0.12 : 0) - U.uPointerR.value) * 0.08;

  tintNow.lerp(a < 0 ? tints[0] : tints[a].clone().lerp(tints[b], T), 0.05);
  const progress =
    y / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  stage.wind.uTint.value.copy(tintNow);
  stage.wind.uTime.value = reduce ? 0 : t;
  stage.wind.uScroll.value = progress;
  stage.dust.uScroll.value = progress;
  stage.dust.uTime.value = reduce ? 0 : t;
  stage.render(intro.running);
}

// Mouse: particles part around the cursor and shapes lean towards it.
// Touch: only while a finger is down and moving sideways; scrolling lets go.
let fingerDown = false;
const aim = (e) => {
  const nx = (e.clientX / innerWidth) * 2 - 1,
    ny = -((e.clientY / innerHeight) * 2 - 1);
  pointer.wx = (nx * view.w) / 2;
  pointer.wy = (ny * view.h) / 2;
  return [nx, ny];
};
addEventListener(
  "pointermove",
  (e) => {
    if (e.pointerType === "mouse") {
      [pointer.x, pointer.y] = aim(e);
      pointer.active = 1;
    } else if (fingerDown) {
      aim(e);
      pointer.active = 1;
    }
  },
  { passive: true },
);
addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType !== "mouse") {
      fingerDown = true;
      aim(e);
      pointer.active = 1;
    }
  },
  { passive: true },
);
const letGo = (e) => {
  if (e.pointerType !== "mouse") {
    fingerDown = false;
    pointer.active = 0;
  }
};
addEventListener("pointerup", letGo, { passive: true });
addEventListener("pointercancel", letGo, { passive: true });
document.addEventListener("pointerleave", () => {
  pointer.active = 0;
});
addEventListener("blur", () => {
  fingerDown = false;
  pointer.active = 0;
});
addEventListener(
  "scroll",
  () => {
    if (fingerDown) {
      fingerDown = false;
      pointer.active = 0;
    }
  },
  { passive: true },
);

/* ---------------------------------------------------------------------------
   Build shapes, then open
   --------------------------------------------------------------------------- */
Promise.all([fontsReady, minimumShow]).then(() => {
  start = seed(COUNT);
  shapes = [
    words(COUNT, "SURYA"),
    solarArray(COUNT),
    rebarCage(COUNT),
    retrieval(COUNT),
    orbit(COUNT),
    shield(COUNT),
    helix(COUNT),
    words(COUNT, "HELLO"),
  ];
  step();
  resize();
  if (stage) gsap.ticker.add(frame);
  openGate();
});

function openGate() {
  load.target = 1;
  const go = (withSound) => {
    $$("#gate button").forEach((b) => {
      b.disabled = true;
    });
    if (withSound && sound.supported) sound.start();
    showSound();
    sound.swell();
    load.live = false;
    document.body.classList.remove("booting");
    if (reduce) {
      $("#loader").remove();
      intro.t = 1;
      intro.running = false;
      lenis?.start();
      traces.fromHash();
      heroIn();
      return;
    }
    if (stage) stage.particles.uScatter.value = 2.6;
    gsap
      .timeline()
      .to(".loader-inner", {
        opacity: 0,
        y: -12,
        duration: 0.45,
        ease: "power2.in",
      })
      .to(
        ".curtain-l",
        { xPercent: -100, duration: 1.1, ease: "expo.inOut" },
        "-=.05",
      )
      .to(
        ".curtain-r",
        { xPercent: 100, duration: 1.1, ease: "expo.inOut" },
        "<",
      )
      .fromTo(
        "#flare",
        { scale: 0, opacity: 0.9 },
        { scale: 60, opacity: 0, duration: 1.7, ease: "power2.out" },
        "<.3",
      )
      .to(
        intro,
        {
          t: 1,
          duration: 3,
          ease: "power2.inOut",
          onComplete: () => {
            intro.running = false;
            lenis?.start();
            traces.fromHash();
          },
        },
        "<",
      )
      .to(
        stage ? stage.particles.uScatter : {},
        { value: 1, duration: 3, ease: "power2.out" },
        "<",
      )
      .add(() => $("#loader").remove(), "<1.1")
      .add(heroIn, "<1.15");
  };
  $("#enterSound").addEventListener("click", () => go(true));
  $("#enterQuiet").addEventListener("click", () => go(false));
  const wait = () => {
    if (load.shown < 1) return gsap.delayedCall(0.1, wait);
    const gate = $("#gate");
    gate.hidden = false;
    gsap.fromTo(
      gate,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.7, ease: EASE },
    );
    $("#enterSound").focus({ preventScroll: true });
  };
  wait();
}

/* ---------------------------------------------------------------------------
   Page choreography
   --------------------------------------------------------------------------- */
// wrap every word of .words headings so each can rise out of a mask
$$(".words").forEach((el) => {
  const walk = (node) =>
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement("span");
          mask.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  walk(el);
});

// labels resolve out of random glyphs
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/=+";
function decode(el) {
  if (reduce || !el) return;
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  const t0 = performance.now(),
    dur = 650;
  const run = (now) => {
    const k = Math.min(1, (now - t0) / dur),
      shown = Math.floor(final.length * k);
    el.textContent =
      k >= 1
        ? final
        : [...final]
            .map((ch, i) =>
              i < shown || ch === " "
                ? ch
                : GLYPHS[(Math.random() * GLYPHS.length) | 0],
            )
            .join("");
    if (k < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
  setTimeout(() => {
    el.textContent = final;
  }, dur + 400);
}

function heroIn() {
  if (reduce) return;
  gsap
    .timeline()
    .fromTo(
      ".topbar",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: EASE },
    )
    .add(() => decode($(".hero .eyebrow")), "<")
    .from(
      ".hero .w > span",
      { yPercent: 115, duration: 1.2, stagger: 0.05, ease: EASE },
      "<.1",
    )
    .from(
      [".hero .lede", ".hero .ctas", ".index"],
      { opacity: 0, y: 18, duration: 1, stagger: 0.08, ease: EASE },
      "-=.9",
    );
}

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (s) => {
    $("#scrollbar").style.transform = `scaleX(${s.progress})`;
  },
});

// counters
const fmt = (n) => Math.round(n).toLocaleString("en-US");
$$("[data-count]").forEach((el) => {
  const end = +el.dataset.count,
    suffix = el.dataset.suffix || "",
    final = fmt(end) + suffix;
  if (reduce) {
    el.textContent = final;
    return;
  }
  const o = { v: 0 };
  gsap.to(o, {
    v: end,
    duration: 1.8,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
    onUpdate: () => {
      el.textContent = fmt(o.v) + suffix;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
});

// project chapters
$$(".work").forEach((sec) => {
  const card = sec.querySelector(".card");
  const heading = sec.querySelectorAll("h2 .w > span");
  const parts = sec.querySelectorAll(
    ".card > p, .flow, .tags, .stats6, .sources, .deltas, .regions",
  );
  if (reduce) return;
  gsap.set(heading, { yPercent: 115 });
  ScrollTrigger.create({
    trigger: sec,
    start: "top 45%",
    once: true,
    onEnter: () => {
      decode(sec.querySelector(".kicker"));
      gsap.to(heading, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.05,
        ease: EASE,
      });
      gsap.from(parts, {
        opacity: 0,
        y: 22,
        duration: 0.9,
        stagger: 0.06,
        ease: EASE,
        delay: 0.15,
      });
      const bars = sec.querySelectorAll(".regions i");
      if (bars.length)
        gsap.from(bars, {
          scaleX: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: EASE,
          delay: 0.4,
        });
    },
  });
  if (!narrow)
    gsap
      .timeline({
        scrollTrigger: {
          trigger: sec,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
      })
      .fromTo(
        card,
        { opacity: 0, y: 80, rotateX: 7 },
        { opacity: 1, y: 0, rotateX: 0, ease: "power2.out", duration: 0.22 },
      )
      .to(card, { opacity: 1, duration: 0.56 })
      .to(card, { opacity: 0, y: -60, ease: "power2.in", duration: 0.22 });
});

// loops that only run while on screen
function whileVisible(el, on, off) {
  if (reduce || !el) return;
  new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off()), {
    threshold: 0.3,
  }).observe(el);
}
// estimation graph: steps light in order, and the human-review step holds longer
const flowSteps = $$(".flow li");
let flowTimer = null,
  flowAt = -1;
const flowTick = () => {
  flowSteps.forEach((s) => s.classList.remove("on"));
  flowAt = (flowAt + 1) % (flowSteps.length + 2);
  if (flowAt < flowSteps.length) flowSteps[flowAt].classList.add("on");
  flowTimer = setTimeout(
    flowTick,
    flowSteps[flowAt]?.classList.contains("hitl") ? 1300 : 360,
  );
};
whileVisible(
  $(".flow"),
  () => {
    if (!flowTimer) flowTick();
  },
  () => {
    clearTimeout(flowTimer);
    flowTimer = null;
  },
);

// journey + contact
if (!reduce) {
  gsap.from("#journey-h .w > span", {
    yPercent: 115,
    duration: 1.1,
    stagger: 0.06,
    ease: EASE,
    scrollTrigger: { trigger: "#journey-h", start: "top 80%" },
  });
  gsap.from(".role", {
    opacity: 0,
    x: -24,
    duration: 0.9,
    stagger: 0.1,
    ease: EASE,
    scrollTrigger: { trigger: ".timeline", start: "top 78%" },
  });
  const line = $(".tl-line line");
  line.style.setProperty("--dash", 100);
  ScrollTrigger.create({
    trigger: ".timeline",
    start: "top 75%",
    end: "bottom 60%",
    scrub: true,
    onUpdate: (s) => line.style.setProperty("--dash", 100 - s.progress * 100),
  });
  gsap.from("#contact-h .w > span", {
    yPercent: 115,
    duration: 1.1,
    stagger: 0.05,
    ease: EASE,
    scrollTrigger: { trigger: "#contact-h", start: "top 85%" },
  });
  gsap.from(".contact .lede, .mail, .socials", {
    opacity: 0,
    y: 20,
    duration: 0.9,
    stagger: 0.08,
    ease: EASE,
    scrollTrigger: { trigger: ".contact-inner", start: "top 85%" },
  });
}

// ticker loops seamlessly with a duplicated track
const track = $(".ticker-track"),
  originals = track.children.length;
track.innerHTML += track.innerHTML;
[...track.children].forEach((s, i) => {
  if (i >= originals) s.setAttribute("aria-hidden", "true");
});

// top bar tucks away on the way down
const topbar = $("#topbar");
let tucked = false;
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (s) => {
    const hide = s.direction === 1 && s.scroll() > 100;
    if (hide === tucked) return;
    tucked = hide;
    gsap.to(topbar, {
      y: hide ? -120 : 0,
      opacity: hide ? 0 : 1,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  },
});

// magnetic buttons and hover ticks
if (finePointer && !reduce) {
  $$(".btn, .topbar-cta, .mail, .socials a").forEach((el) =>
    el.addEventListener("pointerenter", () => sound.tick()),
  );
  $$(".pull").forEach((el) => {
    const x = gsap.quickTo(el, "x", {
      duration: 0.5,
      ease: "elastic.out(1, .4)",
    });
    const y = gsap.quickTo(el, "y", {
      duration: 0.5,
      ease: "elastic.out(1, .4)",
    });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => {
      x(0);
      y(0);
    });
  });
}

// copy the email address
const mail = $(".mail"),
  mailTip = mail.querySelector(".mail-tip");
mail.addEventListener("click", async () => {
  const address = mail.dataset.email;
  try {
    await navigator.clipboard.writeText(address);
    mailTip.textContent = "Copied. Talk soon";
  } catch {
    location.href = `mailto:${address}`;
    mailTip.textContent = "Opening your mail app";
  }
  setTimeout(() => {
    mailTip.textContent = "Click to copy";
  }, 2400);
});

let resizeTimer,
  lastWidth = innerWidth;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // phones fire resize as the address bar slides; only a width change matters
    if (coarse && innerWidth === lastWidth) return;
    lastWidth = innerWidth;
    resize();
    ScrollTrigger.refresh();
  }, 200);
});
ScrollTrigger.addEventListener("refresh", measure);
