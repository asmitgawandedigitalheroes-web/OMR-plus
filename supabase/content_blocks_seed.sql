-- Seed content_blocks with live homepage content
-- Run once in Supabase SQL editor to populate all CMS fields
-- Admin can then edit and publish changes via the CMS tab

INSERT INTO content_blocks (key, section, value_en, value_ar) VALUES
  -- Hero
  ('hero.badge',               'hero', 'AthloCode Performance System',         'نظام أثلو كود للأداء'),
  ('hero.headline1',           'hero', 'This is not fitness.',                   'هذا ليس مجرد لياقة.'),
  ('hero.headline2',           'hero', 'Performance Engineering.',               'هندسة الأداء.'),
  ('hero.subtext',             'hero', 'Precision training. Built for elite results. A private system designed for high-performance individuals in the UAE.', 'تدريب دقيق. مصمم لنتائج النخبة. نظام خاص للأفراد عالي الأداء في الإمارات.'),
  ('hero.cta',                 'hero', 'Apply for Access',                       'قدّم طلبك للوصول'),
  ('hero.secondary',           'hero', 'See The System',                         'اكتشف النظام'),

  -- How It Works
  ('hiw.badge',                'howitworks', 'The System',                       'النظام'),
  ('hiw.title',                'howitworks', 'How The',                          'كيف يعمل'),
  ('hiw.titleHighlight',       'howitworks', 'System Works',                     'النظام'),
  ('hiw.subtitle',             'howitworks', 'Four precise steps. No randomness. No guesswork. A controlled system engineered for measurable elite results.', 'أربع خطوات دقيقة. لا عشوائية. لا تخمين. نظام محكوم مصمم لنتائج قابلة للقياس.'),
  ('hiw.step1.title',          'howitworks', 'Apply for Access',                 'قدّم طلبك للوصول'),
  ('hiw.step1.desc',           'howitworks', 'Submit your application. We review your profile, goals, and lifestyle to determine if AthloCode is the right fit.', 'أرسل طلبك. نراجع ملفك وأهدافك ونمط حياتك لتحديد مدى الملاءمة.'),
  ('hiw.step2.title',          'howitworks', 'Receive Your System',              'استلم نظامك'),
  ('hiw.step2.desc',           'howitworks', 'Get your fully personalized nutrition and training system — engineered precisely for your body and goals.', 'احصل على نظامك الغذائي والتدريبي المخصص — مصمم بدقة لجسمك وأهدافك.'),
  ('hiw.step3.title',          'howitworks', 'Execute Daily',                    'نفّذ يومياً'),
  ('hiw.step3.desc',           'howitworks', 'Follow your daily plan with precision. Every meal, every session — structured, clear, and optimized for results.', 'اتّبع خطتك اليومية بدقة. كل وجبة وكل جلسة — منظمة وواضحة ومحسّنة.'),
  ('hiw.step4.title',          'howitworks', 'Weekly Optimization',              'تحسين أسبوعي'),
  ('hiw.step4.desc',           'howitworks', 'Your coach reviews your data every week and refines your system. Continuous improvement, not static plans.', 'يراجع مدربك بياناتك أسبوعياً ويحسّن نظامك. تحسين مستمر لا خطط ثابتة.'),

  -- Testimonials
  ('testimonials.badge',       'testimonials', 'Testimonials',                   'شهادات العملاء'),
  ('testimonials.title',       'testimonials', 'What Our',                       'ما يقوله'),
  ('testimonials.titleHighlight','testimonials','Members Say',                   'أعضاؤنا'),
  ('testimonials.subtitle',    'testimonials', 'Real feedback from members who committed to the process and came out the other side transformed.', 'تقييمات حقيقية من أعضاء التزموا بالمسار وخرجوا متحولين.'),

  -- CTA
  ('cta.title',                'cta', 'Apply for Access.',                       'قدّم طلبك للوصول.'),
  ('cta.subtitle',             'cta', 'AthloCode accepts a limited number of members per cycle. If you are serious about elite results, submit your application today.', 'يقبل أثلو كود عدداً محدوداً من الأعضاء في كل دورة. إذا كنت جاداً في تحقيق نتائج النخبة، قدّم طلبك اليوم.'),
  ('cta.btn',                  'cta', 'Apply for Access',                        'قدّم طلبك للوصول'),
  ('cta.secondary',            'cta', 'Join the Waitlist',                       'انضم لقائمة الانتظار'),
  ('cta.point1',               'cta', 'Limited onboarding slots',                'أماكن محدودة للانضمام'),
  ('cta.point2',               'cta', 'Application-based access only',           'وصول قائم على الطلب فقط'),
  ('cta.point3',               'cta', 'Private system for selected members',     'نظام خاص للأعضاء المختارين'),
  ('cta.point4',               'cta', 'Built for UAE high-performers',           'مصمم لأصحاب الأداء العالي في الإمارات'),

  -- Footer
  ('footer.tagline',           'footer', 'Premium fitness coaching with personalized meal plans. Transform your body, elevate your life.', 'تدريب لياقة بدنية متميز مع خطط وجبات مخصصة. حوّل جسمك وارتقِ بحياتك.'),
  ('footer.allRightsReserved', 'footer', 'All rights reserved.',                 'جميع الحقوق محفوظة.')

ON CONFLICT (key) DO UPDATE
  SET value_en   = EXCLUDED.value_en,
      value_ar   = EXCLUDED.value_ar,
      section    = EXCLUDED.section,
      updated_at = NOW();
