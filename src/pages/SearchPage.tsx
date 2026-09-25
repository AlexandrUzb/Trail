import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lawArticlesDatabase, LawArticle } from '../data/lawArticles';
import { safeStorage, safeFetchJson } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { supabase, getTodayUserUsage, incrementUserUsage } from '../utils/supabase';

export const legalCategories = [
  'Barchasi',
  'Konstitutsiya va davlat',
  'Mehnat va bandlik',
  'Fuqarolik, mulk va uy-joy',
  'Oila va nikoh',
  'Soliq va tadbirkorlik',
  'Jinoyat va javobgarlik',
  'Ma’muriy masalalar va sud',
];

export const CATEGORY_TO_DOMAIN_MAP: Record<string, string> = {
  'Konstitutsiyaviy huquq': 'Konstitutsiya va davlat',
  'Mehnat huquqi': 'Mehnat va bandlik',
  'Fuqarolik huquqi': 'Fuqarolik, mulk va uy-joy',
  'Meros huquqi': 'Fuqarolik, mulk va uy-joy',
  'Intellektual mulk': 'Fuqarolik, mulk va uy-joy',
  'Iste’molchilar huquqlari': 'Fuqarolik, mulk va uy-joy',
  'Uy-joy huquqi': 'Fuqarolik, mulk va uy-joy',
  'Yer huquqi': 'Fuqarolik, mulk va uy-joy',
  'Ekologiya huquqi': 'Fuqarolik, mulk va uy-joy',
  'Oila huquqi': 'Oila va nikoh',
  'Soliq huquqi': 'Soliq va tadbirkorlik',
  'Tadbirkorlik huquqi': 'Soliq va tadbirkorlik',
  'Moliya va bank huquqi': 'Soliq va tadbirkorlik',
  'Jinoyat huquqi': 'Jinoyat va javobgarlik',
  'Jinoyat-protsessual huquq': 'Jinoyat va javobgarlik',
  'Ma’muriy huquq': 'Ma’muriy masalalar va sud',
  'Transport huquqi': 'Ma’muriy masalalar va sud',
  'Sud va protsessual masalalar': 'Ma’muriy masalalar va sud',
  'Fuqarolik protsessual huquqi': 'Ma’muriy masalalar va sud',
  'Boshqa huquqiy masalalar': 'Ma’muriy masalalar va sud',
};

export function getArticleDomain(cat: string): string {
  return CATEGORY_TO_DOMAIN_MAP[cat] || cat;
}

