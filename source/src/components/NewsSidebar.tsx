import { useState, useEffect } from "react";
import { Newspaper, Loader2 } from "lucide-react";
import { useTags } from "@/context/TagContext";
import { fetchNews, getPersonalizedNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { getTagNode } from "@/lib/tagEngine";
import { useTranslation } from 'react-i18next';

export default function NewsSidebar() {
  const { t } = useTranslation();
  const { selectedTags } = useTags();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNews()
      .then((all) => {
        if (cancelled) return;
        const personalized = selectedTags.length > 0
          ? getPersonalizedNews(all, selectedTags)
          : all.slice(0, 10);
        setNews(personalized);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedTags]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600">
          <Newspaper className="w-5 h-5" />
          <h2 className="font-bold text-gray-900">{t('news.latest_news')}</h2>
        </div>
        {selectedTags.length > 0 && (
          <span className="text-[11px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
            {t('news.personalized')}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-blue-400" />
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-xs">
            <Newspaper size={24} className="mx-auto mb-2 opacity-40" />
            {t('news.no_news_found')}
          </div>
        )}

        {!loading && news.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full text-left flex gap-3 items-start hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 block"
          >
            <div className="relative flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                  {item.sourceEmoji}
                </div>
              )}
              <span className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-[8px] font-bold px-1.5 py-0.5 rounded text-blue-600 uppercase tracking-wider border border-blue-100">
                {item.source.split(" ")[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              {item.matchedTags.length > 0 && selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {item.matchedTags
                    .filter((tag) => selectedTags.some((st) => st.toLowerCase() === tag.toLowerCase()))
                    .slice(0, 2)
                    .map((tag) => {
                      const node = getTagNode(tag);
                      return (
                        <span key={tag} className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          {node?.emoji && <span>{node.emoji}</span>}
                          {node?.label || tag}
                        </span>
                      );
                    })}
                </div>
              )}
              <p className="text-xs text-gray-400 font-medium">{formatNewsTime(item.pubDate)}</p>
            </div>
          </a>
        ))}

        {/* Pro/Sponsored Slot */}
        <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{t('news.ad_label')}</span>
            <h4 className="text-xs font-bold text-gray-900 mt-1 mb-2">{t('news.upgrade_to_pro')}</h4>
            <button className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              {t('news.read_more')}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
