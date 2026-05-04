/**
 * Translations for static/sample tailor data.
 * Maps tailor ID → field → translated value for AR and UR.
 * Tailor names (business names) remain in English.
 */

type LangData = {
  location: string
  area: string
  availability: string
  availability_hours: string
  expertise: string[]
  specialties_labels: string[]
}

export const TAILOR_TRANSLATIONS: Record<string, { ar: LangData; ur: LangData }> = {
  'tailor-1': {
    ar: {
      location: 'الخوانيج ١، دبي',
      area: 'الخوانيج',
      availability: 'الاثنين – السبت',
      availability_hours: '١٠:٠٠ ص – ١٢:٠٠ م و٤:٠٠ م – ١٠:٠٠ م',
      expertise: ['عباءات', 'فساتين', 'فساتين سهرة', 'تعديلات'],
      specialties_labels: ['تعديلات', 'تفصيل من الصفر'],
    },
    ur: {
      location: 'الخوانیج ١، دبئی',
      area: 'الخوانیج',
      availability: 'پیر – ہفتہ',
      availability_hours: '١٠:٠٠ صبح – ١٢:٠٠ دوپہر اور ٤:٠٠ – ١٠:٠٠ شام',
      expertise: ['عبایا', 'لباس', 'شام کے لباس', 'ترمیم'],
      specialties_labels: ['ترمیمات', 'نئی سلائی'],
    },
  },
  'tailor-2': {
    ar: {
      location: 'مزهر ١، دبي',
      area: 'مزهر',
      availability: 'الأحد – الجمعة',
      availability_hours: '٩:٠٠ ص – ٩:٠٠ م',
      expertise: ['كندورات', 'بدلات', 'ثياب', 'قمصان'],
      specialties_labels: ['تعديلات', 'تفصيل من الصفر'],
    },
    ur: {
      location: 'مزہر ١، دبئی',
      area: 'مزہر',
      availability: 'اتوار – جمعہ',
      availability_hours: '٩:٠٠ صبح – ٩:٠٠ شام',
      expertise: ['کندورہ', 'سوٹ', 'توب', 'قمیض'],
      specialties_labels: ['ترمیمات', 'نئی سلائی'],
    },
  },
  'tailor-3': {
    ar: {
      location: 'منطقة مردف سيتي سنتر، دبي',
      area: 'مردف',
      availability: 'الاثنين – الأحد',
      availability_hours: '١٠:٠٠ ص – ٨:٠٠ م',
      expertise: ['ملابس عرائس', 'جلابيات', 'بلوزات', 'تنانير'],
      specialties_labels: ['تفصيل من الصفر', 'إعادة تصميم'],
    },
    ur: {
      location: 'مردف سٹی سنٹر، دبئی',
      area: 'مردف',
      availability: 'پیر – اتوار',
      availability_hours: '١٠:٠٠ صبح – ٨:٠٠ شام',
      expertise: ['دلہن کا لباس', 'جلابیہ', 'بلاؤز', 'اسکرٹ'],
      specialties_labels: ['نئی سلائی', 'اپسائیکلنگ'],
    },
  },
  'tailor-4': {
    ar: {
      location: 'شارع الرقة، ديرة، دبي',
      area: 'ديرة',
      availability: 'الأحد – الخميس',
      availability_hours: '٨:٠٠ ص – ١٠:٠٠ م',
      expertise: ['كندورات', 'بدلات', 'جاكيتات', 'بناطيل'],
      specialties_labels: ['تعديلات', 'تفصيل من الصفر'],
    },
    ur: {
      location: 'الریگا اسٹریٹ، دیرہ، دبئی',
      area: 'دیرہ',
      availability: 'اتوار – جمعرات',
      availability_hours: '٨:٠٠ صبح – ١٠:٠٠ رات',
      expertise: ['کندورہ', 'سوٹ', 'جیکٹ', 'پتلون'],
      specialties_labels: ['ترمیمات', 'نئی سلائی'],
    },
  },
  'tailor-5': {
    ar: {
      location: 'طريق جميرا بيتش، جميرا ١، دبي',
      area: 'جميرا',
      availability: 'الاثنين – السبت',
      availability_hours: '١٠:٠٠ ص – ٧:٠٠ م',
      expertise: ['عباءات', 'فساتين سهرة', 'إعادة تصميم', 'خياطة خاصة'],
      specialties_labels: ['تفصيل من الصفر', 'إعادة تصميم'],
    },
    ur: {
      location: 'جمیرا بیچ روڈ، جمیرا ١، دبئی',
      area: 'جمیرا',
      availability: 'پیر – ہفتہ',
      availability_hours: '١٠:٠٠ صبح – ٧:٠٠ شام',
      expertise: ['عبایا', 'شام کے لباس', 'اپسائیکلنگ', 'خصوصی سلائی'],
      specialties_labels: ['نئی سلائی', 'اپسائیکلنگ'],
    },
  },
  'tailor-6': {
    ar: {
      location: 'شارع الكويت، الكرامة، دبي',
      area: 'الكرامة',
      availability: 'الأحد – السبت',
      availability_hours: '٩:٠٠ ص – ١١:٠٠ م',
      expertise: ['بدلات', 'صدريات', 'بناطيل', 'قمصان', 'تعديلات'],
      specialties_labels: ['تعديلات', 'تفصيل من الصفر'],
    },
    ur: {
      location: 'کویت اسٹریٹ، کراما، دبئی',
      area: 'کراما',
      availability: 'اتوار – ہفتہ',
      availability_hours: '٩:٠٠ صبح – ١١:٠٠ رات',
      expertise: ['سوٹ', 'واسکٹ', 'پتلون', 'قمیض', 'ترمیم'],
      specialties_labels: ['ترمیمات', 'نئی سلائی'],
    },
  },
  'tailor-7': {
    ar: {
      location: 'منطقة القوز الصناعية ١، دبي',
      area: 'القوز',
      availability: 'السبت – الخميس',
      availability_hours: '٨:٣٠ ص – ٩:٣٠ م',
      expertise: ['كندورات', 'عباءات', 'تعديلات', 'تطريز'],
      specialties_labels: ['تعديلات', 'تفصيل من الصفر'],
    },
    ur: {
      location: 'القوز صنعتی علاقہ ١، دبئی',
      area: 'القوز',
      availability: 'ہفتہ – جمعرات',
      availability_hours: '٨:٣٠ صبح – ٩:٣٠ شام',
      expertise: ['کندورہ', 'عبایا', 'ترمیم', 'کڑھائی'],
      specialties_labels: ['ترمیمات', 'نئی سلائی'],
    },
  },
  'tailor-8': {
    ar: {
      location: 'طريق الوصل، جميرا ٢، دبي',
      area: 'جميرا ٢',
      availability: 'الاثنين – الجمعة',
      availability_hours: '١٠:٠٠ ص – ٦:٠٠ م',
      expertise: ['فساتين', 'ملابس عرائس', 'قفاطين', 'روبات'],
      specialties_labels: ['تفصيل من الصفر', 'إعادة تصميم'],
    },
    ur: {
      location: 'الوصل روڈ، جمیرا ٢، دبئی',
      area: 'جمیرا ٢',
      availability: 'پیر – جمعہ',
      availability_hours: '١٠:٠٠ صبح – ٦:٠٠ شام',
      expertise: ['لباس', 'دلہن کا لباس', 'کفتان', 'گاؤن'],
      specialties_labels: ['نئی سلائی', 'اپسائیکلنگ'],
    },
  },
  'tailor-9': {
    ar: {
      location: 'سوق الذهب، ديرة، دبي',
      area: 'ديرة – سوق الذهب',
      availability: 'الأحد – الجمعة',
      availability_hours: '٩:٠٠ ص – ١٠:٠٠ م',
      expertise: ['ثياب', 'كندورات', 'بشت', 'الملابس التراثية'],
      specialties_labels: ['تفصيل من الصفر', 'تعديلات'],
    },
    ur: {
      location: 'گولڈ سوق، دیرہ، دبئی',
      area: 'دیرہ گولڈ سوق',
      availability: 'اتوار – جمعہ',
      availability_hours: '٩:٠٠ صبح – ١٠:٠٠ رات',
      expertise: ['توب', 'کندورہ', 'بشت', 'روایتی لباس'],
      specialties_labels: ['نئی سلائی', 'ترمیمات'],
    },
  },
  'tailor-10': {
    ar: {
      location: 'بوليفار محمد بن راشد، وسط دبي',
      area: 'وسط دبي',
      availability: 'الاثنين – الأحد',
      availability_hours: '١١:٠٠ ص – ٩:٠٠ م',
      expertise: ['إعادة تصميم', 'أزياء مستدامة', 'إعادة تصميم الجينز', 'تعديلات'],
      specialties_labels: ['إعادة تصميم', 'تعديلات'],
    },
    ur: {
      location: 'محمد بن راشد بلیوارڈ، ڈاؤن ٹاؤن دبئی',
      area: 'ڈاؤن ٹاؤن دبئی',
      availability: 'پیر – اتوار',
      availability_hours: '١١:٠٠ صبح – ٩:٠٠ شام',
      expertise: ['اپسائیکلنگ', 'پائیدار فیشن', 'ڈینم ری ورک', 'ترمیم'],
      specialties_labels: ['اپسائیکلنگ', 'ترمیمات'],
    },
  },
}