function normalizeCat(cat: string) {
  return (cat || '').toLowerCase().replace(/['‘`ʼʻʼ]/g, "'").trim();
}

function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['‘`ʼʻʼ]/g, '')
    .replace(/ў/g, 'o')
    .replace(/ғ/g, 'g')
    .replace(/ш/g, 'sh')
    .replace(/ч/g, 'ch')
    .replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    .replace(/ё/g, 'yo')
    .replace(/э/g, 'e')
    .replace(/а/g, 'a')
    .replace(/б/g, 'b')
    .replace(/в/g, 'v')
    .replace(/г/g, 'g')
    .replace(/д/g, 'd')
    .replace(/ж/g, 'j')
    .replace(/з/g, 'z')
    .replace(/и/g, 'i')
    .replace(/й/g, 'y')
    .replace(/к/g, 'k')
    .replace(/л/g, 'l')
    .replace(/м/g, 'm')
    .replace(/н/g, 'n')
    .replace(/о/g, 'o')
    .replace(/п/g, 'p')
    .replace(/р/g, 'r')
    .replace(/с/g, 's')
    .replace(/т/g, 't')
    .replace(/у/g, 'u')
    .replace(/ф/g, 'f')
    .replace(/х/g, 'x')
    .replace(/ҳ/g, 'h')
    .replace(/ц/g, 'ts')
    .replace(/[ъь]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Intent category map for smart ranking boost
const INTENT_CATEGORY_BOOST: { [key: string]: string[] } = {
  aliment: ['Oila va nikoh'],
  ishdan: ['Mehnat va bandlik'],
  mehnat: ['Mehnat va bandlik'],
  ijara: ['Fuqarolik, mulk va uy-joy'],
  qarz: ['Soliq va tadbirkorlik', 'Fuqarolik, mulk va uy-joy'],
  qarzdorlik: ['Soliq va tadbirkorlik', 'Fuqarolik, mulk va uy-joy'],
  meros: ['Fuqarolik, mulk va uy-joy'],
  nikoh: ['Oila va nikoh'],
  ajrashish: ['Oila va nikoh'],
  ajrim: ['Oila va nikoh'],
  jinoyat: ['Jinoyat va javobgarlik'],
  transport: ['Ma’muriy masalalar va sud'],
  radar: ['Ma’muriy masalalar va sud'],
  harakat: ['Ma’muriy masalalar va sud'],
  jarima: ['Ma’muriy masalalar va sud'],
  soliq: ['Soliq va tadbirkorlik'],
  tadbirkor: ['Soliq va tadbirkorlik'],
  tadbirkorlik: ['Soliq va tadbirkorlik'],
  isteʼmolchi: ['Fuqarolik, mulk va uy-joy'],
  istemolchi: ['Fuqarolik, mulk va uy-joy'],
  yer: ['Fuqarolik, mulk va uy-joy'],
  sud: ['Ma’muriy masalalar va sud'],
  konstitutsiya: ['Konstitutsiya va davlat'],
  prezident: ['Konstitutsiya va davlat'],
};

export default function SearchPage() {
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [subcategory, setSubcategory] = useState('Barchasi');
  const [sortBy, setSortBy] = useState<'relevance' | 'num_asc' | 'num_desc' | 'title_asc' | 'title_desc'>('relevance');
  const [saved, setSaved] = useState<string[]>(() => {
    return safeStorage.getJSON<string[]>('advokatai_saved_articles', []);
  });
  const [selectedArticle, setSelectedArticle] = useState<LawArticle | null>(null);
  const [dbArticles, setDbArticles] = useState<LawArticle[]>([]);
  const [dbCategories, setDbCategories] = useState<{ id: string; name_uz: string }[]>([]);

  const [searchCount, setSearchCount] = useState<number>(0);
  const [showSearchLimitModal, setShowSearchLimitModal] = useState<boolean>(false);
  const searchLimit = user?.searchLimit ?? (user?.plan?.toLowerCase().includes('premium') ? 999999 : user?.plan?.toLowerCase().includes('pro') ? 30 : 3);
  const lastTrackedQueryRef = useRef<string>('');

  // Load today's search usage
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      getTodayUserUsage(user.id).then((u) => {
        if (isMounted) setSearchCount(u.search_count);
      }).catch(() => {});
      safeFetchJson(`/api/chat/usage/${user.id}`).then((res) => {
        if (isMounted && res.data?.data?.search_used !== undefined) {
          setSearchCount((prev) => Math.max(prev, res.data.data.search_used));
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [user?.id]);

  // Track search query and check limit
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 3 && trimmed !== lastTrackedQueryRef.current) {
      if (searchLimit < 999999 && searchCount >= searchLimit) {
        setShowSearchLimitModal(true);
        return;
      }
      lastTrackedQueryRef.current = trimmed;
      setSearchCount((prev) => prev + 1);
      if (user?.id) {
        incrementUserUsage(user.id, 'search').catch(() => {});
        safeFetchJson('/api/laws/track-search', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});
      }
    }
  }, [query, searchLimit, searchCount, user?.id]);

  // Fetch live legal categories and legal articles from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseLegalData() {
      try {
        const { data: catData } = await supabase
          .from('legal_categories')
          .select('id, name_uz')
          .eq('is_active', true)
          .order('name_uz');

        if (isMounted && catData && catData.length > 0) {
          setDbCategories(catData);
        }

        const { data: artData } = await supabase
          .from('legal_articles')
          .select('*, legal_categories(name_uz)')
          .eq('is_active', true)
          .order('article_number');

        if (isMounted && artData && artData.length > 0) {
          const mapped: LawArticle[] = artData.map((a: any) => ({
            id: a.id,
            title: a.title_uz,
            short_description: a.summary_uz || '',
            summary: a.summary_uz || '',
            article_number: a.article_number || '',
            category: a.legal_categories?.name_uz || 'Boshqa huquqiy masalalar',
            subcategory: '',
            keywords: [],
            source: a.source_name || "Oʻzbekiston Respublikasi qonunchiligi",
            source_url: a.source_url || '',
            content: a.content_uz || '',
            updated_at: a.updated_at ? a.updated_at.slice(0, 10) : '2026-09',
          }));
          setDbArticles(mapped);
        }
      } catch (err) {
        console.warn('[SearchPage] Supabase legal data fetch warning:', err);
      }
    }

    loadSupabaseLegalData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync favorites from Supabase public.favorites when user is logged in
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('favorites')
      .select('legal_article_id')
      .eq('user_id', user.id)
      .not('legal_article_id', 'is', null)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const favIds = data.map((d: any) => d.legal_article_id).filter(Boolean);
          setSaved((prev) => Array.from(new Set([...prev, ...favIds])));
        }
      });
  }, [user?.id]);

  const activeArticlesDatabase = useMemo(() => {
    return dbArticles.length > 0 ? dbArticles : lawArticlesDatabase;
  }, [dbArticles]);

  const activeLegalCategories = useMemo(() => {
    if (dbCategories.length > 0) {
      return ['Barchasi', ...dbCategories.map((c) => c.name_uz)];
    }
    return legalCategories;
  }, [dbCategories]);

  // Sync category with URL query param if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      const match = activeLegalCategories.find((c) => normalizeCat(c) === normalizeCat(catParam));
      if (match) {
        setCategory(match);
      }
    }
  }, [searchParams, activeLegalCategories]);

  // Compute available subcategories for selected category domain
  const availableSubcategories = useMemo(() => {
    if (category === 'Barchasi') return [];
    const norm = normalizeCat(category);
    const subcats = new Set<string>();
    activeArticlesDatabase.forEach((a) => {
      const artDomain = getArticleDomain(a.category);
      if ((normalizeCat(artDomain) === norm || normalizeCat(a.category) === norm) && a.subcategory) {
        subcats.add(a.subcategory);
      }
    });
    return Array.from(subcats);
  }, [category, activeArticlesDatabase]);

  // Reset subcategory when category changes
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setSubcategory('Barchasi');
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'Barchasi') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  // Ranking calculation & partitioning (primary vs cross-category)
  const { primaryArticles, crossCategoryArticles } = useMemo(() => {
    const rawQ = query.trim();
    const normQ = normalizeSearchText(rawQ);
    const queryWords = normQ.split(/\s+/).filter((w) => w.length >= 2);
    const digitsOnly = rawQ.replace(/\D/g, '');

    // Check if query implies specific category
    let boostedCats: string[] = [];
    for (const [trigger, cats] of Object.entries(INTENT_CATEGORY_BOOST)) {
      if (normQ.includes(trigger)) {
        boostedCats.push(...cats);
      }
    }
    boostedCats = [...new Set(boostedCats.map(normalizeCat))];

    // Compute relevance score for each article in the entire database
    const scoredList = activeArticlesDatabase.map((a) => {
      const artNum = a.article_number || a.article || '';
      const artDigits = artNum.replace(/\D/g, '');
      const titleNorm = normalizeSearchText(a.title);
      const summaryNorm = normalizeSearchText(a.short_description || a.summary || '');
      const contentNorm = normalizeSearchText(a.content || '');
      const sourceNorm = normalizeSearchText(a.source || a.law || '');
      const keywordsNorm = (a.keywords || a.tags || []).map(normalizeSearchText);

      let score = 0;
      let matched = false;

      if (!rawQ) {
        // No query: baseline scoring
        matched = true;
        score = 10;
      } else {
        // 1. Exact article number or exact title match
        if (digitsOnly && artDigits === digitsOnly) {
          score += 500;
          matched = true;
        }
        if (titleNorm === normQ) {
          score += 400;
          matched = true;
        } else if (titleNorm.includes(normQ)) {
          score += 250;
          matched = true;
        }

        // 2. Exact keyword match
        if (keywordsNorm.includes(normQ)) {
          score += 200;
          matched = true;
        }

        // 3. Matched in boosted intent category
        const artDomain = getArticleDomain(a.category);
        if (boostedCats.includes(normalizeCat(artDomain)) || boostedCats.includes(normalizeCat(a.category))) {
          score += 120;
        }

        // 4. Content / Summary / Title phrase match
        if (contentNorm.includes(normQ) || summaryNorm.includes(normQ) || titleNorm.includes(normQ)) {
          score += 150;
          matched = true;
        }

        // 5. Query word matches: user can search for any word or phrase in the article
        let wordMatches = 0;
        for (const w of queryWords) {
          if (titleNorm.includes(w)) {
            score += 70;
            wordMatches++;
            matched = true;
          } else if (keywordsNorm.some((k) => k.includes(w))) {
            score += 50;
            wordMatches++;
            matched = true;
          } else if (summaryNorm.includes(w)) {
            score += 35;
            wordMatches++;
            matched = true;
          } else if (contentNorm.includes(w)) {
            score += 25;
            wordMatches++;
            matched = true;
          } else if (sourceNorm.includes(w)) {
            score += 15;
            wordMatches++;
            matched = true;
          }
        }

        // Boost for matching multiple words
        if (queryWords.length > 1 && wordMatches >= queryWords.length) {
          score += 80;
        }
      }

      return { article: a, score, matched };
    });

    const isFilteredCategory = category !== 'Barchasi';
    const selectedCatNorm = normalizeCat(category);
    const selectedSubcatNorm = normalizeCat(subcategory);

    const primary: LawArticle[] = [];
    const cross: LawArticle[] = [];

    scoredList.forEach(({ article, score, matched }) => {
      if (!matched && rawQ) return;

      const artDomain = getArticleDomain(article.category);
      const artDomainNorm = normalizeCat(artDomain);
      const artCatNorm = normalizeCat(article.category);
      const artSubcatNorm = normalizeCat(article.subcategory);

      if (!isFilteredCategory) {
        // "Barchasi" selected
        primary.push(article);
      } else if (artDomainNorm === selectedCatNorm || artCatNorm === selectedCatNorm) {
        // Matches selected category domain
        if (subcategory === 'Barchasi' || artSubcatNorm === selectedSubcatNorm) {
          primary.push(article);
        }
      } else if (rawQ && score >= 20) {
        // Cross-category match with relevance
        cross.push(article);
      }
    });

    // Sorter function
    const sortFn = (a: LawArticle, b: LawArticle) => {
      if (rawQ && sortBy === 'relevance') {
        const itemA = scoredList.find((s) => s.article.id === a.id);
        const itemB = scoredList.find((s) => s.article.id === b.id);
        const scoreA = itemA ? itemA.score : 0;
        const scoreB = itemB ? itemB.score : 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }

      const numA = parseInt((a.article_number || a.article || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.article_number || b.article || '').replace(/\D/g, ''), 10) || 0;

      if (sortBy === 'num_asc') return numA - numB;
      if (sortBy === 'num_desc') return numB - numA;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title, 'uz');
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title, 'uz');

      return numA - numB;
    };

    primary.sort(sortFn);
    cross.sort(sortFn);

    return { primaryArticles: primary, crossCategoryArticles: cross.slice(0, 9) };
  }, [category, subcategory, query, sortBy]);

  const toggleSave = async (id: string) => {
    const isCurrentlySaved = saved.includes(id);
    const next = isCurrentlySaved ? saved.filter((s) => s !== id) : [...saved, id];
    setSaved(next);
    safeStorage.setJSON('advokatai_saved_articles', next);

    if (user?.id) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          if (isCurrentlySaved) {
            await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('legal_article_id', id);
          } else {
            await supabase
              .from('favorites')
              .insert({
                user_id: user.id,
                legal_article_id: id,
              });
          }
        }
      } catch (err) {
        console.warn('[SearchPage] Favorites sync warning:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Search Section */}
      <section className="py-14 bg-gradient-to-br from-gray-50 via-white to-teal-50/40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <span className="text-teal-600 text-xs sm:text-sm font-semibold uppercase tracking-widest">
            Rasmiy Qonun Qidiruvi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-3">
            Oʻzbekiston Qonunlarini Qidiring
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mb-4">
            20 ta huquqiy soha boʻyicha rasmiy moddalar, qonun matnlari va Lex.uz havolalari
          </p>

          {/* Quota Indicator */}
          {isLoggedIn && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800 mb-6 shadow-2xs">
              <i className="ri-search-line text-teal-600"></i>
              <span>Qidiruv limitingiz: <strong>{searchCount}</strong> / <strong>{searchLimit >= 999999 ? 'Cheksiz' : `${searchLimit} ta`}</strong></span>
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  maxLength={200}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Modda raqami (masalan: 15-modda) yoki kalit so‘z (aliment, ijara, ishdan bo‘shatish, soliq)..."
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none shadow-2xs"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title="Tozalash"
                  >
                    <i className="ri-close-line text-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
              <span className="font-medium text-gray-500">Mashhur qidiruvlar:</span>
              {['aliment', 'ishdan bo‘shatish', 'ijara shartnomasi', 'qarzdorlik', 'meros', 'yo‘l harakati', 'soliq'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-white/80 hover:bg-teal-50 hover:text-teal-700 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer text-[11px]"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 20 Categories Filter Bar */}
      <section className="py-4 bg-white border-b border-gray-100 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col gap-3">
            {/* Categories horizontal scroll / flex wrap */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {activeLegalCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Subcategory & Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80">
              {/* Subcategories (if selected category has subcategories) */}
              <div className="flex items-center gap-2 flex-wrap">
                {availableSubcategories.length > 0 && (
                  <>
                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <i className="ri-folder-line text-teal-600"></i> Yoʻnalish:
                    </span>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer max-w-[240px] truncate"
                    >
                      <option value="Barchasi">Barcha yoʻnalishlar</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 text-xs ml-auto">
                <span className="text-gray-400 flex items-center gap-1 font-medium">
                  <i className="ri-sort-asc text-teal-600"></i> Saralash:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Mosligi boʻyicha</option>
                  <option value="num_asc">Modda raqami (Oʻsish)</option>
                  <option value="num_desc">Modda raqami (Kamayish)</option>
                  <option value="title_asc">Nomi (A - Z)</option>
                  <option value="title_desc">Nomi (Z - A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Header */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {query.trim()
                  ? `“${query}” boʻyicha qidiruv natijalari`
                  : category === 'Barchasi'
                  ? 'Rasmiy qonun moddalari to‘plami'
                  : `${category} moddalari`}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {query.trim()
                  ? `Tanlangan yoʻnalish: ${category}`
                  : category === 'Barchasi'
                  ? 'Oʻzbekiston Respublikasining amaldagi rasmiy qonunchilik hujjatlari'
                  : `${category} sohasiga oid amaldagi qonunchilik normalari`}
              </p>
            </div>
            {primaryArticles.length > 0 && (
              <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
                <i className="ri-scales-3-line"></i>
                <span>Rasmiy qonunlar</span>
              </span>
            )}
          </div>

          {/* Primary Results */}
          {primaryArticles.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <i className="ri-search-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Ushbu toifada modda topilmadi</h3>
              <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
                “{query}” soʻrovi boʻyicha {category !== 'Barchasi' ? `"${category}" sohasida` : ''} moddalar topilmadi.
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setCategory('Barchasi');
                  setSubcategory('Barchasi');
                }}
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Barcha qonunlarni koʻrish
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {primaryArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  saved={saved.includes(article.id)}
                  onSave={() => toggleSave(article.id)}
                  onOpen={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          )}

          {/* Cross-Category Section: "Boshqa tegishli huquqiy yo‘nalishlar" */}
          {crossCategoryArticles.length > 0 && (
            <div className="mt-14 pt-8 border-t-2 border-dashed border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-1">
                    <i className="ri-compass-3-line"></i>
                    <span>Boshqa tegishli huquqiy yo‘nalishlar</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    “{query}” soʻrovi boʻyicha boshqa sohalardagi qonun moddalari
                  </h3>
                  <p className="text-xs text-gray-500">
                    Ushbu norma siz qidirayotgan masalaga aloqador boʻlishi mumkin boʻlgan boshqa qonunchilik sohalaridan topildi
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crossCategoryArticles.map((article) => (
                  <ArticleCard
                    key={`cross_${article.id}`}
                    article={article}
                    saved={saved.includes(article.id)}
                    onSave={() => toggleSave(article.id)}
                    onOpen={() => setSelectedArticle(article)}
                    isCrossCategory
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Banner */}
          <div className="mt-16 bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-md relative overflow-hidden">
            <div className="max-w-2xl mx-auto relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <i className="ri-scales-3-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Qonun moddasini tushunishda yordam kerakmi?</h3>
              <p className="text-teal-100 text-sm mb-6 leading-relaxed">
                AdvokatAI siz qidirayotgan har qanday moddaning mohiyatini oddiy tilda tushuntirib beradi va arizangizga mos hujjat loyihasini tayyorlaydi.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center bg-white text-teal-700 font-bold px-8 py-3.5 rounded-full text-sm hover:bg-teal-50 transition-all shadow-sm cursor-pointer gap-2"
              >
                <i className="ri-chat-3-line"></i>
                <span>AI bilan maslahatni boshlash</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}

function ArticleCard({
  article,
  saved,
  onSave,
  onOpen,
  isCrossCategory,
}: {
  article: LawArticle;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  isCrossCategory?: boolean;
}) {
  const chatPrompt = `${article.source || article.law}, ${article.article_number || article.article}: "${article.title}"`;
  const lawName = article.source || article.law || 'Oʻzbekiston qonunchiligi';
  const artNumber = article.article_number || article.article || '';
  const description = article.short_description || article.summary || '';
  const tagsList = article.keywords || article.tags || [];
  const sourceLink = article.source_url || article.sourceUrl || '';

  return (
    <div
      className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer ${
        isCrossCategory ? 'border-amber-200/80 hover:border-amber-400' : 'border-gray-200/80 hover:border-teal-300'
      }`}
      onClick={onOpen}
    >
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex flex-wrap gap-1 items-center">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isCrossCategory
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-teal-700 bg-teal-50 border-teal-100'
              }`}
            >
              {getArticleDomain(article.category)}
            </span>
            {article.subcategory && (
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                {article.subcategory}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={`text-base transition-colors p-1 cursor-pointer ${
              saved ? 'text-teal-600' : 'text-gray-300 hover:text-teal-500'
            }`}
            title={saved ? 'Saqlanganlardan oʻchirish' : 'Saqlash'}
          >
            <i className={saved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}></i>
          </button>
        </div>

        <div className="mb-3">
          <div className="text-[11px] text-gray-400 font-medium truncate" title={lawName}>
            {lawName}
          </div>
          <div className="text-sm font-bold text-teal-700 mt-0.5">{artNumber}</div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug mt-1 group-hover:text-teal-800 transition-colors">
            {article.title}
          </h3>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tagsList.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onOpen}
          className="text-xs text-teal-700 font-bold hover:text-teal-900 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <i className="ri-book-open-line"></i>
          <span>Toʻliq matn →</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            to={`/chat?article=${encodeURIComponent(chatPrompt)}&articleUrl=${encodeURIComponent(sourceLink)}`}
            className="text-xs text-gray-500 hover:text-teal-700 flex items-center gap-1 font-medium transition-colors"
            title="AI yordamida tushuntirish olish"
          >
            <i className="ri-scales-3-line"></i>
            <span>AI maslahat</span>
          </Link>

          {sourceLink && (
            <a
              href={sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-400 hover:text-teal-600 flex items-center gap-1 transition-colors font-medium"
              title="Lex.uz rasmiy bazasida ochish"
            >
              <span>Lex.uz</span>
              <i className="ri-external-link-line text-[10px]"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleModal({ article, onClose }: { article: LawArticle; onClose: () => void }) {
  const chatPrompt = `${article.source || article.law}, ${article.article_number || article.article}: "${article.title}"`;
  const lawName = article.source || article.law || 'Oʻzbekiston Respublikasi qonunchiligi';
  const artNumber = article.article_number || article.article || '';
  const sourceLink = article.source_url || article.sourceUrl || '';
  const content = article.content || article.short_description || article.summary || '';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-0.5 rounded-full">
                {getArticleDomain(article.category)}
              </span>
              {article.subcategory && (
                <span className="text-xs text-gray-600 bg-gray-200/70 px-2.5 py-0.5 rounded-full">
                  {article.subcategory}
                </span>
              )}
              <span className="text-xs text-gray-400 font-medium">
                Tahrir sanasi: {article.updated_at || '2026'}
              </span>
            </div>
            <div className="text-xs font-medium text-gray-500 mb-1">{lawName}</div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              <span className="text-teal-700 mr-2">{artNumber}:</span>
              {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            title="Yopish (Esc)"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Modal Body: Complete Article Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100 text-xs text-teal-800 flex items-center gap-2">
            <i className="ri-shield-check-line text-base text-teal-600"></i>
            <span>
              Oʻzbekiston Respublikasining rasmiy Lex.uz qonunchilik bazasidan tasdiqlangan rasmiy matn.
            </span>
          </div>

          <div className="pt-2 font-normal leading-relaxed text-gray-800">
            {content}
          </div>

          {article.keywords && article.keywords.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">Tegishli kalit soʻzlar:</div>
              <div className="flex flex-wrap gap-1.5">
                {article.keywords.map((k) => (
                  <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <i className="ri-information-line text-teal-600"></i>
            <span>AdvokatAI inson advokat emas · Faqat axborot va tushuntirish maqsadida</span>
          </div>

          <div className="flex items-center gap-3">
            {sourceLink && (
              <a
                href={sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-white transition-colors cursor-pointer"
              >
                <span>Lex.uz da ochish</span>
                <i className="ri-external-link-line"></i>
              </a>
            )}

            <Link
              to={`/chat?article=${encodeURIComponent(chatPrompt)}&articleUrl=${encodeURIComponent(sourceLink)}`}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <i className="ri-scales-3-line"></i>
              <span>AI dan tushuntirish soʻrash</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH LIMIT MODAL */}
      {showSearchLimitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowSearchLimitModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-100">
              <i className="ri-file-search-line"></i>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Qonun qidiruv limitingiz tugadi
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Bugungi rejangiz bo'yicha belgilangan qidiruvlar soni ({searchLimit} ta) to'ldi. Ko'proq rasmiy moddalar va qonunlarni qidirish uchun tarifingizni yangilang:
              <br /><strong className="text-teal-700">Pro:</strong> kuniga 30 ta qidiruv · <strong className="text-teal-700">Premium:</strong> cheksiz qidiruv!
            </p>

            <div className="space-y-3">
              <Link
                to="/pricing"
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i className="ri-vip-crown-line text-amber-300"></i>
                <span>Tariflarni ko'rish</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowSearchLimitModal(false)}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
