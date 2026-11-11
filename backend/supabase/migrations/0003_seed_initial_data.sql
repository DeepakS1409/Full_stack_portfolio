-- ============================================================================
-- 0003_seed_initial_data.sql
-- Idempotent seed of Deepak S initial portfolio content.
-- Mirrors existing frontend content so the database starts ready to use.
-- ============================================================================

-- 1. Profile
INSERT INTO public.profiles (
  slug,
  name,
  display_name,
  degree,
  college,
  batch,
  short_role,
  professional_title,
  hero_intro,
  about_paragraphs,
  learning_journey,
  contact_email,
  is_published
)
VALUES (
  'primary',
  'Deepak S',
  'DEEPAK S',
  'B.Tech Information Technology',
  'Sri Eshwar College of Engineering',
  '2026–2030',
  'Aspiring IT Professional',
  'Aspiring IT Professional | Software Development | Artificial Intelligence | Technology Enthusiast',
  'An aspiring IT professional interested in software development, artificial intelligence, and innovative technology solutions. Passionate about learning, building projects, and exploring new technologies.',
  '[
    "I am Deepak S, an undergraduate student pursuing B.Tech Information Technology (2026–2030) at Sri Eshwar College of Engineering. My academic path is centered on building a solid foundation in programming, software systems, and modern computing.",
    "I am deeply interested in software development and artificial intelligence—particularly how generative AI, intelligent automation, and clean frontend engineering can come together to solve real-world problems.",
    "Alongside software, I actively explore hardware-oriented technologies such as IoT, Arduino, ESP32, robotics, and embedded systems, aiming to bridge software intelligence with physical hardware."
  ]'::jsonb,
  'Currently focused on strengthening core programming fundamentals in C, C++, Python, and JavaScript while building interactive web experiences with React and exploring practical AI integration workflows.',
  '',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Social Links
INSERT INTO public.social_links (profile_id, platform, label, url, placeholder_note, sort_order, is_published)
SELECT
  p.id,
  v.platform,
  v.label,
  v.url,
  v.placeholder_note,
  v.sort_order,
  true
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('github', 'GitHub (@DeepakS1409)', 'https://github.com/DeepakS1409', NULL, 1),
    ('linkedin', 'LinkedIn', NULL, 'LinkedIn profile URL placeholder — update in Admin Dashboard when available.', 2)
) AS v(platform, label, url, placeholder_note, sort_order)
WHERE p.slug = 'primary'
ON CONFLICT (profile_id, platform) DO NOTHING;