export const REVIEW_TRANSLATIONS: Record<string, { ar: string; ur: string }> = {
  'tailor-1-0': {
    ar: 'عمل رائع على العباءة! مقاس مثالي وتوصيل سريع جداً.',
    ur: 'عبایا پر شاندار کام! بالکل فٹ اور بہت جلد ڈیلیوری۔',
  },
  'tailor-1-1': {
    ar: 'لجين موهوبة جداً. فستاني كان رائعاً في حفل الزفاف.',
    ur: 'لجین بہت ہنرمند ہیں۔ شادی کے لیے میرا لباس شاندار تھا۔',
  },
  'tailor-1-2': {
    ar: 'محترفة ودقيقة في المواعيد والجودة استثنائية.',
    ur: 'پیشہ ور، وقت کی پابند اور معیار لاجواب ہے۔',
  },
  'tailor-2-0': {
    ar: 'أفضل كندورة لبستها في حياتي. موصى به بشدة!',
    ur: 'اب تک کی بہترین کندورہ پہنی۔ بہت سفارش کرتا ہوں!',
  },
  'tailor-2-1': {
    ar: 'جودة رائعة، تأخير بسيط لكن يستحق الانتظار.',
    ur: 'بہترین معیار، معمولی تاخیر لیکن قابل قدر۔',
  },
  'tailor-2-2': {
    ar: 'محترف جداً. ثوبي كان جاهزاً في الوقت المحدد ومقاسه مثالي.',
    ur: 'بہت پیشہ ور۔ میرا توب وقت پر تیار تھا اور بالکل فٹ ہے۔',
  },
  'tailor-3-0': {
    ar: 'تصميم الجلابية كان بالضبط ما أردته!',
    ur: 'جلابیہ کا ڈیزائن بالکل وہی تھا جو میں چاہتی تھی!',
  },
  'tailor-3-1': {
    ar: 'فستان زفاف جميل، اهتمام رائع بالتفاصيل.',
    ur: 'خوبصورت دلہن کا لباس، تفصیلات پر شاندار توجہ۔',
  },
  'tailor-4-0': {
    ar: 'أفضل تعديل بدلة في دبي. مهارة عالية.',
    ur: 'دبئی میں بہترین سوٹ الٹریشن۔ انتہائی ہنرمند۔',
  },
  'tailor-4-1': {
    ar: 'أصلح جاكيتي في يوم واحد. نتيجة مثالية.',
    ur: 'ایک دن میں جیکٹ ٹھیک کر دی۔ کامل نتیجہ۔',
  },
  'tailor-5-0': {
    ar: 'عباءتي المُعاد تصميمها أصبحت ملبسي المفضل!',
    ur: 'میری اپسائیکل کی ہوئی عبایا اب میرا پسندیدہ لباس بن گئی!',
  },
  'tailor-5-1': {
    ar: 'فستان بالطلب مميز لتخرجي. يستحق كل درهم.',
    ur: 'گریجویشن کے لیے بے مثال حسب ضرورت گاؤن۔ ہر درہم قابل قدر۔',
  },
  'tailor-6-0': {
    ar: 'سريع وبأسعار معقولة وجودة تعديل بناطيل ممتازة.',
    ur: 'تیز، سستا، اور پتلون الٹریشن کا بہترین معیار۔',
  },
  'tailor-7-0': {
    ar: 'التطريز على كندورتي جميل. حرفية حقيقية.',
    ur: 'میری کندورہ پر کڑھائی خوبصورت ہے۔ حقیقی کاریگری۔',
  },
  'tailor-8-0': {
    ar: 'قفطاني لحفل الزفاف كان حلماً. مريم موهوبة بشكل لا يصدق.',
    ur: 'میرا شادی کا کفتان ایک خواب تھا۔ مریم ناقابل یقین ہنرمند ہیں۔',
  },
  'tailor-9-0': {
    ar: 'الراشد يصنع كندوراتي منذ ١٠ سنوات. لا يوجد أفضل منه.',
    ur: 'الراشد ١٠ سال سے میری کندورے بنا رہے ہیں۔ ان سے بہتر کوئی نہیں۔',
  },
  'tailor-10-0': {
    ar: 'مفهوم إعادة التصميم رائع. جاكيتي القديم أصبح جديداً تماماً!',
    ur: 'اپسائیکلنگ کا تصور شاندار ہے۔ میری پرانی جیکٹ بالکل نئی ہو گئی!',
  },
}

