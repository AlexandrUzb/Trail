/**
 * AI Advokat - English / Multilingual Query & Legal Translation Helper
 * Bridges English user queries with Uzbek Lex.uz statutory corpora.
 */

// Common English stopwords and auxiliary markers
export const ENGLISH_STOPWORDS = new Set([
  'what', 'how', 'when', 'where', 'why', 'who', 'which', 'can', 'could', 'should', 'would',
  'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'about', 'from', 'by', 'my', 'your', 'our', 'their', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'do', 'does', 'did', 'have', 'has', 'had', 'rules', 'rule', 'laws', 'law', 'uzbekistan',
  'tell', 'me', 'please', 'give', 'under', 'any', 'some', 'there', 'be', 'been', 'being'
]);

/**
 * Accurately detects whether a query is written in English.
 */
export function isEnglishQuery(text, langParam = 'uz') {
  if (langParam === 'en') return true;
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim();
  
  // Fast common English legal & everyday words
  const enMarkers = [
    'what', 'how', 'when', 'where', 'why', 'who', 'which', 'can', 'could', 'should',
    'is', 'are', 'was', 'were', 'the', 'this', 'that', 'with', 'about', 'from', 'under',
    'hello', 'hi', 'hey', 'help', 'question', 'law', 'laws', 'legal', 'lawyer', 'attorney',
    'contract', 'employment', 'employer', 'employee', 'salary', 'wage', 'wages', 'probation',
    'dismissal', 'fire', 'fired', 'tenant', 'landlord', 'rent', 'lease', 'eviction',
    'court', 'sue', 'lawsuit', 'dispute', 'rights', 'right', 'obligation', 'penalty', 'fine',
    'bribe', 'corruption', 'alimony', 'divorce', 'marriage', 'business', 'company', 'uzbekistan',
    'pregnant', 'pregnancy', 'unpaid', 'withholding', 'deposit', 'termination', 'trial'
  ];
  
  const words = clean.split(/[^a-zA-Z]+/).filter(w => w.length >= 2);
  if (words.length === 0) return false;
  
  let matches = 0;
  for (const w of words) {
    if (enMarkers.includes(w)) matches++;
  }
  
  return matches >= 2 || (words.length <= 4 && matches >= 1);
}

/**
 * Maps English legal terminology and intents to Uzbek statutory keywords
 * so the local 4,449+ Lex.uz articles database can match with high precision.
 */
export function translateEnglishLegalQueryToUzbek(query) {
  if (!query || typeof query !== 'string') return query;
  const q = query.toLowerCase();
  const uzbekTerms = [];

  // 1. Labor & Employment
  if (q.includes('probation') || q.includes('trial period') || q.includes('probationary')) {
    uzbekTerms.push('dastlabki sinov', 'sinov muddati', 'mehnat shartnomasi', 'MK 130');
  }
  if (q.includes('salary') || q.includes('wage') || q.includes('wages') || q.includes('unpaid') || q.includes('pay') || q.includes('withhold')) {
    uzbekTerms.push('ish haqi', 'oylik', 'ish haqi to‘lash', 'mehnatga haq to‘lash', 'MK 253', 'MK 333');
  }
  if (q.includes('fire') || q.includes('fired') || q.includes('dismiss') || q.includes('dismissal') || q.includes('terminat')) {
    uzbekTerms.push('ishdan bo‘shatish', 'mehnat shartnomasini bekor qilish', 'MK 160', 'MK 161');
  }
  if (q.includes('pregnant') || q.includes('pregnancy') || q.includes('maternity')) {
    uzbekTerms.push('homilador ayol', 'homiladorlik ta’tili', 'MK 408');
  }
  if (q.includes('employment contract') || q.includes('labor contract') || q.includes('work contract') || q.includes('job contract')) {
    uzbekTerms.push('mehnat shartnomasi', 'ishga qabul qilish', 'MK 104');
  }
  if (q.includes('labor dispute') || q.includes('work dispute') || q.includes('employment dispute') || q.includes('labor commission')) {
    uzbekTerms.push('mehnat nizolari komissiyasi', 'mehnat nizosi', 'MK 556');
  }
  if (q.includes('transfer') && (q.includes('job') || q.includes('position') || q.includes('work'))) {
    uzbekTerms.push('boshqa ishga o‘tkazish', 'roziliksiz', 'MK 138');
  }

  // 2. Tenancy & Real Estate
  if (q.includes('tenant') || q.includes('landlord') || q.includes('rent') || q.includes('lease') || q.includes('apartment')) {
    uzbekTerms.push('ijara shartnomasi', 'ijarachi huquqlari', 'turar joy', 'mulk ijarasi', 'FK 615', 'FK 535');
  }
  if (q.includes('deposit') || q.includes('security deposit')) {
    uzbekTerms.push('depozit', 'garov', 'qaytarish', 'FK 544');
  }
  if (q.includes('evict') || q.includes('eviction')) {
    uzbekTerms.push('uydan chiqarish', 'shartnomani bekor qilish', 'FK 615');
  }

  // 3. Corruption & Bribery
  if (q.includes('bribe') || q.includes('bribery') || q.includes('corruption') || q.includes('extortion')) {
    uzbekTerms.push('pora olish', 'pora berish', 'korrupsiya', 'tamagirlik', 'JK 210', 'JK 211');
  }

  // 4. Fines & Administrative
  if (q.includes('fine') || q.includes('penalty') || q.includes('traffic') || q.includes('ticket') || q.includes('speeding')) {
    uzbekTerms.push('jarima', 'ma’muriy javobgarlik', 'qaror ustidan shikoyat', 'MJtK 314');
  }

  // 5. Family & Children
  if (q.includes('alimony') || q.includes('child support')) {
    uzbekTerms.push('aliment', 'voyaga yetmagan bolalarga aliment', 'Oila kodeksi 96', 'Oila kodeksi 99');
  }
  if (q.includes('divorce') || q.includes('marriage')) {
    uzbekTerms.push('nikohdan ajratish', 'nikoh shartnomasi', 'Oila kodeksi 18', 'Oila kodeksi 44');
  }

  // 6. Inheritance & Property
  if (q.includes('inherit') || q.includes('will') || q.includes('estate') || q.includes('heir')) {
    uzbekTerms.push('meros', 'vasiyatnoma', 'vorislik', 'FK 1112', 'FK 1118');
  }
  if (q.includes('property') || q.includes('real estate') || q.includes('buy house') || q.includes('sell house')) {
    uzbekTerms.push('mulk huquqi', 'oldi-sotdi shartnomasi', 'ko‘chmas mulk');
  }

  // 7. Business & Taxes
  if (q.includes('business') || q.includes('company') || q.includes('llc') || q.includes('start a business') || q.includes('register business')) {
    uzbekTerms.push('tadbirkorlik', 'biznes ochish', 'mas’uliyati cheklangan jamiyat', 'davlat ro‘yxatidan o‘tkazish', 'FK 39');
  }
  if (q.includes('tax') || q.includes('taxes')) {
    uzbekTerms.push('soliq', 'soliq kodeksi', 'daromad solig‘i', 'SK 24');
  }
  if (q.includes('debt') || q.includes('loan') || q.includes('borrow')) {
    uzbekTerms.push('qarz shartnomasi', 'qarzni qaytarish', 'kredit', 'FK 732');
  }

  // 8. Court & Lawsuit
  if (q.includes('court') || q.includes('sue') || q.includes('lawsuit') || q.includes('judge') || q.includes('appeal')) {
    uzbekTerms.push('fuqarolik ishlari bo‘yicha sud', 'da’vo arizasi', 'sudga murojaat');
  }

  return uzbekTerms.length > 0 ? uzbekTerms.join(' ') : query;
}

