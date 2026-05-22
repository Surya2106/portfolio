import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

// ============================================================================
//  SURYA TEJA PINNINTI — "THE NEURAL ORCHESTRATOR" v2
//  Now with clickable 3D nodes + full-resume glassmorphic deep-dive drawer.
//  Live single-file artifact port of the Gemini Next.js blueprint.
// ============================================================================

const COL = {
  bg: "#040409",
  cyan: "#06b6d4",
  cyanBright: "#38bdf8",
  indigo: "#6366f1",
  indigoSoft: "#818cf8",
  violet: "#a855f7",
  ink: "#e8ecf4",
  dim: "#8b93a7",
};

// ---- full resume data (from the actual PDF) -------------------------------
const RESUME = {
  infiswift: {
    title: "InfiSwift AI",
    role: "Senior AI Engineer · Freelance",
    period: "Nov 2025 — Present",
    location: "Remote",
    color: COL.indigo,
    summary:
      "Architected end-to-end AI-powered document processing and multi-agent systems for a Japanese solar-energy company.",
    highlights: [
      "Built multi-agent cost-estimation pipelines processing unstructured PDFs, Excel, CSV and email inputs.",
      "Designed an 8+ node LangGraph StateGraph with human-in-the-loop interrupts to safely automate ambiguous workflows.",
      "Engineered a custom MySQL-backed checkpointing system for pause/resume across worker crashes and deployments — zero data loss.",
      "Integrated GPT-4o with structured Pydantic outputs, enforcing deterministic schema-based extraction.",
      "Built a parallel file-processing pipeline with configurable ThreadPool/ProcessPool executors.",
      "Integrated Google Vertex AI Matching Engine (RAG) for contextual rule retrieval.",
      "Designed a two-service architecture (AI worker + FastAPI) communicating asynchronously via AWS SQS.",
      "Implemented context-aware RBAC middleware with JWT validation and capability-based authorization for secure multi-tenant SaaS.",
      "Built a comprehensive audit trail capturing 100% of AI decisions and manual overrides across 8+ workflow nodes.",
      "Engineered distributed locking and idempotent execution across async SQS retries for exactly-once state transitions.",
    ],
    metrics: [
      ["-60%", "manual effort"],
      ["+35%", "extraction accuracy"],
      ["3×", "ingestion throughput"],
      ["-40%", "incorrect calcs"],
    ],
    skills: [
      "LangGraph",
      "GPT-4o",
      "Pydantic",
      "FastAPI",
      "Vertex AI",
      "AWS SQS",
      "MySQL",
      "Docker",
      "Python",
    ],
  },
  deshaw: {
    title: "D.E. Shaw India",
    role: "Senior Member of Technical Staff · Full-time",
    period: "Nov 2024 — Jun 2025",
    location: "Hyderabad",
    color: COL.indigoSoft,
    summary:
      "Designed and maintained core trading systems and built an internal AI QA orchestration platform.",
    highlights: [
      "Maintained and enhanced legacy trading systems — fixing critical bugs and shipping feature improvements.",
      "Built an AI QA chatbot indexing Confluence docs, Desflow tickets and Slack communications as training data.",
      "Built scalable ingestion pipelines indexing thousands of internal documents for semantic search across years of knowledge.",
      "Implemented structured summarization and contextual enrichment layers, reducing repetitive QA queries.",
      "Refined chunking strategies, embedding pipelines and prompt design to lift relevant-response rate.",
      "Optimized inference latency and caching, cutting average chatbot response time under peak usage.",
      "Designed a Helpful / Not-Helpful feedback loop enabling prompt refinement and retrieval improvements.",
      "Built offline evaluation and prompt-regression testing pipelines to prevent quality degradation.",
      "Added structured logging and p95/p99 monitoring dashboards, reducing chatbot debugging time.",
    ],
    metrics: [
      ["-45%", "response latency"],
      ["-40%", "repetitive queries"],
      ["+25%", "answer relevance"],
      ["-35%", "triage time"],
    ],
    skills: [
      "Python",
      "RAG",
      "Semantic Search",
      "Prompt Eng",
      "Embeddings",
      "Caching",
      "Monitoring",
    ],
  },
  tekion: {
    title: "Tekion",
    role: "Software Engineer 1 (L2) · Integrations · Full-time",
    period: "Mar 2023 — Nov 2024",
    location: "Bengaluru",
    color: COL.cyan,
    summary:
      "Modernized and stabilized enterprise dealer-integration pipelines for global automotive brands.",
    highlights: [
      "Directed decoupling of a monolithic service into a scalable microservices architecture — 90% faster integrations (1 month → 3 days).",
      "Led mission-critical integrations for BMW Canada, Mercedes Canada and Porsche Global onto the DMS platform.",
      "Revamped vehicle-info APIs with multi-threading, cutting API latency from ~3s to ~1ms.",
      "Refactored a codebase applying the delegation pattern for stability, readability and scalability.",
      "Reduced repair-order integration error rates from 10% to 0.2% in production.",
      "Led onboarding for new SDEs and mentored 2 SDE-1s.",
      "Recognized as Best Developer of the Quarter for critical integrations and proactive ownership.",
    ],
    metrics: [
      ["3s→1ms", "API latency"],
      ["-90%", "integration time"],
      ["10%→0.2%", "error rate"],
      ["2", "SDEs mentored"],
    ],
    skills: [
      "Java",
      "Spring Boot",
      "Microservices",
      "Multi-threading",
      "Delegation Pattern",
      "OEM Integrations",
    ],
  },
  amazon: {
    title: "Amazon",
    role: "Software Development Engineer 1 · Risk · Full-time",
    period: "Jun 2021 — Mar 2023",
    location: "Bengaluru",
    color: COL.cyanBright,
    summary:
      "Built fraud-detection risk systems and high-throughput pipelines for global Amazon marketplaces.",
    highlights: [
      "Migrated a critical service from V1 to V2 flow with robust integration and unit testing, reducing IMR and latency.",
      "Designed variable-generation APIs; ML models retrained on them achieved ~16% more buyer-risk automation.",
      "Drove continuous-evaluation rollout across fraud marketplaces (NA +5.38%, EU +2.09%, FE +0.43% automation).",
      "Reduced overall ticket count by 40% in one year through permanent automation of repetitive tickets.",
      "Owned Q4 Black Friday / Cyber Monday peak scaling with no incidents and correct host scale/descale.",
      "Deprecated a redundant API, saving ~$5,000/month in infrastructure cost.",
      "Gained deep expertise across AWS — SQS, SNS, CloudWatch, DynamoDB, EC2, Lambda, S3, IAM, CloudFormation, VPC.",
      "Mentored 1 SDE and conducted 30+ technical interviews, recognized for best hiring decisions.",
    ],
    metrics: [
      ["+16%", "BR automation"],
      ["-40%", "tickets / yr"],
      ["$5k/mo", "cost saved"],
      ["30+", "interviews"],
    ],
    skills: [
      "Java",
      "AWS",
      "Lambda",
      "DynamoDB",
      "SQS/SNS",
      "CloudWatch",
      "CloudFormation",
      "EC2",
    ],
  },
  delhivery: {
    title: "Delhivery",
    role: "Software Developer · WMS · Full-time",
    period: "Sep 2020 — Jun 2021",
    location: "Gurgaon",
    color: COL.cyan,
    summary:
      "Built high-performance logistics features in the Warehouse Management System and Telescope analytics platform.",
    highlights: [
      "Built and operated microservices in the Warehouse Management System (WMS) team.",
      "Gained expertise with Python, Flask, PostgreSQL, Celery, Kafka, Elasticsearch, Kibana and Coralogix.",
      "Worked on the Telescope platform surfacing enterprise logistics insight to clients like Voltas and Realme.",
    ],
    metrics: [
      ["WMS", "core team"],
      ["2", "enterprise clients"],
      ["real-time", "pipelines"],
    ],
    skills: [
      "Python",
      "Flask",
      "PostgreSQL",
      "Celery",
      "Kafka",
      "Elasticsearch",
      "Kibana",
    ],
  },
  awards: {
    title: "Academics & Honors Ledger",
    role: "Competitive Coding & Education",
    period: "2014 — 2020",
    location: "India · National Level",
    color: COL.violet,
    summary:
      "A deep algorithmic foundation with numerous national-level coding-contest accolades and a strong academic record.",
    highlights: [
      "ACM-ICPC Nationalist — 2018 and 2019.",
      "1st Place — CodeWreck 2.0, Vignan College of Engineering.",
      "1st Place — Design Space Competition (National Level), ANITS.",
      "2nd Place — Turing Cup (CodeChef), 2019.",
      "2nd Place — Code Avadhan, ANITS TechFest 2019.",
      "2nd Place — Code Battle, ANITS TechFest 2019.",
      "2nd Place — Debugging competition, JNTV TechFest 2019.",
      "3rd Place — 12-Hour Hackathon, GMR Institute of Technology.",
      "B.Tech in CSE from ANITS — CGPA 7.98, with a scholarship for promising CSE students.",
      "SSC completed with a 9.8 CGPA; Intermediate (MPC) with 97.2%.",
      "President of the ACM-ICPC student club and Best Secretary, CSI; coordinated CURSORS TechFest 2020 (1500+ participants).",
    ],
    metrics: [
      ["7.98", "B.Tech CGPA"],
      ["9.8", "SSC CGPA"],
      ["2×", "ICPC nationalist"],
      ["10+", "podiums"],
    ],
    skills: [
      "C++ / STL",
      "Data Structures",
      "Algorithms",
      "Dynamic Programming",
      "Competitive Programming",
    ],
  },
};

