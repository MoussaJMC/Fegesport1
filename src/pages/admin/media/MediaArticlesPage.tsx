import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Newspaper, Loader2, ExternalLink, Copy, Share2 } from 'lucide-react';
import { listGeneratedArticles, listSocialPosts } from '../../../lib/mediaCenterService';
import type { GeneratedArticle, SocialPost } from '../../../types/mediaCenter';
import { TARGET_LABELS } from '../../../types/mediaCenter';

const MediaArticlesPage = () => {
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [allArticles, allPosts] = await Promise.all([
          listGeneratedArticles({ status: 'published' }),
          listSocialPosts(),
        ]);
        setArticles(allArticles);
        setPosts(allPosts.filter((p) => p.status === 'ready' || p.status === 'approved'));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyPost = (post: SocialPost) => {
    navigator.clipboard.writeText(`${post.content}\n\n${(post.hashtags ?? []).join(' ')}`);
    toast.success(`Texte ${TARGET_LABELS[post.platform]} copié — collez-le sur la plateforme.`);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-fed-red-500" /> Articles publiés
        </h1>
        <p className="text-light-400 mt-0.5 text-sm">Articles en ligne sur le site et publications sociales prêtes à poster.</p>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-dark-700">
          <h2 className="font-bold text-white font-heading text-sm">Sur le site ({articles.length})</h2>
        </div>
        {articles.length === 0 ? (
          <p className="p-8 text-center text-light-400 text-sm">Aucun article publié pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-dark-700">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{article.title}</p>
                  <p className="text-light-400 text-xs mt-0.5">
                    {TARGET_LABELS[article.content_type]} · publié le {article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR') : '—'}
                    {article.word_count ? ` · ${article.word_count} mots` : ''}
                  </p>
                </div>
                {article.published_news_id && (
                  <a href={`/news/${article.published_news_id}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center text-xs text-fed-gold-500 hover:text-fed-gold-400 ml-4 shrink-0">
                    Voir <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-dark-700 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-accent-blue-400" />
          <h2 className="font-bold text-white font-heading text-sm">Réseaux sociaux — prêts à publier ({posts.length})</h2>
        </div>
        {posts.length === 0 ? (
          <p className="p-8 text-center text-light-400 text-sm">
            Aucun post approuvé. Validez des contenus dans <Link to="/admin/media/drafts" className="text-fed-red-500 hover:underline">Brouillons</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-dark-700">
            {posts.map((post) => (
              <li key={post.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-accent-blue-400 uppercase">{TARGET_LABELS[post.platform]}</span>
                  <button onClick={() => copyPost(post)} className="inline-flex items-center text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white">
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copier le texte
                  </button>
                </div>
                <p className="text-light-200 text-sm whitespace-pre-wrap">{post.content}</p>
                {(post.hashtags ?? []).length > 0 && (
                  <p className="text-accent-blue-400 text-xs mt-1.5">{post.hashtags.join(' ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MediaArticlesPage;