/**
 * Returns polished English responses for conversational and safety intents.
 */
export function getEnglishDirectResponse(intent, rawMessage = '') {
  switch (intent) {
    case 'GREETING':
      return "Hello! I am AI Advokat — your legal assistant on the laws of the Republic of Uzbekistan. How can I assist you with your legal questions today?";
    case 'COURTESY':
      return "You're welcome! AI Advokat is always at your service. Feel free to ask any other questions regarding Uzbekistan laws.";
    case 'ABOUT_PRODUCT':
      return `I am AI Advokat — an intelligent legal assistant specialized in the legislation of the Republic of Uzbekistan (Constitution, Labor Code, Civil Code, Criminal Code, Administrative Code, and more).

I can assist you with:
1. Employment contracts, unpaid salaries, dismissal, and workplace rights.
2. Apartment rentals, tenant rights, and property agreements.
3. Business laws, commercial contracts, and company registration in Uzbekistan.
4. Administrative fines, penalties, and official appeals.
5. Direct statutory explanations and verified Lex.uz citations.

Feel free to ask your legal question in English!`;
    case 'HOW_TO_ASK':
      return `To receive the most accurate legal advice, please include key details:
1. Parties involved (e.g., employee and employer, tenant and landlord).
2. What happened (e.g., unpaid salary, termination without notice, contract dispute).
3. Any documents you have (e.g., written contract, orders, receipts).
4. Desired outcome (e.g., reinstatement, compensation, termination).

Please write your question!`;
    case 'GENERAL_NON_LEGAL':
      return "Thank you. This question is not directly related to the legislation of Uzbekistan. AI Advokat provides legal information grounded exclusively in Uzbekistan laws, so I cannot provide an answer to this query.";
    case 'ADVOCATE_IDENTITY_FAQ':
      return `No. AI Advokat is an artificial intelligence legal assistant, not a human attorney, and cannot represent you in court, before state authorities, or in legal proceedings. AI Advokat provides legal guidance, statutory explanations, and document templates based on the laws of Uzbekistan.

AI Advokat can:
• Answer legal queries grounded in Lex.uz legislation;
• Explain statutory codes and article provisions;
• Help draft contracts, claims, and applications;
• Outline competent courts and administrative routes.

However, AI Advokat does not replace a licensed attorney. For formal court representation or criminal defense, consulting a certified licensed attorney is strongly recommended.`;
    case 'NON_EXISTENT_ARTICLE':
      return "The requested article does not exist in the specified official legal code of the Republic of Uzbekistan. Please check the article number or ask about the specific legal rule you are researching.";
    case 'LOW_CONFIDENCE_FALLBACK':
      return "Thank you. A directly applicable statutory provision was not found in the legislation of Uzbekistan for this specific query. Therefore, a definitive legal conclusion under Uzbekistan law cannot be provided.";
    default:
      return null;
  }
}