/**
 * Given a tailor from SAMPLE_TAILORS and a language, returns translated fields.
 * Falls back to English for fields not in the translation map.
 */
export function translateTailorFields(
  tailor: { id: string; location: string; area: string; availability: string; availability_hours: string; expertise: string[] },
  lang: 'en' | 'ar' | 'ur'
): { location: string; area: string; availability: string; availability_hours: string; expertise: string[] } {
  if (lang === 'en') {
    return {
      location: tailor.location,
      area: tailor.area,
      availability: tailor.availability,
      availability_hours: tailor.availability_hours,
      expertise: tailor.expertise,
    }
  }
  const t = TAILOR_TRANSLATIONS[tailor.id]?.[lang]
  if (!t) {
    return {
      location: tailor.location,
      area: tailor.area,
      availability: tailor.availability,
      availability_hours: tailor.availability_hours,
      expertise: tailor.expertise,
    }
  }
  return {
    location: t.location,
    area: t.area,
    availability: t.availability,
    availability_hours: t.availability_hours,
    expertise: t.expertise,
  }
}

/**
 * Returns a translated review comment for a given tailor ID, review index, and language.
 * Falls back to the original English comment.
 */
export function translateReviewComment(
  tailorId: string,
  reviewIndex: number,
  originalComment: string,
  lang: 'en' | 'ar' | 'ur'
): string {
  if (lang === 'en') return originalComment
  const key = `${tailorId}-${reviewIndex}`
  return REVIEW_TRANSLATIONS[key]?.[lang] || originalComment
}
