/* ------------------------------------------------------------------
   i18n — Multilingual support (EN / AR / Tunisian Derja)
   ------------------------------------------------------------------ */

export type Language = "en" | "ar" | "tn";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "ar", "tn"];

/** Validate and default to "en" */
export function parseLanguage(v: unknown): Language {
  if (typeof v === "string" && SUPPORTED_LANGUAGES.includes(v as Language)) {
    return v as Language;
  }
  return "en";
}

/** Returns true if the language uses RTL script */
export function isRtl(lang: Language): boolean {
  return lang === "ar" || lang === "tn";
}

/* ── AI prompt language instructions ────────────────────────── */

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  en: "Write in clear English for non-experts.",
  ar: "اكتب بالعربية الفصحى البسيطة مع شرح المصطلحات الصعبة.",
  tn: "اكتب بالدارجة التونسية بطريقة خفيفة ومضحكة شوية (بدون إهانة)، واستعمل أمثلة من الحياة اليومية، وفسّر المصطلحات السيبرانية بكلمات بسيطة.",
};

export function buildLanguageInstruction(lang: Language): string {
  return LANGUAGE_INSTRUCTIONS[lang];
}

/* ── UI translations dictionary ─────────────────────────────── */

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navbar / Layout
  "nav.home": { en: "Home", ar: "الرئيسية", tn: "الصفحة الكبيرة" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة القيادة", tn: "التابلو" },
  "nav.phishing": { en: "Phishing", ar: "التصيّد", tn: "التصيّد" },
  "nav.reports": { en: "Reports", ar: "التقارير", tn: "التقارير" },
  "nav.heatmap": { en: "Heatmap", ar: "خريطة حرارية", tn: "الخريطة" },
  "nav.vault": { en: "Vault", ar: "الخزنة", tn: "الكوفر" },
  "nav.quiz": { en: "Quiz", ar: "اختبار", tn: "الكويز" },
  "nav.scoreboard": { en: "Scoreboard", ar: "لوحة النتائج", tn: "السكوربورد" },

  // Common actions
  "action.analyze": { en: "Analyze URL", ar: "تحليل الرابط", tn: "حلّل الرابط" },
  "action.upload": { en: "Upload Screenshot", ar: "رفع لقطة شاشة", tn: "طلّع تصويرة" },
  "action.startQuiz": { en: "Start Quiz", ar: "ابدأ الاختبار", tn: "ابدا الكويز" },
  "action.openVault": { en: "Open Vault", ar: "فتح الخزنة", tn: "حلّ الكوفر" },
  "action.signOut": { en: "Sign Out", ar: "تسجيل الخروج", tn: "اخرج" },
  "action.login": { en: "Login", ar: "تسجيل الدخول", tn: "ادخل" },
  "action.retry": { en: "Retry", ar: "إعادة المحاولة", tn: "عاود حاول" },

  // Quiz
  "quiz.title": { en: "Security Quiz", ar: "اختبار الأمان", tn: "كويز السيكيريتي" },
  "quiz.configure": { en: "Configure Your Quiz", ar: "إعداد الاختبار", tn: "حضّر الكويز متاعك" },
  "quiz.start": { en: "Start Quiz", ar: "ابدأ", tn: "يلّا نبداو" },
  "quiz.next": { en: "Next →", ar: "التالي ←", tn: "الجاية ←" },
  "quiz.seeResults": { en: "See Results", ar: "عرض النتائج", tn: "شوف النتيجة" },
  "quiz.correct": { en: "Correct!", ar: "صحيح!", tn: "براڤو! صحيح!" },
  "quiz.incorrect": { en: "Incorrect", ar: "خطأ", tn: "غالط يا صاحبي" },
  "quiz.complete": { en: "Quiz Complete!", ar: "اكتمل الاختبار!", tn: "خلّصت الكويز!" },
  "quiz.playAgain": { en: "Play Again", ar: "العب مجدداً", tn: "عاود العب" },
  "quiz.noQuizzes": { en: "No quizzes yet", ar: "لا اختبارات بعد", tn: "مازلت ما لعبت حتى كويز" },

  // Dashboard
  "dashboard.welcome": { en: "Welcome back", ar: "مرحباً بعودتك", tn: "مرحبا بيك" },
  "dashboard.subtitle": {
    en: "Your cyber-awareness overview at a glance.",
    ar: "نظرة عامة على وعيك السيبراني.",
    tn: "هاو التابلو متاعك، شوف وينك وصلت.",
  },
  "dashboard.analyzed": { en: "Phishing Analyzed", ar: "تحليلات التصيّد", tn: "تحليلات التصيّد" },
  "dashboard.highRisk": { en: "High Risk Found", ar: "مخاطر عالية", tn: "خطر كبير" },
  "dashboard.dailyStreak": { en: "Daily Streak", ar: "السلسلة اليومية", tn: "الستريك" },
  "dashboard.lastScore": { en: "Last Quiz Score", ar: "آخر نتيجة", tn: "آخر نتيجة" },

  // Phishing
  "phish.title": { en: "Phishing Analyzer", ar: "محلل التصيّد", tn: "محلّل التصيّد" },
  "phish.subtitle": {
    en: "Check if a URL or screenshot is suspicious.",
    ar: "تحقق مما إذا كان رابط أو لقطة شاشة مشبوهة.",
    tn: "علّم إذا الرابط ولّا التصويرة فيها حاجة مشبوهة.",
  },

  // Risk levels
  "risk.low": { en: "Low", ar: "منخفض", tn: "عادي" },
  "risk.medium": { en: "Medium", ar: "متوسط", tn: "نص نص" },
  "risk.high": { en: "High", ar: "عالي", tn: "خطير" },
  "risk.critical": { en: "Critical", ar: "حرج", tn: "ياخي خطير برشا!" },

  // Streaks
  "streak.daily": { en: "Daily Streak", ar: "السلسلة اليومية", tn: "الستريك اليومي" },
  "streak.answer": { en: "Answer Streak", ar: "سلسلة الإجابات", tn: "ستريك الأجوبة" },
  "streak.best": { en: "Best", ar: "الأفضل", tn: "أحسن واحد" },

  // Heatmap
  "heatmap.title": { en: "Threat Heatmap", ar: "خريطة التهديدات", tn: "خريطة التهديدات" },
  "heatmap.subtitle": {
    en: "Phishing reports across Tunisia's governorates.",
    ar: "تقارير التصيّد حسب ولايات تونس.",
    tn: "تقارير التصيّد ولاية بولاية.",
  },

  // Reports
  "reports.title": { en: "Community Reports", ar: "تقارير المجتمع", tn: "تقارير الناس" },
  "reports.noReports": {
    en: "No reports yet. Analyze a URL to get started.",
    ar: "لا تقارير بعد. حلّل رابطاً للبدء.",
    tn: "مازال ما فمّاش تقارير. ابدا حلّل رابط.",
  },

  // Errors
  "error.authRequired": { en: "Please log in.", ar: "يرجى تسجيل الدخول.", tn: "لازمك تدخل الأول." },
  "error.serverError": {
    en: "Something went wrong. Try again.",
    ar: "حدث خطأ. حاول مجدداً.",
    tn: "صار مشكل. عاود حاول.",
  },
  "error.loading": { en: "Loading…", ar: "جاري التحميل…", tn: "يحمّل…" },

  // Vault
  "vault.title": { en: "Vault", ar: "الخزنة", tn: "الكوفر" },
  "vault.setup": { en: "Set up & secured", ar: "مُعدّ وآمن", tn: "محضّر و آمن" },
  "vault.notSetup": { en: "Not configured yet", ar: "لم يتم الإعداد بعد", tn: "مازال ما حضّرتوش" },

  // Quiz extra
  "quiz.subtitle": {
    en: "Test your cybersecurity knowledge with real-world scenarios.",
    ar: "اختبر معرفتك بالأمن السيبراني بسيناريوهات واقعية.",
    tn: "جرّب روحك في السيكيريتي بسيناريوهات من الحياة.",
  },
  "quiz.configSubtitle": {
    en: "Questions are generated from real phishing reports and our cybersecurity question bank.",
    ar: "الأسئلة مبنية من تقارير تصيّد حقيقية وبنك الأسئلة.",
    tn: "الأسئلة من تقارير تصيّد حقيقية ومن بنك الأسئلة متاعنا.",
  },
  "quiz.topic": { en: "Topic", ar: "الموضوع", tn: "الموضوع" },
  "quiz.difficulty": { en: "Difficulty", ar: "الصعوبة", tn: "الصعوبة" },
  "quiz.questions": { en: "Questions", ar: "عدد الأسئلة", tn: "الأسئلة" },
  "quiz.score": { en: "Score", ar: "النتيجة", tn: "النتيجة" },
  "quiz.preparing": { en: "Preparing your questions…", ar: "جاري تحضير أسئلتك…", tn: "يحضّر الأسئلة…" },
  "quiz.question": { en: "Question", ar: "السؤال", tn: "السؤال" },
  "quiz.of": { en: "of", ar: "من", tn: "من" },
  "quiz.fromReport": { en: "From real report", ar: "من تقرير حقيقي", tn: "من تقرير حقيقي" },
  "quiz.tip": { en: "Tip", ar: "نصيحة", tn: "نصيحة" },
  "quiz.streak": { en: "streak", ar: "سلسلة", tn: "ستريك" },
  "quiz.gotCorrect": { en: "correct", ar: "صحيحة", tn: "صحيحة" },
  "quiz.outOf": { en: "out of", ar: "من", tn: "من" },
  "quiz.bestAnswerStreak": { en: "Best Answer Streak", ar: "أفضل سلسلة أجوبة", tn: "أحسن ستريك أجوبة" },
  "quiz.consecutiveCorrect": { en: "Consecutive correct", ar: "إجابات متتالية", tn: "أجوبة ورا بعضها" },
  "quiz.reviewTip": {
    en: "Tip: Review phishing indicators and password best practices.",
    ar: "نصيحة: راجع مؤشرات التصيّد وممارسات كلمات المرور.",
    tn: "نصيحة: راجع علامات التصيّد وكيفاش تعمل كلمات سر قوية.",
  },
  "quiz.loginRequired": {
    en: "Please log in to play the quiz.",
    ar: "يرجى تسجيل الدخول للعب.",
    tn: "لازمك تدخل باش تلعب.",
  },
  "quiz.failedStart": {
    en: "Failed to start quiz. Please try again.",
    ar: "فشل بدء الاختبار. حاول مجدداً.",
    tn: "ما نجحش يبدا الكويز. عاود حاول.",
  },

  // Dashboard extra
  "dashboard.loading": {
    en: "Loading your cyber-awareness overview…",
    ar: "جاري تحميل نظرتك العامة…",
    tn: "يحمّل التابلو متاعك…",
  },
  "dashboard.loginRequired": {
    en: "Please log in to view your dashboard.",
    ar: "يرجى تسجيل الدخول لعرض لوحة القيادة.",
    tn: "لازمك تدخل باش تشوف التابلو.",
  },
  "dashboard.reported": { en: "reported", ar: "مُبلّغ", tn: "مبلّغ" },
  "dashboard.ofTotal": { en: "of total", ar: "من الإجمالي", tn: "من الكل" },
  "dashboard.best": { en: "Best", ar: "الأفضل", tn: "أحسن" },
  "dashboard.recentReports": { en: "Recent Reports", ar: "آخر التقارير", tn: "آخر التقارير" },
  "dashboard.viewAll": { en: "View all →", ar: "عرض الكل ←", tn: "شوف الكل ←" },
  "dashboard.noReports": {
    en: "No reports yet. Analyze a URL to get started.",
    ar: "لا تقارير بعد. حلّل رابطاً للبدء.",
    tn: "مازال ما فمّاش تقارير. ابدا حلّل رابط.",
  },
  "dashboard.keepItUp": {
    en: "Keep it up — play a quiz every day!",
    ar: "واصل — العب كويز كل يوم!",
    tn: "برافو واصل — العب كويز كل يوم!",
  },
  "dashboard.startStreak": {
    en: "Start a quiz to begin your streak.",
    ar: "ابدأ اختباراً لبدء سلسلتك.",
    tn: "ابدا كويز باش يبدا الستريك متاعك.",
  },
  "dashboard.consecutiveCorrect": {
    en: "Consecutive correct answers. One wrong resets it!",
    ar: "إجابات صحيحة متتالية. خطأ واحد يعيدها لصفر!",
    tn: "أجوبة صحيحة ورا بعضها. غلطة وحدة تنقّصك!",
  },
  "dashboard.quickActions": { en: "Quick Actions", ar: "إجراءات سريعة", tn: "حاجات سريعة" },
  "dashboard.screenshot": { en: "Screenshot", ar: "لقطة شاشة", tn: "تصويرة" },
  "dashboard.heatmapTitle": {
    en: "Phishing Reports Heatmap (Tunisia)",
    ar: "خريطة تقارير التصيّد (تونس)",
    tn: "خريطة تقارير التصيّد (تونس)",
  },
  "dashboard.fullView": { en: "Full view →", ar: "العرض الكامل ←", tn: "شوف الكل ←" },
  "dashboard.quizHistory": { en: "Quiz History", ar: "سجل الاختبارات", tn: "تاريخ الكويز" },
  "dashboard.sessionsCompleted": { en: "sessions completed", ar: "جلسات مكتملة", tn: "جلسات كملوا" },
  "dashboard.time": { en: "Time", ar: "الوقت", tn: "الوقت" },
  "dashboard.domain": { en: "Domain", ar: "النطاق", tn: "الدومين" },
  "dashboard.risk": { en: "Risk", ar: "الخطر", tn: "الخطر" },
  "dashboard.view": { en: "View", ar: "عرض", tn: "شوف" },

  // Leaderboard
  "leaderboard.title": { en: "Scoreboard", ar: "لوحة النتائج", tn: "السكوربورد" },
  "leaderboard.subtitle": {
    en: "Top contributors by streak and activity.",
    ar: "أفضل المساهمين حسب النشاط والسلسلة.",
    tn: "أحسن الناشطين في الأمان.",
  },

  // Home page
  "home.badge": { en: "AI-Powered Security", ar: "أمان مدعوم بالذكاء الاصطناعي", tn: "سيكيريتي بالذكاء الاصطناعي" },
  "home.title1": { en: "Stay One Step Ahead of", ar: "ابقَ متقدماً على", tn: "خلّيك سابق" },
  "home.title2": { en: "Cyber Threats", ar: "التهديدات السيبرانية", tn: "التهديدات السيبرانية" },
  "home.subtitle": {
    en: "faya9ni.tn helps you detect phishing, manage passwords, and level up your cybersecurity skills — all through an engaging, gamified experience built for Tunisia.",
    ar: "فيّقني يساعدك في كشف التصيّد وإدارة كلمات المرور وتطوير مهاراتك — بتجربة تفاعلية مصممة لتونس.",
    tn: "فيّقني يعاونك تكتشف التصيّد وتنظّم كلمات السر — بتجربة لعب مصممة لتونس.",
  },
  "home.getStarted": { en: "Get Started Free", ar: "ابدأ مجاناً", tn: "ابدا مجاناً" },
  "home.learnMore": { en: "Learn More", ar: "اعرف أكثر", tn: "اعرف أكثر" },
  "home.features": { en: "Everything you need to stay safe online", ar: "كل ما تحتاجه للبقاء آمناً", tn: "كل شي تحتاجو باش تبقى آمن" },
  "home.featuresSubtitle": {
    en: "From AI-powered phishing detection to community-driven threat intelligence — faya9ni.tn has you covered.",
    ar: "من كشف التصيّد بالذكاء الاصطناعي إلى معلومات التهديد المجتمعية.",
    tn: "من كشف التصيّد بالذكاء الاصطناعي للتقارير متع الناس.",
  },
  "home.cta": {
    en: "Ready to level up your security awareness?",
    ar: "مستعد لتطوير وعيك الأمني؟",
    tn: "مستعد تطوّر وعيك الأمني؟",
  },
  "home.ctaSubtitle": {
    en: "Join the faya9ni.tn community and start protecting yourself today.",
    ar: "انضم لمجتمع فيّقني وابدأ حماية نفسك اليوم.",
    tn: "انضم لمجتمع فيّقني وابدا أحمي روحك.",
  },

  // Feature cards
  "feature.phishing": { en: "AI Phishing Detection", ar: "كشف التصيّد بالذكاء الاصطناعي", tn: "كشف التصيّد بالذكاء الاصطناعي" },
  "feature.phishingDesc": {
    en: "Analyze any URL with our AI engine. Get instant risk scores, detailed reasons, and actionable advice.",
    ar: "حلّل أي رابط بمحرّك الذكاء الاصطناعي. احصل على نتائج فورية.",
    tn: "حلّل أي رابط بالذكاء الاصطناعي. تو يعطيك النتيجة في الحين.",
  },
  "feature.reports": { en: "Community Threat Reports", ar: "تقارير التهديدات المجتمعية", tn: "تقارير التهديدات" },
  "feature.reportsDesc": {
    en: "Browse and submit crowdsourced threat intelligence from across all governorates.",
    ar: "تصفّح وقدّم تقارير تهديد من جميع الولايات.",
    tn: "شوف وقدّم تقارير تهديد من كل الولايات.",
  },
  "feature.vault": { en: "Encrypted Password Vault", ar: "خزنة كلمات مرور مشفّرة", tn: "كوفر كلمات السر المشفّر" },
  "feature.vaultDesc": {
    en: "Check password strength and manage your credentials securely with encrypted storage.",
    ar: "تحقق من قوة كلمة المرور وأدر بياناتك بتخزين مشفّر.",
    tn: "علّم قوة كلمة السر وأدّي على بياناتك بتشفير.",
  },

  // Signed in as
  "auth.signedInAs": { en: "Signed in as", ar: "متصل بـ", tn: "داخل بـ" },
};

/**
 * Translate a UI key to the given language.
 * Falls back to English if key or language is missing.
 */
export function t(key: string, lang: Language = "en"): string {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}