-- 3. Skills & Currently Learning
INSERT INTO public.skills (kind, group_key, group_title, group_subtitle, accent, name, focus_note, sort_order, is_published)
SELECT v.kind, v.group_key, v.group_title, v.group_subtitle, v.accent, v.name, v.focus_note, v.sort_order, true
FROM (
  VALUES
    ('skill', 'programming', 'Programming', 'Core languages for problem-solving and system logic', 'cyan', 'C', NULL, 1),
    ('skill', 'programming', 'Programming', 'Core languages for problem-solving and system logic', 'cyan', 'C++', NULL, 2),
    ('skill', 'programming', 'Programming', 'Core languages for problem-solving and system logic', 'cyan', 'Python', NULL, 3),
    ('skill', 'programming', 'Programming', 'Core languages for problem-solving and system logic', 'cyan', 'JavaScript', NULL, 4),
    ('skill', 'frontend', 'Frontend', 'Interfaces, responsive layouts, and interactive components', 'blue', 'HTML', NULL, 10),
    ('skill', 'frontend', 'Frontend', 'Interfaces, responsive layouts, and interactive components', 'blue', 'CSS', NULL, 11),
    ('skill', 'frontend', 'Frontend', 'Interfaces, responsive layouts, and interactive components', 'blue', 'React', NULL, 12),
    ('skill', 'tools', 'Tools', 'Development environments, version control, and prototyping', 'violet', 'Git', NULL, 20),
    ('skill', 'tools', 'Tools', 'Development environments, version control, and prototyping', 'violet', 'GitHub', NULL, 21),
    ('skill', 'tools', 'Tools', 'Development environments, version control, and prototyping', 'violet', 'VS Code', NULL, 22),
    ('skill', 'tools', 'Tools', 'Development environments, version control, and prototyping', 'violet', 'Antigravity', NULL, 23),
    ('skill', 'tools', 'Tools', 'Development environments, version control, and prototyping', 'violet', 'Streamlit', NULL, 24),
    ('skill', 'ai', 'AI', 'Applied intelligence, prompting, and foundational concepts', 'cyan', 'Generative AI', NULL, 30),
    ('skill', 'ai', 'AI', 'Applied intelligence, prompting, and foundational concepts', 'cyan', 'AI Integration', NULL, 31),
    ('skill', 'ai', 'AI', 'Applied intelligence, prompting, and foundational concepts', 'cyan', 'Prompt Engineering', NULL, 32),
    ('skill', 'ai', 'AI', 'Applied intelligence, prompting, and foundational concepts', 'cyan', 'Machine Learning Fundamentals', NULL, 33),
    ('currently_learning', 'learning', 'Currently Learning', 'Active areas of technical growth', 'violet', 'TypeScript & Modern React Architecture', 'Type-safe frontend engineering and scalable component patterns', 100),
    ('currently_learning', 'learning', 'Currently Learning', 'Active areas of technical growth', 'violet', 'Agentic AI & Intelligent Routing', 'Multi-step reasoning, multimodal inputs, and structured AI workflows', 101),
    ('currently_learning', 'learning', 'Currently Learning', 'Active areas of technical growth', 'violet', 'IoT & Embedded Prototyping', 'Arduino, ESP32, sensors, and hardware–software integration', 102),
    ('currently_learning', 'learning', 'Currently Learning', 'Active areas of technical growth', 'violet', 'Interactive Web & 3D Graphics', 'Three.js scenes and hardware-accelerated UI motion', 103)
) AS v(kind, group_key, group_title, group_subtitle, accent, name, focus_note, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.skills s WHERE s.kind = v.kind AND s.group_key = v.group_key AND s.name = v.name
);