// skills ledger (from resume page 3)
const SKILLS = [
  [
    "Languages",
    ["C", "C++ / STL", "Java", "Python", "JavaScript", "React", "Node.js"],
  ],
  [
    "AI / ML",
    [
      "RAG",
      "LangGraph Multi-Agent",
      "LLM Integration",
      "Vertex AI Matching Engine",
      "Pydantic Outputs",
      "Human-in-the-Loop",
    ],
  ],
  ["Frameworks", ["Spring Boot", "FastAPI", "Flask", "Django"]],
  [
    "Cloud & Infra",
    [
      "AWS (SQS, SNS, DynamoDB, SageMaker, Lambda, S3, EC2)",
      "GCP",
      "Docker",
      "Kubernetes",
      "Redis",
      "Kafka",
      "HLD / LLD",
    ],
  ],
  ["Databases", ["MySQL", "PostgreSQL", "MongoDB"]],
];

// professional journey (compact telemetry)
const JOURNEY = [
  ["InfiSwift AI", "2025 — present · Sr. AI Engineer · Freelance", COL.indigo],
  ["D.E. Shaw India", "2024 — 25 · SMTS · Full-time", COL.indigoSoft],
  ["Tekion", "2023 — 24 · SDE (L2) · Full-time", COL.cyan],
  ["Amazon", "2021 — 23 · SDE-1 · Full-time", COL.cyanBright],
  ["Delhivery", "2020 — 21 · Software Developer · Full-time", COL.dim],
];

