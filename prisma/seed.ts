import { PrismaClient, Role, ModuleCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [u1, u2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      create: { email: "alice@example.com", displayName: "Alice", role: Role.CLINICIAN },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      create: { email: "bob@example.com", displayName: "Bob", role: Role.CLINICIAN },
      update: {},
    }),
  ]);

  // Case studies matching src/data/case-studies/*.json
  const caseStudies = [
    {
      id: "case-001",
      title: "The Weekend Warrior",
      synopsis: "Right-sided low back pain radiating to the posterior thigh, present for 3 weeks.",
      creditHours: 1.0,
      version: "1.0",
    },
    {
      id: "draft-002",
      title: "The Remote Worker",
      synopsis: "Right arm pain and tingling with neck stiffness, worsening over 6 weeks.",
      creditHours: 1.0,
      version: "1.0",
    },
    {
      id: "draft-003",
      title: "The Frustrated Disc Patient",
      synopsis: "Persistent buttock and posterior thigh pain 8 months after disc herniation treatment.",
      creditHours: 1.0,
      version: "1.0",
    },
    {
      id: "draft-004",
      title: "The Marathon Trainer",
      synopsis: "Lateral ankle and calf pain during long runs, unresponsive to typical treatments.",
      creditHours: 1.0,
      version: "1.0",
    },
    {
      id: "draft-005",
      title: "The Desk Athlete",
      synopsis: "Lateral elbow pain with forearm weakness, not improving with standard tennis elbow treatment.",
      creditHours: 1.0,
      version: "1.0",
    },
  ];

  const [c1, c2] = await Promise.all([
    prisma.caseStudy.upsert({
      where: { id: "seed-c1" },
      create: { id: "seed-c1", title: "Pediatric Head Injury", synopsis: "3-year-old fall, brief LOC" },
      update: {},
    }),
    prisma.caseStudy.upsert({
      where: { id: "seed-c2" },
      create: { id: "seed-c2", title: "Adult Neck Trauma", synopsis: "MVC, neck pain, no neuro deficits" },
      update: {},
    }),
  ]);

  // Seed the 5 NCA case studies with PACE metadata
  for (const cs of caseStudies) {
    await prisma.caseStudy.upsert({
      where: { id: cs.id },
      create: cs,
      update: {
        title: cs.title,
        synopsis: cs.synopsis,
        creditHours: cs.creditHours,
        version: cs.version,
      },
    });
  }

  const now = new Date();
  const earlier = new Date(now.getTime() - 1000 * 60 * 30);
  await Promise.all([
    prisma.caseAttempt.create({
      data: {
        userId: u1.id,
        caseStudyId: c1.id,
        score: 82,
        rubricVersion: "v1",
        startedAt: earlier,
        completedAt: now,
        durationSec: 1800,
      },
    }),
    prisma.caseAttempt.create({
      data: {
        userId: u2.id,
        caseStudyId: c2.id,
        score: 90,
        rubricVersion: "v1",
        startedAt: earlier,
        completedAt: now,
        durationSec: 1500,
      },
    }),
  ]);

  // Seed NCA Curriculum Modules
  const dtmModules = [
    {
      slug: "dtm-intro",
      title: "DTM Introduction",
      description: "Introduction to Dermal Traction Method - understanding neuropathic pain, vasa nervorum, nervi nervorum, and the DTM workflow.",
      category: ModuleCategory.DTM,
      order: 1,
      contentPath: "nca/NCAContent_Dermal Traction Method-Introduction_Clinician.txt",
      duration: 45,
    },
    {
      slug: "dtm-head-neck",
      title: "DTM: Head & Neck Pain",
      description: "DTM treatment for headaches, TMD, whiplash, cervicalgia. Target neurology: greater/lesser occipital, auricular, supraclavicular nerves.",
      category: ModuleCategory.DTM,
      order: 2,
      contentPath: "nca/NCAContent_DTM_Chapter 1_DTM treatment of Head and Neck Pain_Clinicians.txt",
      duration: 30,
    },
    {
      slug: "dtm-shoulder",
      title: "DTM: Shoulder Pain",
      description: "DTM for rotator cuff, impingement, thoracic outlet. Target: suprascapular, supraclavicular, radial, median, ulnar nerves.",
      category: ModuleCategory.DTM,
      order: 3,
      contentPath: "nca/DTM_Chapter 2_Shoulder_Intro_Clinician.txt",
      duration: 30,
    },
    {
      slug: "dtm-upper-back",
      title: "DTM: Upper Back Pain",
      description: "DTM for cervicalgia, whiplash, spondylosis. Target: dorsalscapular nerve, posterior ramii nerves.",
      category: ModuleCategory.DTM,
      order: 4,
      contentPath: "nca/DTM_Chapter 4_Upper Back_Intro_Clinician.txt",
      duration: 25,
    },
    {
      slug: "dtm-abdomen",
      title: "DTM: Abdominal Pain",
      description: "DTM for sports hernia, surgical scar tethering, costochondritis. Target: anterior/lateral cutaneous branches of intercostal nerves.",
      category: ModuleCategory.DTM,
      order: 5,
      contentPath: "nca/DTM_Chapter 6_Abdomen_Intro_Clinician.txt",
      duration: 25,
    },
    {
      slug: "dtm-hip",
      title: "DTM: Hip & Pelvis Pain",
      description: "DTM for trochanteric bursitis, sciatica, meralgia paresthetica. Target: cluneal, iliohypogastric, sciatic, saphenous nerves.",
      category: ModuleCategory.DTM,
      order: 6,
      contentPath: "nca/DTM_Chapter 7_Hip_Intro_Clinician.txt",
      duration: 30,
    },
  ];

  const fyobModules = [
    {
      slug: "fyob-hierarchy",
      title: "Movement Hierarchy",
      description: "Understanding the movement hierarchy in functional rehabilitation.",
      category: ModuleCategory.FYOB,
      order: 1,
      videoUrl: "FYOBStrength_M12V1_hierarchy.mp4",
      duration: 20,
    },
    {
      slug: "fyob-foot",
      title: "Foot Considerations",
      description: "Foot assessment and exercise considerations in strength training.",
      category: ModuleCategory.FYOB,
      order: 2,
      videoUrl: "FYOBStrength_M14V2_foot.mp4",
      duration: 20,
    },
    {
      slug: "fyob-big-lifts",
      title: "Big Lifts Overview",
      description: "Introduction to the foundational big lift patterns.",
      category: ModuleCategory.FYOB,
      order: 3,
      videoUrl: "FYOBStrength_M15V1_biglift2.mp4",
      duration: 25,
    },
    {
      slug: "fyob-squat",
      title: "Squat Mechanics",
      description: "Proper squat mechanics and coaching cues.",
      category: ModuleCategory.FYOB,
      order: 4,
      videoUrl: "FYOBStrength_M15V2_squat.mp4",
      duration: 25,
    },
    {
      slug: "fyob-bench",
      title: "Bench Press",
      description: "Bench press technique and programming.",
      category: ModuleCategory.FYOB,
      order: 5,
      videoUrl: "FYOBStrength_M15V5_benchpress.mp4",
      duration: 20,
    },
    {
      slug: "fyob-programming",
      title: "Programming Fundamentals",
      description: "Introduction to strength training programming principles.",
      category: ModuleCategory.FYOB,
      order: 6,
      videoUrl: "FYOBStrength_M16V1_programming intro.mp4",
      duration: 30,
    },
  ];

  const clunealModules = [
    {
      slug: "cluneal-manual",
      title: "Cluneal Nerve Manual Therapy",
      description: "Manual therapy techniques for cluneal nerve sensitization.",
      category: ModuleCategory.DTM,
      order: 7,
      videoUrl: "MCV3_Cluneal_Manual.mp4",
      duration: 20,
    },
    {
      slug: "cluneal-exercise",
      title: "Cluneal Nerve Exercises",
      description: "Exercise protocols for cluneal nerve issues.",
      category: ModuleCategory.DTM,
      order: 8,
      videoUrl: "MCV4_Cluneal_Exercise.mp4",
      duration: 20,
    },
  ];

  // Create modules
  for (const mod of [...dtmModules, ...fyobModules, ...clunealModules]) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      create: mod,
      update: mod,
    });
  }

  // Create Foundations module with readings
  const foundationsModule = await prisma.module.upsert({
    where: { slug: "foundations" },
    create: {
      slug: "foundations",
      title: "NCA Foundations",
      description: "Foundational texts and references for understanding the NeuroCentric Approach.",
      category: ModuleCategory.FOUNDATIONS,
      order: 0,
      duration: 0, // Self-paced reading
    },
    update: {
      title: "NCA Foundations",
      description: "Foundational texts and references for understanding the NeuroCentric Approach.",
    },
  });

  const readings = [
    { title: "Clinical Neurodynamics", author: "Shacklock", type: "BOOK", required: true },
    { title: "Explain Pain", author: "Butler & Moseley", type: "BOOK", required: true },
    { title: "Back Mechanic", author: "McGill", type: "BOOK", required: false },
    { title: "Ultimate Back Fitness", author: "McGill", type: "BOOK", required: false },
    { title: "Kolar Clinical Rehabilitation", author: "Kolar", type: "BOOK", required: false },
    { title: "Trail Guide to the Body", author: "Biel", type: "BOOK", required: false },
    { title: "Manual Therapy for Peripheral Nerves", author: "Barral & Croibier", type: "BOOK", required: false },
    { title: "Fascial Manipulation", author: "Stecco", type: "BOOK", required: false },
    { title: "Textbook of Pain", author: "Wall & Melzack", type: "REFERENCE", required: false },
    { title: "Tunnel Syndromes", author: "Pecina", type: "REFERENCE", required: false },
    { title: "Vojta Principles", author: "Vojta", type: "BOOK", required: false },
    { title: "Peripheral Nerve Interventions", author: "Trescot", type: "REFERENCE", required: false },
  ];

  for (const reading of readings) {
    await prisma.reading.upsert({
      where: { id: `reading-${reading.title.toLowerCase().replace(/\s+/g, "-")}` },
      create: {
        id: `reading-${reading.title.toLowerCase().replace(/\s+/g, "-")}`,
        moduleId: foundationsModule.id,
        ...reading,
      },
      update: reading,
    });
  }

  console.log("Seeded NCA case studies, curriculum modules, and readings");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



