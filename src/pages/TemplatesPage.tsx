import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  legalTemplatesDatabase,
  LegalTemplate,
  TEMPLATE_CATEGORIES
} from '../data/legalTemplates';
import {
  LegalDocumentModel,
  exportToDocx,
  printLegalDocument
} from '../utils/documentRenderer';
import { safeFetchJson } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const categoryColors: Record<string, string> = {
  'Uy-joy va mulk': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Mehnat va bandlik': 'bg-blue-50 text-blue-700 border-blue-200',
  'Arizalar va murojaatlar': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sud va nizolar': 'bg-red-50 text-red-700 border-red-200',
  'Shartnomalar va biznes': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Oila va fuqarolik': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function TemplatesPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const catParam = searchParams.get('category') || searchParams.get('cat');

  const [dbTemplates, setDbTemplates] = useState<(LegalTemplate & { supabaseId?: string })[]>([]);
  const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>([]);

  // Live Supabase query for document_templates
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseTemplates() {
      try {
        const { data: tmplData } = await supabase
          .from('document_templates')
          .select('*, legal_categories(name_uz)')
          .eq('is_active', true)
          .order('title_uz');

        if (isMounted && tmplData && tmplData.length > 0) {
          const dbByTitle = new Map<string, any>();
          tmplData.forEach((d: any) => {
            dbByTitle.set(d.title_uz.toLowerCase().trim(), d);
          });

          // Enrich all 83 authentic templates with Supabase database UUIDs
          const enriched: (LegalTemplate & { supabaseId?: string })[] = legalTemplatesDatabase.map((localT) => {
            const dbMatch = dbByTitle.get(localT.name.toLowerCase().trim());
            return {
              ...localT,
              supabaseId: dbMatch ? dbMatch.id : undefined,
            };
          });

          // Also include any dynamically created templates in Supabase not in local code
          const localTitles = new Set(legalTemplatesDatabase.map((t) => t.name.toLowerCase().trim()));
          const extraTemplates: (LegalTemplate & { supabaseId?: string })[] = [];

          tmplData.forEach((d: any) => {
            if (!localTitles.has(d.title_uz.toLowerCase().trim())) {
              extraTemplates.push({
                id: d.id,
                supabaseId: d.id,
                name: d.title_uz,
                icon: 'ri-file-text-line',
                category: d.legal_categories?.name_uz || 'Arizalar va murojaatlar',
                desc: d.description_uz || '',
                legalBasis: 'O‘zbekiston Respublikasi amaldagi qonunchiligi',
                disclaimer: 'Ushbu shartnoma namunaviy loyiha hisoblanadi.',
                fields: [
                  { key: 'full_name', label: 'F.I.SH.', type: 'text', required: true, placeholder: 'Familiya Ism Sharif' },
                  { key: 'date', label: 'Sana', type: 'date', required: true },
                  { key: 'details', label: 'Qo‘shimcha tafsilotlar', type: 'textarea', placeholder: 'Tafsilotlarni kiriting...' }
                ],
                generateModel: (fData: Record<string, any>) => ({
                  title: d.title_uz,
                  date: fData.date || new Date().toISOString().slice(0, 10),
                  sections: [
                    {
                      title: 'Hujjat mazmuni',
                      paragraphs: (d.content_template || '').split('\n').filter(Boolean)
                    }
                  ],
                  signatures: [
                    { role: 'Ariza beruvchi', name: fData.full_name || 'Fuqaro' }
                  ]
                }),
                generate: (fData: Record<string, any>) => {
                  return `${d.title_uz}\n\n${d.content_template || ''}\n\nF.I.SH: ${fData.full_name || ''}\nSana: ${fData.date || ''}\nQo‘shimcha: ${fData.details || ''}`;
                }
              });
            }
          });

          setDbTemplates([...enriched, ...extraTemplates]);
        }
      } catch (err) {
        console.warn('[TemplatesPage] Supabase templates fetch warning:', err);
      }
    }

    loadSupabaseTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync favorites from Supabase public.favorites
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('favorites')
      .select('document_template_id')
      .eq('user_id', user.id)
      .not('document_template_id', 'is', null)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const favIds = data.map((d: any) => String(d.document_template_id)).filter(Boolean);
          setSavedTemplateIds(favIds);
        }
      });
  }, [user?.id]);

  const activeTemplates = useMemo(() => {
    return dbTemplates.length > 0 ? dbTemplates : legalTemplatesDatabase;
  }, [dbTemplates]);

  const activeCategories = TEMPLATE_CATEGORIES;

  const [selected, setSelected] = useState<LegalTemplate | null>(() => {
    if (idParam) {
      const match = legalTemplatesDatabase.find((t) => String(t.id) === idParam);
      if (match) return match;
    }
    return legalTemplatesDatabase[0] || null;
  });

  // Keep selected in sync if activeTemplates changes
  useEffect(() => {
    if (idParam) {
      const match = activeTemplates.find((t) => String(t.id) === idParam);
      if (match) setSelected(match);
    } else if (!selected && activeTemplates.length > 0) {
      setSelected(activeTemplates[0]);
    }
  }, [activeTemplates, idParam]);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [viewMode, setViewMode] = useState<'paper' | 'text'>('paper');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState('Hujjatni yuklab olish');
  const [pendingAuthAction, setPendingAuthAction] = useState<{
    type: 'download_docx' | 'download_pdf' | 'download_txt' | 'copy';
    templateId: string | number;
    formData?: Record<string, string>;
  } | null>(null);

  const [filterCat, setFilterCat] = useState(() => {
    if (catParam && TEMPLATE_CATEGORIES.includes(catParam as any)) {
      return catParam;
    }
    return 'Barchasi';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Handle returning from login/register with a pending resumed action
  useEffect(() => {
    const resumed = (location.state as any)?.resumedAction;
    if (resumed && resumed.templateId) {
      const target = activeTemplates.find((t) => String(t.id) === String(resumed.templateId));
      if (target) {
        setSelected(target);
        if (resumed.formData) {
          setFormData(resumed.formData);
        }
        navigate(location.pathname + location.search, { replace: true, state: {} });

        setTimeout(() => {
          if (resumed.type === 'download_docx') {
            try {
              const model = target.generateModel(resumed.formData || {});
              exportToDocx(model, `${target.name}_AdvokatAI`);
            } catch (e) {
              console.error(e);
            }
          } else if (resumed.type === 'download_pdf') {
            printLegalDocument('legal-document-paper');
          } else if (resumed.type === 'download_txt') {
            try {
              const txt = target.generate(resumed.formData || {});
              const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${target.name.replace(/\s+/g, '_')}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              console.error(e);
            }
          } else if (resumed.type === 'copy') {
            try {
              const txt = target.generate(resumed.formData || {});
              navigator.clipboard.writeText(txt).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            } catch (e) {
              console.error(e);
            }
          }
        }, 400);
      }
    }
  }, [activeTemplates]);

  // Sync with URL parameters on external changes
  useEffect(() => {
    if (idParam) {
      const match = activeTemplates.find((t) => String(t.id) === idParam);
      if (match && match.id !== selected?.id) {
        setSelected(match);
        setFormData({});
      }
    }
    if (catParam && activeCategories.includes(catParam as any) && catParam !== filterCat) {
      setFilterCat(catParam);
    }
  }, [idParam, catParam, activeTemplates, activeCategories]);

  // Generate model and text
  const currentModel: LegalDocumentModel | null = useMemo(() => {
    if (!selected) return null;
    try {
      return selected.generateModel(formData);
    } catch {
      return null;
    }
  }, [selected, formData]);

  const currentPlainText = useMemo(() => {
    if (!selected) return '';
    try {
      return selected.generate(formData);
    } catch {
      return '';
    }
  }, [selected, formData]);

  const selectTemplate = (t: LegalTemplate) => {
    setSelected(t);
    setFormData({});
    setCopied(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('id', String(t.id));
    setSearchParams(newParams);
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const toggleFavoriteTemplate = async (tmplId: string | number) => {
    const target = activeTemplates.find(
      (t) => String(t.id) === String(tmplId) || (t as any).supabaseId === String(tmplId)
    );
    const strId = String(tmplId);
    const sId =
      (target as any)?.supabaseId ||
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strId) ? strId : null);

    const isFav = savedTemplateIds.includes(strId) || (sId ? savedTemplateIds.includes(sId) : false);
    setSavedTemplateIds((prev) => {
      if (isFav) {
        return prev.filter((id) => id !== strId && id !== sId);
      } else {
        const next = [...prev, strId];
        if (sId && !next.includes(sId)) next.push(sId);
        return next;
      }
    });

    if (user?.id && sId) {
      try {
        if (isFav) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('document_template_id', sId);
        } else {
          await supabase
            .from('favorites')
            .insert({ user_id: user.id, document_template_id: sId });
        }
      } catch (err) {
        console.warn('[TemplatesPage] Favorite sync warning:', err);
      }
    }
  };

  const requireAuthentication = async (
    actionType: 'download_docx' | 'download_pdf' | 'download_txt' | 'copy',
    actionTitle: string,
    executeFn: () => void | Promise<void>
  ) => {
    if (isLoggedIn) {
      // Permission verification from user subscription (plans table)
      if (actionType === 'copy' && user?.canCopy === false) {
        alert("Sizning hozirgi tarif rejangizda nusxa olish imkoniyati cheklangan. Iltimos, obunangizni yangilang.");
        return;
      }
      if (actionType.startsWith('download') && user?.canDownload === false) {
        alert("Sizning hozirgi tarif rejangizda hujjatni yuklab olish imkoniyati cheklangan. Iltimos, obunangizni yangilang.");
        return;
      }

      // Persist document to public.user_documents
      if (user?.id && selected) {
        try {
          const sId =
            (selected as any)?.supabaseId ||
            (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(selected.id))
              ? String(selected.id)
              : null);
          await supabase.from('user_documents').insert({
            user_id: user.id,
            template_id: sId,
            title: selected.name,
            content: currentPlainText,
            status: 'completed',
          });
        } catch (e) {
          console.warn('[TemplatesPage] Save user_document warning:', e);
        }

        const endpoint = actionType.startsWith('download') ? 'download' : 'copy';
        safeFetchJson(`/api/templates/${selected.id}/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify({ action: actionType, formData }),
        }).catch(() => {});
      }
      executeFn();
    } else {
      setAuthModalAction(actionTitle);
      setPendingAuthAction({
        type: actionType,
        templateId: selected?.id || 1,
        formData,
      });
      setShowAuthModal(true);
    }
  };

  const handleCopy = () => {
    if (!currentPlainText) return;
    navigator.clipboard.writeText(currentPlainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGuardedCopy = () => {
    requireAuthentication('copy', 'Hujjatdan nusxa olish', handleCopy);
  };

  const handleExportDocx = async () => {
    if (!currentModel || !selected) return;
    setIsExportingDocx(true);
    try {
      await exportToDocx(currentModel, `${selected.name}_AdvokatAI`);
    } catch (err) {
      console.error('Docx generation error:', err);
      alert('Word hujjatini yuklab olishda xatolik yuz berdi.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleGuardedExportDocx = () => {
    requireAuthentication('download_docx', 'Word (.docx) formatida yuklab olish', handleExportDocx);
  };

  const handlePrintPdf = () => {
    printLegalDocument('legal-document-paper');
  };

  const handleGuardedPrintPdf = () => {
    requireAuthentication('download_pdf', 'PDF formatida yuklab olish yoki chop etish', handlePrintPdf);
  };

  const handleDownloadTxt = () => {
    if (!currentPlainText || !selected) return;
    const blob = new Blob([currentPlainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGuardedDownloadTxt = () => {
    requireAuthentication('download_txt', 'Oddiy matn (.txt) formatida yuklab olish', handleDownloadTxt);
  };

  const filteredTemplates = useMemo(() => {
    return activeTemplates.filter((t) => {
      const matchCat = filterCat === 'Barchasi' || t.category === filterCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.desc && t.desc.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeTemplates, filterCat, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      {/* Hero Header */}
      <section className="py-14 bg-gradient-to-br from-gray-50 via-white to-teal-50/40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <span className="text-teal-600 text-xs sm:text-sm font-semibold uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100/60 inline-block mb-2">
            Rasmiy Huquqiy Hujjatlar
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-3 tracking-tight">
            Huquqiy Hujjat Shablonlari
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            Oʻzbekiston qonunchiligi asosida tayyorlangan rasmiy shartnoma, ariza, da’vo va murojaat loyihalari
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
            <input
              type="text"
              maxLength={150}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shablon qidirish (masalan: ijara, ishdan bo'shash, da'vo, aliment, oldi-sotdi)..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-gray-200/60">
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  filterCat === cat
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Template list (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Mavjud shablonlar
                </h2>
                {filterCat !== 'Barchasi' && (
                  <button
                    onClick={() => setFilterCat('Barchasi')}
                    className="text-xs text-teal-600 hover:underline font-medium cursor-pointer"
                  >
                    Barchasi
                  </button>
                )}
              </div>

              <div className="max-h-[780px] overflow-y-auto pr-1.5 space-y-2.5 custom-scrollbar">
                {filteredTemplates.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 text-xs">
                    <i className="ri-search-line text-2xl text-gray-300 block mb-2"></i>
                    Qidiruv boʻyicha shablon topilmadi.
                  </div>
                ) : (
                  filteredTemplates.map((t) => {
                    const isSelected = selected?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectTemplate(t)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                            : 'border-gray-200/90 bg-white hover:border-teal-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                              isSelected ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'
                            }`}
                          >
                            <i className={t.icon}></i>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                              {t.name}
                            </div>
                            {t.desc && (
                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                {t.desc}
                              </p>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border mt-1.5 inline-block font-medium ${
                                categoryColors[t.category] || 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}
                            >
                              {t.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Form + Realtime A4 Paper Preview (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {!selected ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                  <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-file-text-line text-teal-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Shablon tanlang</h3>
                  <p className="text-gray-500 text-xs">
                    Chap tomondagi roʻyxatdan kerakli shablonni tanlang va maydonlarni toʻldiring
                  </p>
                </div>
              ) : (
                <>
                  {/* Form Card */}
                  <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                      <div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold inline-block mb-1.5 ${
                            categoryColors[selected.category] || 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {selected.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                        {selected.desc && (
                          <p className="text-xs text-gray-500 mt-0.5">{selected.desc}</p>
                        )}
                        {selected.legalBasis && (
                          <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
                            <i className="ri-scales-3-line"></i>
                            <span>Huquqiy asos: {selected.legalBasis}</span>
                          </p>
                        )}
                      </div>
                      {(() => {
                        const isSelectedSaved =
                          savedTemplateIds.includes(String(selected.id)) ||
                          Boolean((selected as any)?.supabaseId && savedTemplateIds.includes((selected as any).supabaseId));
                        return (
                          <button
                            type="button"
                            onClick={() => toggleFavoriteTemplate(selected.id)}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer text-base ${
                              isSelectedSaved
                                ? 'text-teal-600 bg-teal-50 border-teal-200'
                                : 'text-gray-400 bg-gray-50 border-gray-200 hover:text-teal-600 hover:bg-teal-50'
                            }`}
                            title={isSelectedSaved ? "Saqlanganlardan o'chirish" : "Shablonni saqlab qo'yish"}
                          >
                            <i className={isSelectedSaved ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                          </button>
                        );
                      })()}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {selected.fields.map((field) => (
                        <div
                          key={field.key}
                          className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                        >
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                          </label>
                          {field.helper && (
                            <p className="text-[11px] text-gray-400 mb-1">{field.helper}</p>
                          )}
                          {field.type === 'select' ? (
                            <select
                              value={formData[field.key] || ''}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                            >
                              <option value="">Tanlang...</option>
                              {field.options?.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              value={formData[field.key] || ''}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none leading-relaxed"
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.key] || ''}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">
                        * Belgilangan maydonlar rasmiy hujjatda aks etadi
                      </span>
                      <button
                        onClick={() => setFormData({})}
                        className="text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Maydonlarni tozalash
                      </button>
                    </div>
                  </div>

                  {/* Generated Document Card */}
                  {currentModel && (
                    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden">
                      {/* Control bar */}
                      <div className="bg-gray-50/90 border-b border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">
                              Tayyor Hujjat Loyihasi
                            </h3>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Kiritilgan maʼlumotlar asosida A4 qog‘oz formatida shakllantirildi
                          </p>
                        </div>

                        {/* View Switcher & Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="bg-gray-200/70 p-0.5 rounded-xl flex items-center text-xs">
                            <button
                              onClick={() => setViewMode('paper')}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                viewMode === 'paper'
                                  ? 'bg-white text-gray-900 shadow-2xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <i className="ri-file-paper-2-line mr-1"></i>
                              Qog‘oz (A4)
                            </button>
                            <button
                              onClick={() => setViewMode('text')}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                viewMode === 'text'
                                  ? 'bg-white text-gray-900 shadow-2xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <i className="ri-file-text-line mr-1"></i>
                              Matn
                            </button>
                          </div>

                          {/* Action Buttons: Ko'rish, PDF, Word, Nusxa */}
                          <button
                            onClick={() => setIsPreviewModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            title="To‘liq ekranda ko‘rish"
                          >
                            <i className="ri-fullscreen-line text-sm text-gray-500"></i>
                            <span>Ko‘rish</span>
                          </button>

                          <button
                            onClick={handleGuardedCopy}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                              copied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                            }`}
                            title="Nusxa olish"
                          >
                            <i className={copied ? 'ri-check-line text-emerald-600' : 'ri-file-copy-line text-gray-500'}></i>
                            <span>{copied ? 'Nusxa olindi' : 'Nusxa'}</span>
                          </button>

                          <button
                            onClick={handleGuardedPrintPdf}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="PDF formatda yuklab olish yoki chop etish"
                          >
                            <i className="ri-file-pdf-line text-sm"></i>
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={handleGuardedExportDocx}
                            disabled={isExportingDocx}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Microsoft Word (.docx) formatida yuklab olish"
                          >
                            <i className={isExportingDocx ? 'ri-loader-4-line animate-spin text-sm' : 'ri-file-word-line text-sm'}></i>
                            <span>Word (.docx)</span>
                          </button>
                        </div>
                      </div>

                      {/* Document Canvas Container */}
                      <div className="p-4 sm:p-8 bg-gray-100/70 overflow-x-auto">
                        {viewMode === 'paper' ? (
                          <div
                            id="legal-document-paper"
                            className="bg-white max-w-[800px] mx-auto p-8 sm:p-14 shadow-md rounded-sm border border-gray-200/80 font-serif text-gray-900 leading-relaxed text-[13px] sm:text-[14px]"
                          >
                            {/* Header Right / Shapka */}
                            {currentModel.headerRight && currentModel.headerRight.length > 0 && (
                              <div className="text-right mb-6 text-xs text-gray-700 italic space-y-1">
                                {currentModel.headerRight.map((hr, idx) => (
                                  <div key={idx}>{hr}</div>
                                ))}
                              </div>
                            )}

                            {/* Title */}
                            <div className="text-center mb-6">
                              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-gray-900">
                                {currentModel.title}
                              </h2>
                              {currentModel.subtitle && (
                                <p className="text-xs text-gray-600 italic mt-1">
                                  {currentModel.subtitle}
                                </p>
                              )}
                            </div>

                            {/* City and Date bar */}
                            {(currentModel.city || currentModel.date) && (
                              <div className="flex justify-between items-center text-xs font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-5">
                                <span>{currentModel.city || '_________________'}</span>
                                <span>{currentModel.date || ''}</span>
                              </div>
                            )}

                            {/* Preamble */}
                            {currentModel.preamble && (
                              <p className="text-justify indent-8 mb-5 leading-relaxed text-gray-800">
                                {currentModel.preamble}
                              </p>
                            )}

                            {/* Sections */}
                            <div className="space-y-5">
                              {currentModel.sections.map((sec, sIdx) => (
                                <div key={sIdx}>
                                  {sec.title && (
                                    <h4 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide mb-2 mt-4">
                                      {sec.title}
                                    </h4>
                                  )}
                                  <div className="space-y-2">
                                    {sec.paragraphs.map((p, pIdx) => (
                                      <p
                                        key={pIdx}
                                        className="text-justify indent-6 leading-relaxed text-gray-800"
                                      >
                                        {p}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Signatures */}
                            {currentModel.signatures && currentModel.signatures.length > 0 && (
                              <div className="mt-10 pt-6 border-t border-gray-300">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-4">
                                  Taraflarning rekvizitlari va imolari:
                                </h4>

                                {currentModel.signatures.length === 2 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                                    {currentModel.signatures.map((sig, idx) => (
                                      <div key={idx} className="space-y-1.5">
                                        <div className="font-bold text-gray-900">[{sig.role}]</div>
                                        <div>
                                          F.I.Sh.:{' '}
                                          <span className="font-medium">{sig.name || '__________________________'}</span>
                                        </div>
                                        {sig.details?.map((d, dIdx) => (
                                          <div key={dIdx} className="text-gray-600">{d}</div>
                                        ))}
                                        <div className="pt-4 text-gray-500">
                                          Imzo: __________________________
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-4 text-xs">
                                    {currentModel.signatures.map((sig, idx) => (
                                      <div key={idx} className="space-y-1.5 max-w-sm">
                                        <div className="font-bold text-gray-900">[{sig.role}]</div>
                                        <div>
                                          F.I.Sh.:{' '}
                                          <span className="font-medium">{sig.name || '_______________________________'}</span>
                                        </div>
                                        {sig.details?.map((d, dIdx) => (
                                          <div key={dIdx} className="text-gray-600">{d}</div>
                                        ))}
                                        <div className="pt-3 text-gray-500">
                                          Imzo: _______________________________
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Disclaimer note in paper footer */}
                            {currentModel.disclaimer && (
                              <div className="mt-8 pt-4 border-t border-gray-200 text-[11px] text-gray-500 italic">
                                <strong>Huquqiy eslatma:</strong> {currentModel.disclaimer}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white max-w-[800px] mx-auto p-6 rounded-xl border border-gray-200 shadow-sm">
                            <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed overflow-x-auto selection:bg-teal-100">
                              {currentPlainText}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Bottom Info Banner */}
                      <div className="p-4 bg-teal-50/50 border-t border-teal-100 text-xs text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <i className="ri-shield-check-line text-teal-600 text-base"></i>
                          <span>
                            Ushbu shablon Oʻzbekiston Respublikasi amaldagi qonunchiligi normalariga moslashtirilgan.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGuardedDownloadTxt}
                            className="text-xs text-teal-700 hover:underline cursor-pointer font-medium"
                          >
                            Oddiy matn (.txt)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Modal Preview */}
      {isPreviewModalOpen && currentModel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <i className="ri-file-text-line text-teal-600 text-xl"></i>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  {currentModel.title} — Ko‘rish
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGuardedPrintPdf}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <i className="ri-file-pdf-line mr-1"></i> PDF
                </button>
                <button
                  onClick={handleGuardedExportDocx}
                  disabled={isExportingDocx}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <i className="ri-file-word-line mr-1"></i> Word (.docx)
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer ml-2"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-gray-100/60">
              <div className="bg-white p-8 sm:p-14 shadow-md rounded-sm border border-gray-200 font-serif text-gray-900 text-sm leading-relaxed max-w-3xl mx-auto">
                {currentModel.headerRight && currentModel.headerRight.length > 0 && (
                  <div className="text-right mb-6 text-xs text-gray-700 italic space-y-1">
                    {currentModel.headerRight.map((hr, idx) => (
                      <div key={idx}>{hr}</div>
                    ))}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-gray-900">
                    {currentModel.title}
                  </h2>
                </div>

                {(currentModel.city || currentModel.date) && (
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-5">
                    <span>{currentModel.city || '_________________'}</span>
                    <span>{currentModel.date || ''}</span>
                  </div>
                )}

                {currentModel.preamble && (
                  <p className="text-justify indent-8 mb-5 leading-relaxed text-gray-800">
                    {currentModel.preamble}
                  </p>
                )}

                <div className="space-y-5">
                  {currentModel.sections.map((sec, sIdx) => (
                    <div key={sIdx}>
                      {sec.title && (
                        <h4 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide mb-2 mt-4">
                          {sec.title}
                        </h4>
                      )}
                      <div className="space-y-2">
                        {sec.paragraphs.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-justify indent-6 leading-relaxed text-gray-800"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {currentModel.signatures && currentModel.signatures.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-gray-300">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-4">
                      Taraflarning rekvizitlari va imolari:
                    </h4>
                    {currentModel.signatures.length === 2 ? (
                      <div className="grid grid-cols-2 gap-8 text-xs">
                        {currentModel.signatures.map((sig, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="font-bold text-gray-900">[{sig.role}]</div>
                            <div>F.I.Sh.: {sig.name || '__________________________'}</div>
                            <div className="pt-4 text-gray-500">Imzo: __________________________</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs">
                        {currentModel.signatures.map((sig, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="font-bold text-gray-900">[{sig.role}]</div>
                            <div>F.I.Sh.: {sig.name || '_______________________________'}</div>
                            <div className="pt-3 text-gray-500">Imzo: _______________________________</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentModel.disclaimer && (
                  <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 italic">
                    <strong>Huquqiy eslatma:</strong> {currentModel.disclaimer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Prompt Modal for Unauthenticated Guests */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="ri-shield-user-line"></i>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Tizimga kirish talab qilinadi
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              <strong>{authModalAction}</strong> uchun hisobingizga kiring yoki bepul roʻyxatdan oʻting. Kirganingizdan soʻng hujjatingiz avtomatik tayyorlanadi.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login', {
                    state: {
                      from: location,
                      pendingAction: pendingAuthAction,
                    },
                  });
                }}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i className="ri-login-box-line text-base"></i>
                <span>Hisobga kirish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/register', {
                    state: {
                      from: location,
                      pendingAction: pendingAuthAction,
                    },
                  });
                }}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="ri-user-add-line text-base"></i>
                <span>Roʻyxatdan oʻtish (Bepul)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