// personal kernel — hobbies as telemetry blocks
const KERNEL = [
  [
    "SPORTS",
    "Badminton & Cricket",
    "All-rounder — reflexes, footwork, strategy.",
    COL.cyan,
  ],
  [
    "TELEMETRY",
    "Formula 1",
    "Hooked on the engineering precision of the grid.",
    COL.cyanBright,
  ],
  [
    "INGESTION",
    "Avid Reader",
    "Systems, biographies and big ideas.",
    COL.indigoSoft,
  ],
  ["RENDER", "Anime", "Storytelling, pacing and visual craft.", COL.violet],
];

// node graph layout (each maps to a RESUME key)
const NODES = [
  {
    id: "hero",
    pos: [0, 0.5, 0],
    color: COL.cyan,
    size: 0.46,
    clickable: false,
  },
  { id: "infiswift", pos: [2.6, 1.0, -1], color: COL.indigo, size: 0.4 },
  { id: "deshaw", pos: [4.2, -1.0, -2], color: COL.indigoSoft, size: 0.34 },
  { id: "tekion", pos: [-3.0, 1.2, -1.4], color: COL.cyan, size: 0.38 },
  { id: "amazon", pos: [-4.6, -0.8, -2], color: COL.cyanBright, size: 0.36 },
  { id: "delhivery", pos: [-2.0, -2.6, -2.5], color: COL.cyan, size: 0.3 },
  { id: "awards", pos: [0, -3.4, -3], color: COL.violet, size: 0.34 },
];
const EDGES = [
  ["hero", "infiswift"],
  ["infiswift", "deshaw"],
  ["hero", "tekion"],
  ["tekion", "amazon"],
  ["amazon", "delhivery"],
  ["deshaw", "awards"],
  ["delhivery", "awards"],
  ["hero", "awards"],
];

