// ============================================================================
//  Every resume point, grouped into "traces" that open from the project cards
//  and the journey timeline. `scene` is the particle shape the trace morphs to.
//  Tags: ai · infra · perf · quality · lead · ops · result
//  Wrap a figure in [[ ]] to highlight it. Metrics: [value, suffix, label, prefix?]
// ============================================================================

export const TRACES = [
  {
    id: "estimation",
    scene: 1,
    run: "infiswift/ai-estimation",
    title: "AI Estimation Platform for a Japanese solar energy company",
    role: "Senior AI Engineer · Freelance",
    org: "InfiSwift AI",
    when: "Nov 2025 – Present",
    where: "Remote",
    summary: "An end-to-end AI document-processing system for a solar energy company in Japan. It turns unstructured PDFs, Excel sheets, CSVs and emails into validated cost estimates, with a person in the loop wherever the data isn't grounded",
    brief: [
      ["The problem", "Every solar project starts as a pile of paperwork: supplier quotes, equipment lists, spreadsheets and long email threads, all in different formats. Estimators read all of it by hand, look up prices across tiered supplier catalogs, work out shipping rules and assemble a cost estimate. It was slow, repetitive and easy to get wrong"],
      ["What I built", "A team of AI agents that does that work end to end. They read every document, pull out the quantities and specs, apply the right pricing tier and shipping rules, check the result against 48+ expert rules, and produce a validated estimate"],
      ["Where people stay in control", "The system never guesses. If a number can't be traced back to a source document, it pauses and asks a reviewer, then learns from the answer so the same gap is handled automatically next time. Every AI decision and human override is recorded, so any estimate can be explained line by line"],
      ["The result", "Estimators spend about 60% less time on manual work, extracted data is 35% more accurate, documents are processed 3× faster, and shipping-cost mistakes are down 40%. It runs as a secure multi-tenant SaaS product, so each customer's data stays separate"],
    ],
    metrics: [["60", "%", "less manual estimation effort"], ["35", "%", "better data accuracy on noisy documents"], ["3", "×", "ingestion throughput under bulk uploads"], ["40", "%", "fewer incorrect shipping calculations"]],
    stages: [
      { name: "Orchestrate", items: [
        ["ai", "Architected and built an end-to-end AI-powered document processing system using LangGraph multi-agent workflows, automating cost estimation from unstructured PDFs, Excel, CSV, and email inputs for a Japanese solar energy company"],
        ["ai", "Designed a LangGraph StateGraph ([[8+ orchestrated nodes]]) with human-in-the-loop interrupts, enabling safe automation of ambiguous workflows and reducing manual estimation effort by [[60 percent]]"],
        ["infra", "Implemented a custom MySQL-backed checkpointing system for pause/resume across worker crashes and deployments, achieving [[zero workflow data loss]] in production"],
        ["ai", "Evolved the estimation logic from hard-coded engines into fully agentic nodes (an LLM tool belt, [[48+ expert pricing rules]] and a validation gate), with a CI-gated regression suite checking outputs against ground-truth estimates"],
      ] },
      { name: "Extract", items: [
        ["ai", "Integrated GPT-4o with structured Pydantic outputs, enforcing deterministic schema-based extraction and improving data accuracy from noisy documents by [[35 percent]]"],
        ["perf", "Built a parallel file-processing pipeline with configurable ThreadPool/ProcessPool executors, improving document ingestion throughput by [[3×]] under bulk uploads"],
        ["quality", "Added hallucination guards to extraction: any value that isn't grounded in the source documents is never accepted automatically and triggers a human-in-the-loop review instead. The reviewer's resolution is fed back into the agentic loop, so the same kind of gap is handled automatically next time and manual interventions steadily drop. Benchmarked GPT-4o against Gemini to guide model selection"],
      ] },
      { name: "Price", items: [
        ["ai", "Developed custom LangChain tools for tier-based pricing and shipping rule computation, automating complex pricing logic across multi-tier supplier catalogs"],
        ["ai", "Integrated Google Vertex AI Matching Engine (RAG) for contextual rule retrieval, reducing incorrect shipping calculations by [[40 percent]]"],
      ] },
      { name: "Run safely", items: [
        ["infra", "Designed a two-service architecture (AI worker + FastAPI backend) communicating asynchronously via AWS SQS, improving system scalability and fault isolation"],
        ["infra", "Engineered distributed locking and idempotent workflow execution mechanisms across async AWS SQS retries, eliminating duplicate processing events and ensuring [[exactly-once]] state transitions, reducing workflow inconsistencies from intermittent retries to [[zero]] in production"],
        ["infra", "Implemented context-aware RBAC middleware with JWT validation, entity scoping, and capability-based authorization, enabling secure multi-tenant SaaS operations without cross-tenant access risks"],
        ["ops", "Containerized services with Docker and deployed on AWS infra, ensuring reliable async processing and structured observability with JSON logging"],
        ["quality", "Designed and implemented a comprehensive audit trail and workflow timeline system capturing [[100 percent]] of AI decisions, manual overrides, and cost calculation steps, enabling full traceability across [[8+ workflow nodes]] and reducing compliance-related investigation time by [[60 percent]]"],
      ] },
    ],
    stack: ["LangGraph", "LangChain", "GPT-4o", "Gemini", "Pydantic", "Vertex AI Matching Engine", "FastAPI", "AWS SQS", "MySQL", "Docker", "JWT + RBAC"],
  },
  {
    id: "drawings",
    scene: 2,
    run: "infiswift/structural-drawings",
    title: "Structural Drawing Digitization Platform",
    role: "Senior AI Engineer · Freelance",
    org: "InfiSwift AI",
    when: "Nov 2025 – Present",
    where: "Remote",
    summary: "A computer-vision plus LLM platform, used across around 90 client projects, that reads a building's full set of structural drawings and rebuilds it as a complete 3D model of the concrete and steel, with clash checks, location plans and production-ready reinforcement schedules",
    brief: [
      ["The problem", "Before steel can be cut for a building, someone has to read hundreds of structural drawing sheets, find every column, footing, wall and slab, and work out the exact bars inside each one. Every engineering firm draws differently, so this was slow, manual work done by skilled detailers"],
      ["What it reads", "Whole multi-level PDF sets: floor plans, footing and slab plans, column, wall and footing schedules, detail sheets and sections. It sorts each sheet, reads the tables and text, and finds every element on the building's grid, including rotated sheets, angled elements and buildings with two grids"],
      ["What it produces", "A complete 3D model of the whole building, level by level: every column, footing, wall and slab with its openings, stairs, ramps and drops, plus the steel cages inside them, exported for BIM tools as IFC. From that one model come the clash report between structural elements, location and marking plans for every level, and bar and tie schedules in the manufacturer's production format"],
      ["Where people stay in control", "It never guesses. A wrong but plausible value is treated as worse than a missing one, so anything unclear becomes a Request for Information for a reviewer instead of a silent guess. Reviewer answers and manual edits are kept, and the run picks up from where it stopped"],
      ["The result", "Around 80 of 90 client projects reach more than 95% accuracy, on buildings of up to 14 levels"],
    ],
    metrics: [["80", "", "of 90 client projects above 95% accuracy", "~"], ["95", "%+", "accuracy on those projects"], ["31", "", "nodes in the LangGraph pipeline"], ["14", "", "building levels handled in one model"]],
    stages: [
      { name: "Read", items: [
        ["ai", "Owned the extraction pipeline end to end on a computer-vision plus LLM platform: a [[30+-node]] LangGraph workflow that classifies and reads multi-level structural PDFs, locates elements on engineering grids and produces production-ready reinforcement schedules and 3D models"],
        ["ai", "Built a hybrid extraction layer that combines [[six custom computer-vision models]] (detection and segmentation for columns, footings, grids, outlines, ties and walls) with Gemini-based table and tie-detail extraction using tool use and schema-validated output, so drawings with no standard format are read reliably"],
        ["ai", "Classified every sheet, grouped sheets by level, and read text from both OCR and the PDF text layer, so schedules, callouts and level names are resolved before any element is placed"],
        ["ai", "Generalised the extraction logic to new structural element types by combining drawn dimensions, section views and grid axes, so one set of rules holds across [[7+ real project sets]] instead of needing per-project fixes"],
      ] },
      { name: "Columns and ties", items: [
        ["ai", "Placed every column with its size, shape, orientation and levels, and classified how it changes between floors across [[7 transition types]]: goes through, shifts, changes size, shape or orientation, terminates, or runs a double lift"],
        ["quality", "Measured angled elements from their true oriented box, not the screen-aligned envelope, so a column drawn at an angle keeps its real dimensions"],
        ["ai", "Read tie details with two LLM steps, one to identify the tie shapes and one to place them, then enforced symmetric tie layouts and spiral pitch limits for circular columns"],
      ] },
      { name: "Walls, slabs and footings", items: [
        ["ai", "Detected concrete walls on rotated and angled sheets, then worked out openings, junctions, thickness and heights against the slabs, trimming each wall at column faces"],
        ["ai", "Rebuilt every slab from outline detection, PDF vector lines and an LLM agent, including openings, drops, stairs, beams and bands, thickness changes, ramps and falls, and pour breaks"],
        ["ai", "Generated top and bottom bar meshes for pad footings, merged neighbouring footings with the same spec, and nested each ground-level column inside its footing"],
      ] },
      { name: "Locate", items: [
        ["ai", "Engineered grid-based geolocation that maps detected elements from pixels into one shared world coordinate system, plus elevation-based height calculation, so elements from different sheets across buildings of up to [[14 levels]] line up in a single unified geometry file"],
      ] },
      { name: "Schedule and model", items: [
        ["ai", "Developed the scheduling engine that computes bar quantities, lengths and shapes per element. It uses a [[3-tier]] decision cascade, handles [[7 column-transition cases]], places ties symmetrically, enforces production length and weight limits, and exports schedules in the manufacturer's production format"],
        ["result", "Generated 3D models of concrete geometry and the internal reinforcement cages, annotated location plans per level and element type, and a project-wide 3D scene with clash detection between structural elements"],
        ["perf", "Grouped identical column stacks so they share one schedule, cutting duplicate work for the production team"],
      ] },
      { name: "Measure", items: [
        ["result", "Benchmarked accuracy on real client projects: around [[80 of 90]] projects reached [[more than 95%]] accuracy"],
        ["perf", "Added per-detector timing at [[20 inference points]] and a process-wide resource profiler to size CPU and GPU machines, plus artifact caching so reruns skip expensive stages. Column detection averages about [[6 minutes]] per project and the outline stage runs [[10 to 40 minutes]] on buildings of 5 to 14 levels"],
      ] },
      { name: "Review", items: [
        ["quality", "Defined a typed taxonomy of [[130+]] Request-for-Information issue types with criticality levels and a resolution lifecycle, so ambiguous or missing data is flagged for review instead of silently guessed"],
        ["quality", "Built a human-in-the-loop review flow: missing or ambiguous data raises a Request for Information instead of failing the run, reviewer answers feed back into the model, and runs resume from checkpoints"],
        ["quality", "Made reviewer edits permanent: walls a reviewer adds are replayed on every run, elements they delete stay deleted, and locked levels and schedule overrides always win over the AI"],
      ] },
      { name: "Deploy", items: [
        ["infra", "Deployed the pipeline as SQS-driven workers on AWS EC2 (CPU and GPU Docker profiles) with Redis and Celery, S3 artifact storage, a MySQL checkpointer for resumable runs and CodeBuild/CodeDeploy CI/CD. LLM calls are traced with per-run cost tracking, and LLM agent loops with tool use handle slab outlines and tie detail identification"],
        ["infra", "Ran Gemini across four cost tiers with automatic fallback when rate-limited and fixed seeds for reproducible runs"],
      ] },
      { name: "Now building", items: [
        ["ai", "Extending the pipeline to masonry block walls on its own path, behind a feature flag, verified to leave every concrete result unchanged across [[13]] projects"],
      ] },
    ],
    stack: ["LangGraph", "Computer vision", "Gemini", "OpenAI", "AWS SQS", "EC2 CPU/GPU", "Docker", "Redis", "Celery", "S3", "MySQL", "CodeBuild", "CodeDeploy"],
  },
  {
    id: "desk",
    scene: 3,
    run: "deshaw/qa-assistant",
    title: "An AI QA assistant for a trading systems team",
    role: "Senior Member of Technical Staff",
    org: "D.E. Shaw India",
    when: "Nov 2024 – Jun 2025",
    where: "Hyderabad",
    summary: "On the trading team, designing, building and running robust trading systems, and building an internal AI chatbot that answers QA questions from Confluence, the internal ticketing tool and Slack",
    metrics: [["40", "%", "fewer repetitive QA queries"], ["45", "%", "faster average response"], ["25", "%", "more relevant responses"], ["30", "%", "less production debugging time"]],
    stages: [
      { name: "Trading systems", items: [
        ["infra", "Designed, developed and implemented robust trading systems as part of the trading team"],
        ["quality", "Maintained and enhanced legacy trading systems, fixing critical bugs and shipping small feature improvements"],
      ] },
      { name: "Ingest", items: [
        ["ai", "Built an AI chatbot for QA systems using Confluence documentation, Desflow (the internal ticketing tool) and Slack conversations as its knowledge"],
        ["infra", "Built scalable ingestion pipelines that indexed [[thousands]] of internal documents and historical tickets, enabling semantic search across years of institutional knowledge"],
      ] },
      { name: "Retrieve and answer", items: [
        ["ai", "Added structured summarisation and contextual enrichment, reducing repetitive QA queries by [[40%]] and issue triage time by [[30–35%]] during release cycles"],
        ["ai", "Refined chunking, embedding pipelines and prompt design, raising the relevant-response rate by [[25%]]"],
        ["perf", "Optimised inference latency and caching, cutting average response time by [[45%]] under peak internal usage"],
      ] },
      { name: "Keep it good", items: [
        ["quality", "Designed a feedback loop on \"Helpful / Not helpful\" ratings that drove prompt and retrieval improvements and raised the trusted-response rate across teams"],
        ["quality", "Built offline evaluation and prompt regression pipelines to stop quality slipping during model or prompt updates"],
        ["ops", "Added structured logging, p95/p99 latency dashboards and failure categorisation, reducing chatbot production debugging time by [[30%]]"],
        ["lead", "Supported post-launch scaling and cross-team adoption, speeding up onboarding for new engineers and reducing reliance on senior engineers for historical issues"],
      ] },
    ],
    stack: ["RAG", "Embeddings", "Semantic search", "Prompt evaluation", "Caching", "Observability"],
  },
  {
    id: "tekion",
    scene: 4,
    run: "tekion/integrations",
    title: "Breaking up the monolith",
    role: "Software Engineer 1 (Level 2)",
    org: "Tekion",
    when: "Mar 2023 – Nov 2024",
    where: "Bengaluru",
    summary: "On the integrations team, designing and building the integrations that onboard OEMs and dealers onto Tekion's Dealer Management System",
    metrics: [["90", "%", "faster integrations, 1 month to 3 days"], ["3000", "×", "lower API latency, 3 s to ~1 ms"], ["0.2", "%", "repair-order error rate, down from 10%"], ["2", "", "engineers mentored"]],
    stages: [
      { name: "Re-architect", items: [
        ["infra", "Directed a team initiative to split a monolithic service into microservices, cutting integration time by [[90%]], from [[1 month to 3 days]] per integration, and making debugging far simpler"],
        ["quality", "Refactored the codebase with the delegation pattern for stability, readability and scalability, outside sprint work"],
      ] },
      { name: "Integrate", items: [
        ["lead", "Led mission-critical integrations with [[BMW Canada]], [[Mercedes-Benz Canada]], [[Porsche Global]] and [[Fleetbox]] onto the DMS"],
        ["quality", "Fixed OEM repair-order integration bugs, bringing the error rate down from [[10% to 0.2%]]"],
      ] },
      { name: "Speed up", items: [
        ["perf", "Rebuilt the vehicle information interface and APIs with multi-threading, cutting average API latency from [[3 seconds to ~1 ms]]"],
      ] },
      { name: "Team", items: [
        ["lead", "Led onboarding for a new software engineer"],
        ["lead", "Mentored [[2]] SDE-1s"],
        ["result", "Named [[Best Developer of the Quarter]] for critical integrations and proactive ownership of the codebase"],
      ] },
    ],
    stack: ["Java", "Spring Boot", "Microservices", "Multi-threading", "Delegation pattern", "OEM integrations"],
  },
  {
    id: "amazon",
    scene: 5,
    run: "amazon/buyer-risk",
    title: "Automating fraud checks at peak scale",
    role: "Software Development Engineer 1",
    org: "Amazon Development Center",
    when: "Jun 2021 – Mar 2023",
    where: "Bengaluru",
    summary: "On the Buyer Risk evaluation team, keeping fraud checks fast, correct and automated across marketplaces, including through Black Friday and Cyber Monday",
    metrics: [["16", "%", "more automated Buyer Risk investigations"], ["5.38", "%", "automation lift in North America"], ["40", "%", "fewer tickets in a year"], ["5000", "", "dollars a month saved by deprecating an API", "$"]],
    stages: [
      { name: "Migrate", items: [
        ["infra", "Migrated a critical risk-evaluation service from its V1 flow to V2, delivering key features on time with integration and unit tests for every change, lowering cost and latency"],
      ] },
      { name: "Automate", items: [
        ["ai", "Designed APIs that generate model variables. Retraining the ML models on them raised automation of Buyer Risk manual investigations by nearly [[16%]]"],
        ["result", "Wrote the launch plan for continuous evaluation across all buyer-fraud marketplaces: automation rose [[5.38%]] in North America, [[2.09%]] in Europe and [[0.43%]] in the Far East"],
      ] },
      { name: "Operate", items: [
        ["ops", "Owned the Q4 peak for Black Friday and Cyber Monday: gathered traffic projections from upstream teams and scaled hosts up and down for every service. [[Zero issues]] during peak"],
        ["ops", "Drove down high- and low-severity tickets by closing action items on each one, cutting the ticket count by [[40%]] in a year. Recognised for the operational-excellence work"],
        ["perf", "Deprecated an API from the service, saving nearly [[$5,000 a month]]"],
        ["infra", "Worked across SQS, SNS, CloudWatch, DynamoDB, EC2, Lambda, S3, IAM, CloudFormation and VPC"],
      ] },
      { name: "Team", items: [
        ["lead", "Mentored [[1]] SDE"],
        ["lead", "Took [[30+]] interviews and was recognised for making the best hiring decisions"],
      ] },
    ],
    stack: ["Java", "AWS SQS", "SNS", "CloudWatch", "DynamoDB", "EC2", "Lambda", "S3", "IAM", "CloudFormation", "VPC"],
  },
  {
    id: "delhivery",
    scene: 6,
    run: "delhivery/wms",
    title: "Where it started: warehouse systems",
    role: "Software Developer",
    org: "Delhivery",
    when: "Sep 2020 – Jun 2021",
    where: "Gurgaon",
    summary: "First job out of college, on the Warehouse Management System team at one of India's largest logistics companies",
    metrics: [],
    stages: [
      { name: "Build", items: [
        ["infra", "Worked across WMS microservices with Python, Flask, PostgreSQL, Celery, Kafka, Elasticsearch, Kibana and Coralogix"],
        ["result", "Worked with the Telescope team, which surfaces insights from the enterprise logistics system to clients such as [[Voltas]] and [[Realme]]"],
      ] },
    ],
    stack: ["Python", "Flask", "PostgreSQL", "Celery", "Kafka", "Elasticsearch", "Kibana", "Coralogix"],
  },
  {
    id: "record",
    scene: 6,
    run: "anits/record",
    title: "The competitive record",
    role: "B.Tech, Computer Science and Engineering",
    org: "ANITS",
    when: "2016 – 2020",
    where: "Visakhapatnam",
    summary: "Where the habit started: competitive programming, two ACM-ICPC national finals, and running the clubs that trained the next batch",
    metrics: [["2", "×", "ACM-ICPC national finalist"], ["2", "", "first places, 2019"], ["1500", "+", "students at the coding events I ran"], ["7.98", "", "B.Tech CGPA, with a merit scholarship"]],
    stages: [
      { name: "Honours", items: [
        ["result", "[[2019]] · ACM-ICPC national finalist"],
        ["result", "[[2018]] · ACM-ICPC national finalist"],
        ["result", "[[2019]] · 1st place, CodeWreck 2.0, Vignan College of Engineering"],
        ["result", "[[2019]] · 1st place, Design Space national competition, ANITS"],
        ["result", "[[2019]] · 2nd place, Turing Cup, CodeChef"],
        ["result", "[[2019]] · 2nd place, Code Avadhan, ANITS TechFest"],
        ["result", "[[2019]] · 2nd place, Code Battle, ANITS TechFest"],
        ["result", "[[2019]] · 2nd place, Debugging competition, JNTU TechFest"],
        ["result", "[[2019]] · 3rd place, 12-hour hackathon, GMR Institute of Technology"],
        ["result", "[[2018]] · 3rd place, Code Dual, Lendi Institute of Technology"],
      ] },
      { name: "Clubs", items: [
        ["lead", "President, ACM-ICPC student club (2019–20): trained juniors for ICPC and other national contests, and organised [[10+]] coding competitions and tech lectures"],
        ["lead", "Secretary, Computer Society of India (2019–20): won the [[Best Secretary]] award, organised tech workshops and coordinated with other clubs"],
        ["lead", "Technical coordinator, CURSORS TechFest 2020: ran Fortnight Coding, Code Battle, Code Dual and Debug the Bug for [[1,500+]] students from across the country"],
      ] },
      { name: "Education", items: [
        ["result", "B.Tech in Computer Science, ANITS, 2016–2020. CGPA [[7.98]], with the department's scholarship for promising students"],
        ["result", "Intermediate (MPC), Sri Chaitanya College, 2014–2016: [[97.2%]]"],
        ["result", "SSC, Dr. Besant English Medium High School, 2011–2014: CGPA [[9.8]]"],
      ] },
    ],
    stack: ["C++ with STL", "Algorithms", "Data structures"],
  },
];