-- 4. Projects
INSERT INTO public.projects (slug, name, tagline, description, details, category, status_label, technologies, highlights, sort_order, is_published)
VALUES
  (
    'deepkart',
    'DeepKart',
    'Full-featured E-Commerce Web Experience',
    'An e-commerce website with product browsing, cart, wishlist, checkout, orders and profile features.',
    'DeepKart explores end-to-end online retail workflows on the frontend: structured catalog browsing, interactive cart and wishlist state management, checkout flow design, order tracking views, and user profile management.',
    'Web Application',
    'Project Build',
    '["HTML", "CSS", "JavaScript", "React"]'::jsonb,
    '["Product browsing and category discovery", "Cart and wishlist state management", "Checkout, order overview, and profile flows"]'::jsonb,
    1,
    true
  ),
  (
    'factorymind-ai',
    'FactoryMind AI',
    'AI Digital Twin & Autonomous Scheduling Concept',
    'An AI Digital Twin and Autonomous Production Scheduling concept for industrial production management.',
    'FactoryMind AI conceptualizes a digital twin interface for manufacturing environments, combining real-time production visibility with AI-assisted autonomous scheduling to help optimize floor throughput and resource allocation.',
    'AI Concept',
    'System Concept',
    '["Generative AI", "AI Integration", "Python", "Streamlit"]'::jsonb,
    '["Digital twin production floor representation", "Autonomous scheduling workflow concept", "Decision-support insights for production management"]'::jsonb,
    2,
    true
  ),
  (
    'whatsapp-ai-intelligence-center',
    'WhatsApp AI Intelligence Center',
    'Multimodal Message Analysis & Routing System',
    'An AI-based message analysis and routing system with image and voice classification.',
    'Designed to process incoming conversational inputs across text, image, and voice formats, classify intent or urgency, and route messages intelligently to the appropriate workflow or responder.',
    'AI & Automation',
    'System Concept',
    '["AI Integration", "Prompt Engineering", "Python", "Generative AI"]'::jsonb,
    '["Automated message classification and routing", "Image and voice input analysis pipeline", "Centralized intelligence overview concept"]'::jsonb,
    3,
    true
  ),
  (
    'padika-ai',
    'Padika AI',
    'AI-Powered Educational Assistant Concept',
    'An AI-powered educational assistant concept for learning and academic information.',
    'Padika AI focuses on making academic information and learning support more accessible for students through structured, AI-guided explanations and interactive study assistance.',
    'EdTech & AI',
    'Product Concept',
    '["Generative AI", "Prompt Engineering", "JavaScript", "React"]'::jsonb,
    '["Student-oriented academic query assistance", "Structured learning explanations", "Clean, distraction-free study interface concept"]'::jsonb,
    4,
    true
  ),
  (
    'smart-parking-system',
    'Smart Parking System',
    'QR Entry/Exit & Slot Navigation Concept',
    'A mobile parking application concept with QR-based entry and exit, booking and slot navigation.',
    'Addresses urban parking friction by combining advance slot booking, QR-code gate verification for seamless entry and exit, and guided in-lot navigation toward reserved spaces.',
    'Smart Mobility Concept',
    'Mobile Concept',
    '["JavaScript", "React", "QR Workflow", "IoT Concept"]'::jsonb,
    '["QR-based entry and exit verification flow", "Advance parking slot booking experience", "Guided slot navigation concept"]'::jsonb,
    5,
    true
  ),
  (
    'hybrid-smart-street-light',
    'Hybrid Smart Street Light Fault Monitoring System',
    'Smart Infrastructure & Field Routing Concept',
    'A smart infrastructure concept with fault monitoring, QR-based complaints, location tracking and worker routing.',
    'Combines sensor-aware fault detection concepts with citizen-friendly QR-code pole reporting, geolocation tagging, and optimized maintenance worker routing to reduce municipal streetlight downtime.',
    'Smart Infrastructure Concept',
    'Hardware–Software Concept',
    '["IoT Concept", "Embedded Systems", "Sensors", "Web Dashboard"]'::jsonb,
    '["Automated fault monitoring architecture", "QR-based public complaint intake per pole", "Location tracking and technician routing flow"]'::jsonb,
    6,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. Achievements
INSERT INTO public.achievements (slug, title, subtitle, organization, achieved_date, badge_text, description, accent, sort_order, is_published)
VALUES
  (
    'ziro-hackathon-132',
    '132nd Place — Ziro Digital Hackathon 2026',
    'National Qualification among 800+ Teams',
    'Ziro.Digital (Team TRIFORGE)',
    '2026',
    'Rank #132 / 800+ Teams',
    'Qualified nationally at rank #132 among more than 800 participating teams in the Ziro Digital National Agentic AI Hackathon 2026 as part of Team TRIFORGE (evaluation score: 116/180).',
    'cyan',
    1,
    true
  ),
  (
    'boss-1000-hackathon',
    'BOSS $1000 Contributor Hackathon',
    'Hackathon Participation',
    'BOSS Console (via Unstop)',
    '2026',
    'Participant',
    'Participated in the BOSS $1000 Contributor Hackathon, collaborating on technical problem-solving and gaining hands-on experience in a competitive builder environment.',
    'blue',
    2,
    true
  ),
  (
    'igen-student-membership',
    'IGEN Student Membership',
    'Institution of Green Engineers',
    'IGEN',
    'Valid until Oct 2027',
    'G Score 25',
    'Recognized as a Non-Donor Student Member of the Institution of Green Engineers (IGEN) with a G Score of 25, active through October 2027.',
    'violet',
    3,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 6. Education
INSERT INTO public.education (slug, degree, institution, period, status_label, focus_areas, description, sort_order, is_published)
VALUES (
  'sece-btech-it',
  'B.Tech Information Technology',
  'Sri Eshwar College of Engineering',
  '2026–2030',
  'Currently Pursuing',
  '[
    "Programming Foundations (C, C++, Python, JavaScript)",
    "Web & Frontend Engineering",
    "Artificial Intelligence & Machine Learning Fundamentals",
    "Software Systems & Hardware–Software Exploration"
  ]'::jsonb,
  'Pursuing an undergraduate Bachelor of Technology degree in Information Technology, developing core engineering discipline while building software projects and exploring AI and embedded technologies.',
  1,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 7. Tech Interests
INSERT INTO public.tech_interests (slug, name, category, description, exploration_note, sort_order, is_published)
VALUES
  ('artificial-intelligence', 'Artificial Intelligence', 'AI & Intelligence', 'Exploring generative models, agentic workflows, intelligent classification, and human-centered AI integration.', 'Active Exploration Area', 1, true),
  ('internet-of-things', 'Internet of Things', 'IoT & Microcontrollers', 'Studying connected device architectures, telemetry pipelines, and smart infrastructure concepts.', 'Interest & Conceptual Study', 2, true),
  ('arduino', 'Arduino', 'IoT & Microcontrollers', 'Learning microcontroller programming, digital/analog I/O, and rapid hardware prototyping fundamentals.', 'Learning & Prototyping Interest', 3, true),
  ('esp32', 'ESP32', 'IoT & Microcontrollers', 'Exploring Wi-Fi and Bluetooth-enabled microcontroller workflows for wireless sensor nodes and smart systems.', 'Learning & Prototyping Interest', 4, true),
  ('robotics', 'Robotics', 'Robotics & Hardware', 'Following autonomous actuation, kinematic control concepts, and intelligent physical systems.', 'Exploration Interest', 5, true),
  ('embedded-systems', 'Embedded Systems', 'Robotics & Hardware', 'Interested in resource-constrained firmware, real-time responsiveness, and low-level C/C++ hardware control.', 'Exploration Interest', 6, true),
  ('sensors-electronics', 'Sensors and Electronics', 'Robotics & Hardware', 'Understanding environmental sensing, signal acquisition, circuit fundamentals, and actuator interfacing.', 'Foundational Interest', 7, true),
  ('hardware-software-integration', 'Hardware–Software Integration', 'AI & Intelligence', 'Bridging physical sensors and microcontrollers with cloud dashboards, analytics, and AI decision layers.', 'Cross-Disciplinary Focus', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- 8. Curated Personal Knowledge Base (Strictly Private to Admin AI Assistant)
INSERT INTO public.personal_knowledge (title, source_type, tags, content, is_active)
SELECT v.title, v.source_type, v.tags, v.content, true
FROM (
  VALUES
    (
      'Core Portfolio Identity & Academic Context',
      'manual',
      '["identity", "education", "tone"]'::jsonb,
      'Owner: Deepak S. Degree: B.Tech Information Technology (2026–2030) at Sri Eshwar College of Engineering. Positioning: Aspiring IT Professional interested in Software Development, Artificial Intelligence, and Hardware-Software Integration. Keep all generated descriptions factual and avoid inventing work experience, GPAs, or unverified awards.'
    ),
    (
      'Verified Hackathon & Membership Facts',
      'career_note',
      '["certificates", "hackathons", "achievements"]'::jsonb,
      '1) Ziro National Level Agentic AI Hackathon 2026 (ziro.digital, 31 October 2026): Participated with Team TRIFORGE among 2,600+ builders and 800+ teams; earned National Qualification Rank #132 with evaluation score 116/180 (Certificate ID: 68CF2091B27644D194C6D492A9012582). 2) BOSS $1000 Contributor Hackathon (BOSS Console via Unstop): Certificate of Participation. 3) IGEN Student Member (The Institution of Green Engineers): Non-Donor Member, Membership ID IGEN/SM26M0606, G Score 25, valid until October 2027.'
    )
) AS v(title, source_type, tags, content)
WHERE NOT EXISTS (
  SELECT 1 FROM public.personal_knowledge pk WHERE pk.title = v.title
);

