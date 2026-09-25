import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import { safeFetchJson, safeStorage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  supabase, 
  getUserConversations, 
  getConversationMessages, 
  getTodayAiUsage,
  Conversation as DbConversation,
  Message as DbMessage
} from '../utils/supabase';

interface Citation {
  document: string;
  article: string;
  title: string;
  url: string;
  relevance?: number;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  sourceArticle?: string;
  sourceUrl?: string;
  citations?: Citation[];
  confidence?: number;
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason?: string;
  needs_clarification?: boolean;
  userFeedback?: 1 | -1 | null;
  isError?: boolean;
  queryContext?: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lawGroup: string;
  messages: Message[];
}

const LAW_GROUPS = [
  { id: 'all', label: '🔍 Avtomatik aniqlash (Barcha qonunlar)' },
  { id: 'mehnat_kodeksi', label: '💼 Mehnat kodeksi' },
  { id: 'fuqarolik_kodeksi', label: '📜 Fuqarolik kodeksi' },
  { id: 'jinoyat_kodeksi', label: '⚖️ Jinoyat kodeksi' },
  { id: 'mamuriy_javobgarlik', label: '🛑 Maʼmuriy javobgarlik kodeksi' },
  { id: 'konstitutsiya', label: '🇺🇿 Oʻzbekiston Konstitutsiyasi' },
];

