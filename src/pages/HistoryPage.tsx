import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserConversations, supabase } from '../utils/supabase';
import type { Conversation } from '../utils/supabase';

interface HistoryItem {
  id: string;
  preview: string;
  messageCount: number;
  date: string;
  context?: string;
}

export default function HistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const convs = await getUserConversations(user.id);
        if (convs && convs.length > 0) {
          // Fetch message counts for each conversation
          const items: HistoryItem[] = await Promise.all(
            convs.map(async (c: Conversation) => {
              const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', c.id);

              return {
                id: c.id,
                preview: c.title || 'Yangi suhbat',
                messageCount: count || 0,
                date: c.created_at,
              };
            })
          );
          setHistory(items);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('[HistoryPage] Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user?.id, isLoggedIn]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    try {
      // Delete messages first, then conversation
      await supabase.from('messages').delete().eq('conversation_id', id).eq('user_id', user.id);
      await supabase.from('conversations').delete().eq('id', id).eq('user_id', user.id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('[HistoryPage] Error deleting conversation:', err);
    }
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    const confirm = window.confirm("Barcha suhbatlar tarixini o'chirmoqchimisiz?");
    if (!confirm) return;

    try {
      await supabase.from('messages').delete().eq('user_id', user.id);
      await supabase.from('conversations').delete().eq('user_id', user.id);
      setHistory([]);
    } catch (err) {
      console.error('[HistoryPage] Error clearing conversations:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/40">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Tarix</span>
          <h1 className="text-5xl font-bold text-gray-900 mt-3 mb-4">Eski Qidiruvlar</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Oldingi huquqiy suhbatlaringiz va qidiruvlaringiz
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tarix bo'sh</h3>
              <p className="text-gray-500 mb-6">Hali hech qanday suhbat amalga oshirilmagan</p>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                <i className="ri-chat-3-line mr-2"></i>Yangi suhbat boshlash
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">{history.length} ta suhbat</h2>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line"></i>
                  Barchasini o'chirish
                </button>
              </div>

              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className="ri-chat-3-line text-teal-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.preview}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">
                              <i className="ri-message-3-line mr-1"></i>
                              {item.messageCount} ta xabar
                            </span>
                            <span className="text-xs text-gray-400">
                              <i className="ri-calendar-line mr-1"></i>
                              {new Date(item.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/chat?convId=${item.id}`}
                          className="text-xs text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          <i className="ri-arrow-right-line"></i>
                          Davom ettirish
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <i className="ri-delete-bin-line text-base"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <i className="ri-chat-3-line mr-2"></i>Yangi suhbat boshlash
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