// ---- Three.js scene with raycast click ------------------------------------
function OrchestratorCanvas({ progressRef, onNodeClick }) {
  const mount = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = mount.current;
    const W = () => el.clientWidth,
      H = () => el.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040409, 0.05);
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(10, 10, 5);
    scene.add(dl);
    const pl = new THREE.PointLight(0x4f46e5, 0.5);
    pl.position.set(-10, -10, -5);
    scene.add(pl);

    const group = new THREE.Group();
    scene.add(group);

    const clickTargets = [];
    const nodeMeshes = {};
    NODES.forEach((n) => {
      const c = new THREE.Color(n.color);
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(n.size, 1),
        new THREE.MeshStandardMaterial({
          color: c,
          emissive: c,
          emissiveIntensity: 0.8,
          wireframe: true,
          metalness: 0.9,
          roughness: 0.1,
        }),
      );
      wire.position.set(...n.pos);
      wire.userData.id = n.id;
      wire.userData.clickable = n.clickable !== false;
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(n.size * 0.5, 0),
        new THREE.MeshBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.9,
        }),
      );
      core.position.set(...n.pos);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(n.size * 2.6, 16, 16),
        new THREE.MeshBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.07,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.position.set(...n.pos);
      group.add(wire, core, halo);
      if (n.clickable !== false) clickTargets.push(wire);
      nodeMeshes[n.id] = { wire, core, halo, base: n.size, color: c };
    });

    const edgePos = [];
    EDGES.forEach(([a, b]) => {
      const A = NODES.find((n) => n.id === a).pos,
        B = NODES.find((n) => n.id === b).pos;
      edgePos.push(...A, ...B);
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgePos, 3),
    );
    group.add(
      new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: 0x8fa3c0,
          transparent: true,
          opacity: 0.16,
        }),
      ),
    );

    const NUM = 60;
    const pPos = new Float32Array(NUM * 3),
      pCol = new Float32Array(NUM * 3);
    const pT = Array.from({ length: NUM }, () => Math.random());
    const pSpd = Array.from(
      { length: NUM },
      () => Math.random() * 0.012 + 0.004,
    );
    const pEdge = Array.from({ length: NUM }, () =>
      Math.floor(Math.random() * EDGES.length),
    );
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    group.add(
      new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({
          size: 0.12,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );

    const sfGeo = new THREE.BufferGeometry();
    const SF = 500,
      sf = new Float32Array(SF * 3);
    for (let i = 0; i < SF; i++) {
      sf[i * 3] = (Math.random() - 0.5) * 60;
      sf[i * 3 + 1] = (Math.random() - 0.5) * 40;
      sf[i * 3 + 2] = -Math.random() * 40 - 5;
    }
    sfGeo.setAttribute("position", new THREE.BufferAttribute(sf, 3));
    scene.add(
      new THREE.Points(
        sfGeo,
        new THREE.PointsMaterial({
          color: 0x39435e,
          size: 0.05,
          transparent: true,
          opacity: 0.5,
        }),
      ),
    );

    // raycaster for clicks + hover
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hoveredId = null;
    const setNDC = (e) => {
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    const onClick = (e) => {
      setNDC(e);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(clickTargets, false);
      if (hits.length) onNodeClick(hits[0].object.userData.id);
    };
    const onMove = (e) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
      setNDC(e);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(clickTargets, false);
      hoveredId = hits.length ? hits[0].object.userData.id : null;
      el.style.cursor = hits.length ? "pointer" : "default";
    };
    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    renderer.domElement.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const camTarget = new THREE.Vector3(0, 0, 9);
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const curLook = new THREE.Vector3(0, 0, 0);
    function zone(s) {
      if (s < 0.2) {
        camTarget.set(0, 0, 9);
        lookTarget.set(0, 0, 0);
      } else if (s < 0.45) {
        camTarget.set(2.4, 0.4, 6.5);
        lookTarget.set(2.8, 0.2, -1);
      } else if (s < 0.72) {
        camTarget.set(-2.6, 0, 6.5);
        lookTarget.set(-3.4, 0.1, -1.5);
      } else {
        camTarget.set(0, -1.6, 7.5);
        lookTarget.set(0, -2.6, -2);
      }
    }

    const clock = new THREE.Clock();
    let raf;
    const tmpA = new THREE.Vector3(),
      tmpB = new THREE.Vector3();
    const animate = () => {
      const t = clock.getElapsedTime();
      zone(progressRef.current);
      camTarget.x += mouse.current.x * 1.0;
      camTarget.y += -mouse.current.y * 0.7;
      camera.position.lerp(camTarget, 0.045);
      curLook.lerp(lookTarget, 0.045);
      camera.lookAt(curLook);

      group.rotation.y = t * 0.035;
      group.position.y = Math.sin(t * 0.4) * 0.1;

      Object.entries(nodeMeshes).forEach(([id, nm], i) => {
        nm.wire.rotation.x += 0.007;
        nm.wire.rotation.y += 0.008;
        const hov = id === hoveredId;
        nm.wire.material.emissiveIntensity +=
          ((hov ? 3 : 0.8) - nm.wire.material.emissiveIntensity) * 0.15;
        nm.wire.material.color.lerp(
          hov ? new THREE.Color(COL.cyanBright) : nm.color,
          0.15,
        );
        const pulse = 1 + Math.sin(t * 1.5 + i) * 0.12;
        nm.core.scale.setScalar(pulse * (hov ? 1.3 : 1));
        nm.halo.material.opacity =
          (hov ? 0.16 : 0.06) + (Math.sin(t * 1.5 + i) * 0.5 + 0.5) * 0.05;
      });

      for (let i = 0; i < NUM; i++) {
        pT[i] += pSpd[i];
        if (pT[i] > 1) {
          pT[i] = 0;
          pEdge[i] = Math.floor(Math.random() * EDGES.length);
        }
        const [a, b] = EDGES[pEdge[i]];
        tmpA.set(...NODES.find((n) => n.id === a).pos);
        tmpB.set(...NODES.find((n) => n.id === b).pos);
        tmpA.lerp(tmpB, pT[i]);
        pPos[i * 3] = tmpA.x;
        pPos[i * 3 + 1] = tmpA.y;
        pPos[i * 3 + 2] = tmpA.z;
        const c = new THREE.Color(NODES.find((n) => n.id === a).color);
        pCol[i * 3] = c.r;
        pCol[i * 3 + 1] = c.g;
        pCol[i * 3 + 2] = c.b;
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [progressRef, onNodeClick]);

  return <div ref={mount} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
}

// ---- content sections (overlay) -------------------------------------------
const SECTIONS = [
  {
    align: "start",
    accent: COL.cyan,
    tag: "SENIOR AI & BACKEND ENGINEER",
    hero: true,
    title: (
      <>
        Surya Teja <span style={{ color: COL.indigoSoft }}>Pinninti</span>
      </>
    ),
    quote: "“Live in the future and build what’s missing.”",
    body: "5.5+ years building scalable distributed architectures, agentic AI workflows (LangGraph), and high-availability SaaS systems.",
    chips: ["FastAPI", "LangGraph", "AWS", "Spring Boot"],
    buttons: [],
  },
  {
    align: "end",
    accent: COL.indigo,
    tag: "INTELLIGENT WORKFLOWS",
    title: "Agentic core & RAG architectures",
    body: "Multi-agent LangGraph StateGraphs, structured Pydantic outputs, and Vertex AI vector retrieval — production AI that recovers from crashes and keeps humans in the loop.",
    buttons: [
      ["infiswift", "InfiSwift deep dive"],
      ["deshaw", "D.E. Shaw details"],
    ],
  },
  {
    align: "start",
    accent: COL.cyan,
    tag: "ENTERPRISE ENGINEERING",
    title: "Distributed backend systems",
    body: "Decoupling monoliths into responsive microservices and scaling mission-critical architectures — for BMW, Mercedes, Porsche, and Amazon's Q4 peak.",
    buttons: [
      ["tekion", "Tekion deep dive"],
      ["amazon", "Amazon SDE core"],
      ["delhivery", "Delhivery WMS"],
    ],
  },
];

export default function NeuralOrchestratorV2() {
  const progressRef = useRef(0);
  const [pct, setPct] = useState(0);
  const [active, setActive] = useState(null);

  const onScroll = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    progressRef.current = p;
    setPct(Math.round(p * 100));
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const open = useCallback((id) => RESUME[id] && setActive(RESUME[id]), []);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const justify = { start: "flex-start", end: "flex-end", center: "center" };

  return (
    <div
      style={{
        background: COL.bg,
        color: COL.ink,
        position: "relative",
        overflowX: "hidden",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0}
        ::selection{background:rgba(6,182,212,.4)}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
        @keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
        .mono{font-family:'JetBrains Mono',monospace}
        .dbtn{transition:all .2s ease}
        .dbtn:hover{transform:translateY(-1px); filter:brightness(1.25)}
        .nlink{transition:color .25s ease}
        .closeb{transition:all .2s ease}
        .closeb:hover{background:rgba(255,255,255,.12)!important; color:#fff!important}
      `}</style>

      <OrchestratorCanvas progressRef={progressRef} onNodeClick={open} />

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px clamp(24px,5vw,56px)",
          background: "linear-gradient(180deg, rgba(4,4,9,.9), transparent)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: ".92rem",
            letterSpacing: ".2em",
            color: COL.cyan,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: COL.cyan,
              animation: "pulseDot 1.4s infinite",
            }}
          />{" "}
          SYS.RUNNING // NODE_CENTRAL
        </span>
        <div style={{ display: "flex", gap: 28 }} className="mono">
          <a
            href="https://github.com/Surya2106"
            target="_blank"
            rel="noreferrer"
            className="nlink"
            style={{
              fontSize: ".96rem",
              color: COL.dim,
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/surya0104"
            target="_blank"
            rel="noreferrer"
            className="nlink"
            style={{
              fontSize: ".96rem",
              color: COL.dim,
              textDecoration: "none",
            }}
          >
            LinkedIn
          </a>
        </div>
      </nav>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1380,
          margin: "0 auto",
          padding: "0 clamp(24px,5vw,56px)",
          pointerEvents: "none",
        }}
      >
        {SECTIONS.map((s, i) => (
          <section
            key={i}
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: justify[s.align],
            }}
          >
            <div
              style={{
                maxWidth: 680,
                background: "rgba(7,9,16,.55)",
                backdropFilter: "blur(14px)",
                border: `1px solid ${s.accent}33`,
                borderRadius: 18,
                padding: "44px 42px",
                pointerEvents: "auto",
                textAlign:
                  s.align === "center"
                    ? "center"
                    : s.align === "end"
                      ? "right"
                      : "left",
                boxShadow: `0 30px 80px -40px ${s.accent}66`,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: ".96rem",
                  letterSpacing: ".16em",
                  color: s.accent,
                  textTransform: "uppercase",
                  border: `1px solid ${s.accent}33`,
                  background: `${s.accent}14`,
                  padding: "7px 14px",
                  borderRadius: 100,
                  display: "inline-block",
                }}
              >
                {s.tag}
              </span>
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: s.hero
                    ? "clamp(2.8rem,6.5vw,4.8rem)"
                    : "clamp(2rem,4.6vw,3.1rem)",
                  letterSpacing: "-.02em",
                  margin: "20px 0 0",
                  lineHeight: 1.05,
                }}
              >
                {s.title}
              </h1>
              {s.quote && (
                <p
                  style={{
                    fontStyle: "italic",
                    color: COL.indigoSoft,
                    marginTop: 16,
                    fontSize: "1.24rem",
                  }}
                >
                  {s.quote}
                </p>
              )}
              <p
                className="mono"
                style={{
                  color: COL.dim,
                  fontSize: "1.02rem",
                  lineHeight: 1.7,
                  marginTop: 18,
                }}
              >
                {s.body}
              </p>
              {s.chips && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 22,
                  }}
                >
                  {s.chips.map((c) => (
                    <span
                      key={c}
                      className="mono"
                      style={{
                        fontSize: "1rem",
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.1)",
                        padding: "7px 13px",
                        borderRadius: 6,
                        color: COL.dim,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {s.buttons.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 26,
                    justifyContent:
                      s.align === "center"
                        ? "center"
                        : s.align === "end"
                          ? "flex-end"
                          : "flex-start",
                  }}
                >
                  {s.buttons.map(([id, label], j) => (
                    <button
                      key={id}
                      onClick={() => open(id)}
                      className="dbtn mono"
                      style={{
                        padding: "12px 22px",
                        borderRadius: 8,
                        fontSize: "1.05rem",
                        cursor: "pointer",
                        color: j === 0 ? s.accent : COL.dim,
                        background:
                          j === 0 ? `${s.accent}22` : "rgba(255,255,255,.04)",
                        border: `1px solid ${j === 0 ? s.accent + "44" : "rgba(255,255,255,.1)"}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {label} →
                    </button>
                  ))}
                </div>
              )}
              {s.hero && (
                <p
                  className="mono"
                  style={{
                    marginTop: 24,
                    fontSize: "1.05rem",
                    color: COL.cyan,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Click a glowing node, or scroll to inspect →
                </p>
              )}
            </div>
            {s.hero && (
              <div
                className="mono"
                style={{
                  marginTop: 30,
                  color: COL.dim,
                  fontSize: ".88rem",
                  animation: "bob 2s ease-in-out infinite",
                }}
              >
                scroll to orchestrate ↓
              </div>
            )}
          </section>
        ))}

        {/* SYSTEM CORE — bento grid: skills, journey, startup, hobbies */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 14,
            }}
          >
            <span
              className="mono"
              style={{
                gridColumn: "1 / -1",
                fontSize: ".78rem",
                letterSpacing: ".18em",
                color: COL.cyan,
                textTransform: "uppercase",
              }}
            >
              ▸ SYSTEM_CORE // the engine behind the work
            </span>

            {/* skills ledger */}
            <div
              style={{
                gridColumn: "span 12",
                ...(window.innerWidth > 760 && { gridColumn: "span 8" }),
                background: "rgba(7,9,16,.6)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 14,
                padding: 32,
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: ".76rem",
                  letterSpacing: ".14em",
                  color: COL.cyan,
                  textTransform: "uppercase",
                }}
              >
                ◇ Technical skills ledger
              </span>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  margin: "8px 0 16px",
                }}
              >
                System stack mapping
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {SKILLS.map(([cat, items]) => (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      borderBottom: "1px solid rgba(255,255,255,.05)",
                      paddingBottom: 10,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        width: 86,
                        flexShrink: 0,
                        fontSize: ".74rem",
                        color: COL.dim,
                        textTransform: "uppercase",
                        paddingTop: 4,
                      }}
                    >
                      {cat}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {items.map((it) => (
                        <span
                          key={it}
                          className="mono"
                          style={{
                            fontSize: ".8rem",
                            background: "rgba(255,255,255,.03)",
                            border: "1px solid rgba(255,255,255,.1)",
                            padding: "4px 9px",
                            borderRadius: 5,
                            color: "#c4cbd9",
                          }}
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* professional journey */}
            <div
              style={{
                gridColumn: "span 12",
                ...(window.innerWidth > 760 && { gridColumn: "span 4" }),
                background: "rgba(7,9,16,.6)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 14,
                padding: 32,
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  className="mono"
                  style={{
                    fontSize: ".76rem",
                    letterSpacing: ".14em",
                    color: COL.cyan,
                    textTransform: "uppercase",
                  }}
                >
                  ◇ Professional path
                </span>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.6rem",
                    margin: "8px 0 16px",
                  }}
                >
                  Telemetry log
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {JOURNEY.map(([co, meta, c]) => (
                    <div
                      key={co}
                      style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12 }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                        {co}
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: ".76rem",
                          color: COL.dim,
                          marginTop: 2,
                        }}
                      >
                        {meta}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => open("awards")}
                className="dbtn mono"
                style={{
                  marginTop: 18,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 7,
                  fontSize: ".82rem",
                  cursor: "pointer",
                  color: COL.violet,
                  background: `${COL.violet}1c`,
                  border: `1px solid ${COL.violet}44`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                ★ Academic & honors ledger
              </button>
            </div>

            {/* startup sandbox */}
            <div
              style={{
                gridColumn: "span 12",
                ...(window.innerWidth > 760 && { gridColumn: "span 6" }),
                background: `linear-gradient(160deg, ${COL.violet}1a, rgba(7,9,16,.6))`,
                border: `1px solid ${COL.violet}33`,
                borderRadius: 14,
                padding: 32,
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: ".76rem",
                  letterSpacing: ".14em",
                  color: COL.violet,
                  textTransform: "uppercase",
                }}
              >
                ◇ Startup incubator
              </span>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  margin: "8px 0 8px",
                }}
              >
                Future ventures
              </h3>
              <p
                className="mono"
                style={{
                  fontSize: ".92rem",
                  color: COL.dim,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                An aspiring entrepreneur — researching market viability, SaaS
                unit economics and 0→1 validation, working toward founding an
                AI-centric backend-automation startup.
              </p>
              <div
                className="mono"
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,.06)",
                  display: "flex",
                  gap: 14,
                  fontSize: ".74rem",
                  color: COL.violet,
                  flexWrap: "wrap",
                }}
              >
                <span>[ STATUS: DEEP_RESEARCH ]</span>
                <span>[ FOCUS: SYSTEMATIC_SAAS ]</span>
              </div>
            </div>

            {/* personal kernel / hobbies */}
            <div
              style={{
                gridColumn: "span 12",
                ...(window.innerWidth > 760 && { gridColumn: "span 6" }),
                background: "rgba(7,9,16,.6)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 14,
                padding: 32,
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: ".76rem",
                  letterSpacing: ".14em",
                  color: COL.cyanBright,
                  textTransform: "uppercase",
                }}
              >
                ◇ Personal kernel
              </span>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  margin: "8px 0 16px",
                }}
              >
                Beyond code
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {KERNEL.map(([tag, name, desc, c]) => (
                  <div
                    key={tag}
                    style={{
                      border: "1px solid rgba(255,255,255,.06)",
                      background: "rgba(255,255,255,.01)",
                      borderRadius: 9,
                      padding: 12,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: ".7rem",
                        color: c,
                        letterSpacing: ".1em",
                      }}
                    >
                      {tag}
                    </span>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: ".96rem",
                        marginTop: 4,
                      }}
                    >
                      {name}
                    </div>
                    <p
                      className="mono"
                      style={{
                        fontSize: ".72rem",
                        color: COL.dim,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* DEEP-DIVE DRAWER */}
      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(0,0,0,.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 100%)",
              height: "100vh",
              background: "#08080e",
              borderLeft: `1px solid ${active.color}44`,
              padding: "clamp(24px,4vw,40px)",
              overflowY: "auto",
              animation: "slideIn .35s cubic-bezier(.2,.7,.2,1)",
              boxShadow: "-30px 0 80px -30px rgba(0,0,0,.9)",
            }}
          >
            <button
              onClick={() => setActive(null)}
              className="closeb"
              style={{
                position: "absolute",
                top: 22,
                right: 22,
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,.06)",
                color: COL.dim,
                fontSize: "1.1rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <span
              className="mono"
              style={{
                fontSize: ".84rem",
                letterSpacing: ".14em",
                color: active.color,
                textTransform: "uppercase",
              }}
            >
              {active.period}
            </span>
            <h3
              style={{
                fontSize: "clamp(1.7rem,4vw,2.3rem)",
                fontWeight: 700,
                margin: "6px 0 4px",
              }}
            >
              {active.title}
            </h3>
            <p
              className="mono"
              style={{ fontSize: ".95rem", color: COL.indigoSoft, margin: 0 }}
            >
              {active.role} · {active.location}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px,1fr))",
                gap: 10,
                margin: "24px 0",
                padding: "20px 0",
                borderTop: "1px solid rgba(255,255,255,.07)",
                borderBottom: "1px solid rgba(255,255,255,.07)",
              }}
            >
              {active.metrics.map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    background: "rgba(255,255,255,.02)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 8,
                    padding: "12px",
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: active.color,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: ".72rem",
                      color: COL.dim,
                      marginTop: 4,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <h4
              className="mono"
              style={{
                fontSize: ".84rem",
                letterSpacing: ".12em",
                color: active.color,
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              ▸ Mission summary
            </h4>
            <p
              className="mono"
              style={{
                fontSize: "1rem",
                color: "#c4cbd9",
                lineHeight: 1.6,
                background: "rgba(255,255,255,.02)",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 8,
                padding: 16,
                margin: 0,
              }}
            >
              {active.summary}
            </p>

            <h4
              className="mono"
              style={{
                fontSize: ".84rem",
                letterSpacing: ".12em",
                color: active.color,
                textTransform: "uppercase",
                margin: "28px 0 14px",
              }}
            >
              ▸ Execution records
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {active.highlights.map((h, i) => (
                <li
                  key={i}
                  className="mono"
                  style={{
                    display: "flex",
                    gap: 11,
                    fontSize: ".95rem",
                    color: COL.dim,
                    lineHeight: 1.55,
                  }}
                >
                  <span style={{ color: active.color, flexShrink: 0 }}>◇</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <h4
              className="mono"
              style={{
                fontSize: ".84rem",
                letterSpacing: ".12em",
                color: COL.dim,
                textTransform: "uppercase",
                margin: "30px 0 12px",
              }}
            >
              Technologies leveraged
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                paddingBottom: 30,
              }}
            >
              {active.skills.map((s) => (
                <span
                  key={s}
                  className="mono"
                  style={{
                    fontSize: ".88rem",
                    background: `${active.color}1a`,
                    border: `1px solid ${active.color}33`,
                    color: COL.indigoSoft,
                    padding: "6px 11px",
                    borderRadius: 6,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTACT strip at very bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 20px 90px",
          pointerEvents: "auto",
        }}
      >
        <a
          href="mailto:suryatejapinninti0918@gmail.com"
          className="dbtn mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "14px 28px",
            borderRadius: 8,
            background: `linear-gradient(120deg, ${COL.cyan}, ${COL.indigo})`,
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            boxShadow: `0 16px 40px -16px ${COL.cyan}`,
          }}
        >
          ✉ Contact the architect
        </a>
      </div>

      <div
        className="mono"
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 40,
          fontSize: ".8rem",
          color: COL.dim,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span>CORE_SEQ</span>
        <div
          style={{
            width: 120,
            height: 3,
            background: "#15171f",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${COL.cyan}, ${COL.indigo})`,
              transition: "width .1s linear",
            }}
          />
        </div>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