const quickTopics = [
  "Mehnat shartnomasi bo'yicha savol",
  "Ijara huquqlari va kvartira nizosi",
  "Ish beruvchi ish haqini to'lamayapti",
  "Shikoyat ariza yozish tartibi",
  "Maʼmuriy jarimadan shikoyat qilish",
  "Pora va korrupsiya holatlari",
];

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'init_welcome',
  sender: 'ai',
  timestamp: Date.now(),
  text: "Assalomu alaykum! Men **AdvokatAI** — O'zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi.\n\nSavolingizni erkin tilda yozing yoki kerakli kodeksni tanlab murojaat qiling.",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ChatPage() {
  const { user, isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const articleParam = searchParams.get('article');
  const convIdParam = searchParams.get('convId');

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_initial',
      title: 'Yangi suhbat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lawGroup: 'all',
      messages: [DEFAULT_WELCOME_MESSAGE],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('conv_initial');
  const [todayUsage, setTodayUsage] = useState<number>(0);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = activeConversation?.messages || [DEFAULT_WELCOME_MESSAGE];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [aiMode, setAiMode] = useState<string>('Yuklanmoqda...');
  const [selectedLawGroup, setSelectedLawGroup] = useState<string>(activeConversation?.lawGroup || 'all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthGateModal, setShowAuthGateModal] = useState<boolean>(false);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations and messages from Supabase (SOURCE OF TRUTH) for authenticated users
  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseHistory() {
      if (!isLoggedIn || !user?.id) {
        setTodayUsage(0);
        return;
      }

      try {
        // 1. Load today's AI question usage from Supabase and backend store
        const [usageCount, serverUsageRes] = await Promise.all([
          getTodayAiUsage(user.id).catch(() => 0),
          safeFetchJson(`/api/chat/usage/${user.id}`).catch(() => null),
        ]);
        const serverUsed = serverUsageRes?.data?.data?.daily_used || 0;
        const maxUsed = Math.max(usageCount, serverUsed);
        if (isMounted) setTodayUsage(maxUsed);

        // 2. Load conversations from public.conversations
        const dbConvs = await getUserConversations(user.id);
        if (!isMounted) return;

        if (dbConvs && dbConvs.length > 0) {
          const targetConvId = (convIdParam && dbConvs.some(c => c.id === convIdParam))
            ? convIdParam
            : dbConvs[0].id;

          // 3. Load messages for the active conversation from public.messages
          const dbMsgs = await getConversationMessages(targetConvId);
          if (!isMounted) return;

          const formattedConvs: Conversation[] = dbConvs.map((c: DbConversation) => {
            const isTarget = c.id === targetConvId;
            let convMsgs: Message[] = [DEFAULT_WELCOME_MESSAGE];

            if (isTarget && dbMsgs && dbMsgs.length > 0) {
              convMsgs = dbMsgs.map((m: DbMessage) => ({
                id: m.id,
                sender: m.role === 'assistant' ? 'ai' : 'user',
                text: m.content,
                timestamp: new Date(m.created_at).getTime(),
              }));
            }

            return {
              id: c.id,
              title: c.title,
              createdAt: new Date(c.created_at).getTime(),
              updatedAt: new Date(c.updated_at).getTime(),
              lawGroup: 'all',
              messages: convMsgs,
            };
          });

          setConversations(formattedConvs);
          setActiveConvId(targetConvId);
        }
      } catch (err) {
        console.error('[ChatPage] Error loading Supabase chat history:', err);
      }
    }

    loadSupabaseHistory();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.id, convIdParam]);

  // Load messages dynamically when switching conversations
  const handleSelectConversation = async (convId: string) => {
    setActiveConvId(convId);
    setError(null);
    setSidebarOpen(false);

    // If conversation messages are not loaded yet and user is authenticated, fetch them
    if (isLoggedIn && user?.id && UUID_REGEX.test(convId)) {
      const current = conversations.find(c => c.id === convId);
      if (current && current.messages.length <= 1) {
        try {
          const dbMsgs = await getConversationMessages(convId);
          if (dbMsgs && dbMsgs.length > 0) {
            const formatted = dbMsgs.map((m: DbMessage) => ({
              id: m.id,
              sender: (m.role === 'assistant' ? 'ai' : 'user') as 'ai' | 'user',
              text: m.content,
              timestamp: new Date(m.created_at).getTime(),
            }));
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: formatted } : c));
          }
        } catch (e) {
          console.error('[ChatPage] Error loading messages for conversation:', e);
        }
      }
    }
  };

  // Check health of backend
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await safeFetchJson('/api/health');
        if (res.ok && res.data) {
          if (isMounted) {
            setBackendStatus('connected');
            setAiMode(res.data.mode || 'Google Gemini');
          }
        } else {
          if (isMounted) setBackendStatus('offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      }
    };
    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading, scrollToBottom]);

  // Create new conversation
  const handleNewConversation = async () => {
    const tempId = 'conv_' + Date.now();
    const newConv: Conversation = {
      id: tempId,
      title: 'Yangi suhbat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lawGroup: 'all',
      messages: [DEFAULT_WELCOME_MESSAGE],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(tempId);
    setSelectedLawGroup('all');
    setError(null);
    setSidebarOpen(false);
  };

  // Delete conversation from state and Supabase
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoggedIn && user?.id && UUID_REGEX.test(id)) {
      try {
        await supabase.from('messages').delete().eq('conversation_id', id).eq('user_id', user.id);
        await supabase.from('conversations').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('[ChatPage] Error deleting conversation from Supabase:', err);
      }
    }

    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const freshConv: Conversation = {
        id: 'conv_' + Date.now(),
        title: 'Yangi suhbat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lawGroup: 'all',
        messages: [DEFAULT_WELCOME_MESSAGE],
      };
      setConversations([freshConv]);
      setActiveConvId(freshConv.id);
    } else {
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining[0].id);
      }
    }
  };

  // Send message with Supabase persistence
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setError(null);

      const userMsg: Message = {
        id: `u_${Date.now()}`,
        text: text.trim(),
        sender: 'user',
        timestamp: Date.now(),
      };

      const isFirstUserMsg = !messages.some((m) => m.sender === 'user');
      const generatedTitle = isFirstUserMsg
        ? text.trim().slice(0, 35) + (text.trim().length > 35 ? '...' : '')
        : activeConversation.title;

      // Ensure conversation exists in Supabase if user is logged in
      let persistentConvId = activeConvId;
      if (isLoggedIn && user?.id) {
        try {
          if (!UUID_REGEX.test(activeConvId)) {
            // Create conversation in public.conversations
            const { data: createdConv, error: convErr } = await supabase
              .from('conversations')
              .insert({
                user_id: user.id,
                title: generatedTitle,
              })
              .select('id')
              .single();

            if (!convErr && createdConv) {
              persistentConvId = createdConv.id;
              setActiveConvId(createdConv.id);
            }
          }

          // Insert user message into public.messages
          if (UUID_REGEX.test(persistentConvId)) {
            await supabase.from('messages').insert({
              conversation_id: persistentConvId,
              user_id: user.id,
              role: 'user',
              content: text.trim(),
            });
          }
        } catch (dbErr) {
          console.warn('[ChatPage] Supabase pre-save notice:', dbErr);
        }
      }

      // Update local state immediately for instant feedback
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                id: persistentConvId,
                title: isFirstUserMsg ? generatedTitle : c.title,
                updatedAt: Date.now(),
                messages: [...c.messages, userMsg],
              }
            : c
        )
      );

      setInput('');
      setLoading(true);

      try {
        const token = safeStorage.getItem('advokatai_token');
        const res = await safeFetchJson('/api/chat', {
          method: 'POST',
          timeoutMs: 45000,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify({
            userId: user?.id || 'anonymous',
            conversationId: UUID_REGEX.test(persistentConvId) ? persistentConvId : undefined,
            message: text.trim(),
            law_group: selectedLawGroup === 'all' ? null : selectedLawGroup,
            history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          }),
        });

        if (res.status === 429) {
          setShowLimitExceededModal(true);
          throw new Error(res.data?.message || "Bugungi savollar limitingiz tugadi.");
        }

        if (!res.ok) {
          throw new Error(res.error || `Server xatosi: ${res.status}`);
        }

        const json = res.data;

        if (json && json.data) {
          // Update usage count immediately for UI
          if (json.data.usage?.daily_used !== undefined) {
            setTodayUsage(Number(json.data.usage.daily_used));
          } else {
            setTodayUsage((prev) => prev + 1);
          }

          const aiMsg: Message = {
            id: `a_${Date.now()}`,
            text: json.data.text || "Javob matni olinmadi.",
            sender: 'ai',
            timestamp: Date.now(),
            sourceArticle: json.data.sourceArticle || undefined,
            sourceUrl: json.data.sourceUrl || undefined,
            citations: json.data.citations || undefined,
            confidence: json.data.confidence,
            confidenceLevel: json.data.confidenceLevel,
            confidenceReason: json.data.confidenceReason || undefined,
            needs_clarification: json.data.needs_clarification,
            queryContext: text.trim(),
          };

          // Persist assistant message to public.messages in Supabase
          if (isLoggedIn && user?.id && UUID_REGEX.test(persistentConvId)) {
            try {
              await supabase.from('messages').insert({
                conversation_id: persistentConvId,
                user_id: user.id,
                role: 'assistant',
                content: aiMsg.text,
              });

              // Update conversation updated_at and title
              await supabase.from('conversations').update({
                title: isFirstUserMsg ? generatedTitle : undefined,
                updated_at: new Date().toISOString(),
              }).eq('id', persistentConvId);

              incrementUserUsage(user.id, 'question').catch(() => {});
            } catch (saveErr) {
              console.warn('[ChatPage] Supabase post-save notice:', saveErr);
            }
          }

          setConversations((prev) =>
            prev.map((c) =>
              c.id === persistentConvId || c.id === activeConvId
                ? {
                    ...c,
                    id: persistentConvId,
                    updatedAt: Date.now(),
                    messages: [...c.messages, aiMsg],
                  }
                : c
            )
          );
        } else {
          throw new Error("Noto'g'ri javob formati");
        }
      } catch (err: any) {
        console.warn('Backend failed:', err);
        setError(err.message || 'Xatolik yuz berdi. Qaytadan urinib koʻring.');
        const fallbackMsg: Message = {
          id: `err_${Date.now()}`,
          text: err.message || "Kechirasiz, tarmoqda vaqtinchalik uzilish ro'y berdi. Iltimos, bir ozdan so'ng qayta urinib ko'ring.",
          sender: 'ai',
          timestamp: Date.now(),
          isError: true,
          queryContext: text.trim(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === persistentConvId || c.id === activeConvId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: [...c.messages, fallbackMsg],
                }
              : c
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [activeConvId, activeConversation?.title, isLoggedIn, loading, messages, selectedLawGroup, user?.id]
  );

  const dailyLimit = user?.dailyLimit ?? 10;

  const handleAttemptSend = useCallback(
    (text: string) => {
      if (!isLoggedIn) {
        setShowAuthGateModal(true);
        return;
      }
      if (dailyLimit < 999999 && todayUsage >= dailyLimit) {
        setShowLimitExceededModal(true);
        return;
      }
      sendMessage(text);
    },
    [isLoggedIn, dailyLimit, todayUsage, sendMessage]
  );

  // Submit feedback on an AI message directly to Supabase public.feedback
  const handleFeedback = async (msgId: string, rating: 1 | -1) => {
    try {
      const numericRating = rating === 1 ? 5 : 1;
      if (isLoggedIn && user?.id) {
        await supabase.from('feedback').insert({
          user_id: user.id,
          conversation_id: UUID_REGEX.test(activeConvId) ? activeConvId : null,
          rating: numericRating,
          comment: `Chat foydalanuvchi bahosi: ${rating === 1 ? 'ijobiy' : 'salbiy'}`,
          status: 'new',
        });
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? { ...m, userFeedback: rating } : m
                ),
              }
            : c
        )
      );
    } catch (e) {
      console.error('[ChatPage] Error submitting feedback:', e);
    }
  };

  // Handle URL article query
  const handledArticleRef = useRef(false);
  useEffect(() => {
    if (articleParam && !handledArticleRef.current) {
      handledArticleRef.current = true;
      const promptText = `Iltimos, Oʻzbekiston Respublikasining ushbu normasi mazmunini oddiy tilda tushuntirib bering, uning amaliy qoʻllanishini koʻrsating va Lex.uz dagi rasmiy havolasini taqdim eting: ${articleParam}`;
      if (isLoggedIn) {
        sendMessage(promptText);
      } else {
        setShowAuthGateModal(true);
      }
    }
  }, [articleParam, isLoggedIn, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((e.nativeEvent as any)?.isComposing) return;
      if (!loading && input.trim()) {
        handleAttemptSend(input);
      }
    }
  };

  return (
    <div className="pt-16 h-screen flex overflow-hidden bg-gray-50 text-gray-900">
      {/* SIDEBAR: Conversation History (Desktop 280px, Mobile Overlay) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200/80 flex flex-col transition-transform duration-300 md:static md:translate-x-0 pt-16 md:pt-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ri-history-line text-teal-600 text-lg"></i>
            <span className="font-bold text-gray-900 text-sm">Suhbatlar tarixi</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <i className="ri-add-line text-base"></i>
            <span>Yangi suhbat</span>
          </button>
        </div>

        {/* Conversation List from Supabase */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-thin">
          {conversations.map((c) => {
            const isActive = c.id === activeConvId;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-200/90 font-semibold shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <i
                    className={`ri-chat-3-line text-sm flex-shrink-0 ${
                      isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  ></i>
                  <span className="truncate">{c.title || 'Yangi suhbat'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-opacity cursor-pointer flex-shrink-0"
                  title="Suhbatni oʻchirish"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            );
          })}
        </div>

        {/* Usage stats & Plan info */}
        {isLoggedIn && user && (
          <div className="p-3 border-t border-gray-100 bg-gray-50/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600 font-medium">Kunlik savollar:</span>
              <span className="font-bold text-teal-700">
                {todayUsage} / {dailyLimit >= 999999 ? 'Cheksiz' : dailyLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${dailyLimit >= 999999 ? 100 : Math.min(100, Math.round((todayUsage / Math.max(1, dailyLimit)) * 100))}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <Link to="/pricing" className="text-teal-700 hover:underline font-medium flex items-center gap-1">
            <i className="ri-vip-crown-line text-amber-500"></i>
            <span>Tarif: {user?.plan || 'Bepul'}</span>
          </Link>
          <Link to="/history" className="text-gray-500 hover:text-gray-700 text-[11px]">
            Toʻliq tarix →
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Chat Header Bar */}
        <header className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between gap-3 flex-shrink-0 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden cursor-pointer"
              title="Suhbatlar roʻyxati"
            >
              <i className="ri-menu-2-line text-xl"></i>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-[220px] sm:max-w-md">
                  {activeConversation.title}
                </h2>
                <span className="hidden sm:inline-block bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  AdvokatAI
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="truncate">
                  {backendStatus === 'connected'
                    ? `${aiMode} · Lex.uz integratsiyasi`
                    : 'Lokal qidiruv rejimi'}
                </span>
              </div>
            </div>
          </div>

          {/* Law Group Selector & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-600">
              <span className="font-medium text-gray-500">Qonun guruhi:</span>
              <select
                value={selectedLawGroup}
                onChange={(e) => {
                  setSelectedLawGroup(e.target.value);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === activeConvId ? { ...c, lawGroup: e.target.value } : c))
                  );
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer max-w-[220px]"
              >
                {LAW_GROUPS.map((lg) => (
                  <option key={lg.id} value={lg.id}>
                    {lg.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNewConversation}
              className="hidden sm:flex items-center gap-1 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer border border-teal-200"
            >
              <i className="ri-add-line"></i>
              <span>Yangi</span>
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 bg-gradient-to-b from-gray-50/40 via-white to-white scrollbar-thin"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3 max-w-4xl mx-auto`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <i className="ri-scales-3-line text-sm"></i>
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                      : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <FormattedMarkdown content={msg.text} isUser={msg.sender === 'user'} />
                </div>

                {/* Inline Retry Button for Network/Server Errors */}
                {msg.isError && msg.queryContext && (
                  <button
                    type="button"
                    onClick={() => handleAttemptSend(msg.queryContext!)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full transition-colors cursor-pointer w-fit mt-0.5 disabled:opacity-50"
                  >
                    <i className="ri-refresh-line"></i>
                    <span>Qayta urinish</span>
                  </button>
                )}

                {/* Primary Lex.uz Citation */}
                {msg.sourceArticle && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {msg.sourceUrl ? (
                      <a
                        href={msg.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-200 transition-colors shadow-2xs"
                        title="LEX.UZ rasmiy bazasida to'liq matnini o'qish"
                      >
                        <i className="ri-external-link-line text-teal-600"></i>
                        <span>{msg.sourceArticle}</span>
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {msg.sourceArticle}
                      </span>
                    )}

                    {msg.confidenceLevel && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          msg.confidenceLevel === 'HIGH'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : msg.confidenceLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Ishonchlilik: {msg.confidenceLevel === 'HIGH' ? 'Yuqori' : msg.confidenceLevel === 'MEDIUM' ? 'O‘rta' : 'Past'}
                        {msg.confidenceReason ? ` — ${msg.confidenceReason}` : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Feedback rating buttons for AI answers */}
                {msg.sender === 'ai' && !msg.isError && (
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, 1)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer text-xs ${
                        msg.userFeedback === 1 ? 'text-teal-600' : 'hover:text-teal-600'
                      }`}
                      title="Foydali javob"
                    >
                      <i className="ri-thumb-up-line"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, -1)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer text-xs ${
                        msg.userFeedback === -1 ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                      title="Javob qoniqarsiz"
                    >
                      <i className="ri-thumb-down-line"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing State Indicator */}
          {loading && (
            <div className="flex items-start gap-3 max-w-4xl mx-auto animate-pulse">
              <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-scales-3-line text-sm"></i>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="font-medium text-teal-900 ml-1">
                  AdvokatAI O‘zbekiston qonunchiligini tahlil qilmoqda...
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="max-w-4xl mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <i className="ri-error-warning-line text-base flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Topics for empty conversations */}
          {messages.length === 1 && (
            <div className="max-w-4xl mx-auto pt-6">
              <p className="text-xs font-semibold text-gray-500 mb-3 text-center">
                Tez-tez beriladigan yuridik savollar:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleAttemptSend(topic)}
                    className="p-3 bg-white hover:bg-teal-50/70 border border-gray-200/80 hover:border-teal-300 rounded-xl text-left text-xs text-gray-700 hover:text-teal-900 font-medium transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <i className="ri-chat-check-line text-teal-600 text-sm flex-shrink-0"></i>
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar Area */}
        <div className="p-4 sm:p-5 border-t border-gray-200/80 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-300/80 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent focus-within:bg-white transition-all shadow-2xs">
              <textarea
                ref={textareaRef}
                value={input}
                maxLength={4000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Huquqiy savolingizni yozing (masalan: Ish beruvchi ish haqini o'z vaqtida to'lamasa nima qilish kerak?)..."
                className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none max-h-32 min-h-[40px] leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleAttemptSend(input)}
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Yuborish (Enter)"
              >
                <i className="ri-send-plane-2-fill text-base"></i>
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-400">
              <span className="truncate">
                AdvokatAI sunʼiy intellekt yordamchisidir. Javoblar Lex.uz qonunchiligiga asoslanadi.
              </span>
              <span className="hidden sm:inline-block ml-2 text-gray-400 flex-shrink-0">
                Enter — yuborish · Shift+Enter — yangi qator
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* AUTH GATE MODAL */}
      {showAuthGateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-xs">
              <i className="ri-lock-line text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tizimga kirish talab qilinadi</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              AI huquqiy maslahat olish va suhbatlaringiz tarixini xavfsiz saqlash uchun iltimos, hisobingizga kiring yoki bepul roʻyxatdan oʻting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer order-2 sm:order-1"
              >
                Bekor qilish
              </button>
              <Link
                to="/login"
                state={{ from: { pathname: '/chat' } }}
                className="w-full py-3 px-4 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-2"
              >
                <i className="ri-login-box-line"></i>
                <span>Kirish</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* LIMIT EXCEEDED MODAL */}
      {showLimitExceededModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
              <i className="ri-alarm-warning-line text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kunlik savollar limitingiz tugadi</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Bugungi rejangiz bo'yicha belgilangan savollar limitingiz ({dailyLimit} ta) to'ldi. Ko'proq savollar berish va cheksiz imkoniyatlardan foydalanish uchun rejangizni yangilang:
              <br /><strong className="text-teal-700">Pro:</strong> kuniga 100 ta savol · <strong className="text-teal-700">Premium:</strong> cheksiz savollar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowLimitExceededModal(false)}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer order-2 sm:order-1"
              >
                Yopish
              </button>
              <Link
                to="/pricing"
                className="w-full py-3 px-4 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-2"
              >
                <i className="ri-vip-crown-line text-amber-300"></i>
                <span>Tariflarni ko'rish</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
