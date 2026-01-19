/**
 * Ultra Advisor - 部落格頁面
 * SEO 優化的內容行銷頁面
 *
 * 檔案位置：src/pages/BlogPage.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, Clock, ChevronRight, Search, Tag, User,
  TrendingUp, BookOpen, Calculator, Home, Landmark, PiggyBank,
  Share2, ArrowUp, MessageSquare
} from 'lucide-react';
import {
  blogArticles,
  getArticleBySlug,
  getFeaturedArticles,
  BlogArticle
} from '../data/blogArticles';

interface BlogPageProps {
  onBack: () => void;
  onLogin: () => void;
}

// 分類定義
const categories = [
  { id: 'all', name: '全部文章', icon: BookOpen },
  { id: 'mortgage', name: '房貸知識', icon: Home },
  { id: 'retirement', name: '退休規劃', icon: PiggyBank },
  { id: 'tax', name: '稅務傳承', icon: Landmark },
  { id: 'investment', name: '投資理財', icon: TrendingUp },
  { id: 'tools', name: '工具教學', icon: Calculator },
];

const BlogPage: React.FC<BlogPageProps> = ({ onBack, onLogin }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState<BlogArticle | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 處理 URL 中的文章 slug
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/blog\/(.+)$/);
    if (match) {
      const slug = match[1];
      const article = getArticleBySlug(slug);
      if (article) {
        setCurrentArticle(article);
      }
    }
  }, []);

  // 監聽滾動顯示回到頂部按鈕
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO: 動態更新頁面 Meta 和 Article Schema
  useEffect(() => {
    if (currentArticle) {
      // 文章詳情頁 SEO
      document.title = currentArticle.metaTitle;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', currentArticle.metaDescription);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogTitle) ogTitle.setAttribute('content', currentArticle.metaTitle);
      if (ogDescription) ogDescription.setAttribute('content', currentArticle.metaDescription);
      if (ogUrl) ogUrl.setAttribute('content', `https://ultra-advisor.tw/blog/${currentArticle.slug}`);
      if (ogType) ogType.setAttribute('content', 'article');

      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', `https://ultra-advisor.tw/blog/${currentArticle.slug}`);

      // 注入 Article Schema JSON-LD（SEO 結構化資料）
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": currentArticle.title,
        "description": currentArticle.metaDescription,
        "author": {
          "@type": "Organization",
          "name": currentArticle.author,
          "url": "https://ultra-advisor.tw"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Ultra Advisor",
          "logo": {
            "@type": "ImageObject",
            "url": "https://ultra-advisor.tw/logo.png"
          }
        },
        "datePublished": currentArticle.publishDate,
        "dateModified": currentArticle.publishDate,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://ultra-advisor.tw/blog/${currentArticle.slug}`
        },
        "image": "https://ultra-advisor.tw/og-image.png",
        "keywords": currentArticle.tags.join(', '),
        "articleSection": getCategoryInfo(currentArticle.category).name,
        "wordCount": Math.round(currentArticle.readTime * 200) // 估算字數
      };

      // 移除舊的 article schema（如果存在）
      const existingSchema = document.getElementById('article-schema');
      if (existingSchema) existingSchema.remove();

      // 注入新的 schema
      const script = document.createElement('script');
      script.id = 'article-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(articleSchema);
      document.head.appendChild(script);

      // 注入 BreadcrumbList Schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "首頁",
            "item": "https://ultra-advisor.tw/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "知識庫",
            "item": "https://ultra-advisor.tw/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": currentArticle.title,
            "item": `https://ultra-advisor.tw/blog/${currentArticle.slug}`
          }
        ]
      };

      const existingBreadcrumb = document.getElementById('article-breadcrumb-schema');
      if (existingBreadcrumb) existingBreadcrumb.remove();

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = 'article-breadcrumb-schema';
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    } else {
      // 文章列表頁 SEO
      const seoConfig = {
        title: '理財知識庫 | 房貸、退休、稅務專業文章 - Ultra Advisor',
        description: '免費學習房貸計算、退休規劃、稅務傳承知識。專業財務顧問撰寫，淺顯易懂的理財文章，幫助您做出更好的財務決策。',
        url: 'https://ultra-advisor.tw/blog'
      };

      document.title = seoConfig.title;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', seoConfig.description);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogTitle) ogTitle.setAttribute('content', seoConfig.title);
      if (ogDescription) ogDescription.setAttribute('content', seoConfig.description);
      if (ogUrl) ogUrl.setAttribute('content', seoConfig.url);

      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', seoConfig.url);
    }

    return () => {
      document.title = 'Ultra Advisor - 台灣最強財務顧問提案工具 | 18種專業數據視覺化';
      // 清理動態注入的 schema
      const articleSchema = document.getElementById('article-schema');
      const breadcrumbSchema = document.getElementById('article-breadcrumb-schema');
      if (articleSchema) articleSchema.remove();
      if (breadcrumbSchema) breadcrumbSchema.remove();
    };
  }, [currentArticle]);

  // 過濾文章
  const filteredPosts = blogArticles.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = getFeaturedArticles();

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 打開文章
  const openArticle = (article: BlogArticle) => {
    setCurrentArticle(article);
    window.history.pushState({}, '', `/blog/${article.slug}`);
    window.scrollTo(0, 0);
  };

  // 返回列表
  const backToList = () => {
    setCurrentArticle(null);
    window.history.pushState({}, '', '/blog');
    window.scrollTo(0, 0);
  };

  // 分享功能
  const shareArticle = () => {
    if (navigator.share && currentArticle) {
      navigator.share({
        title: currentArticle.title,
        text: currentArticle.excerpt,
        url: window.location.href
      });
    } else {
      // 複製連結
      navigator.clipboard.writeText(window.location.href);
      alert('已複製連結到剪貼簿！');
    }
  };

  // 回到頂部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 計算文章相關度分數（根據標籤和分類）
  const getRelatedScore = (article: BlogArticle, current: BlogArticle): number => {
    if (article.id === current.id) return -1;
    let score = 0;
    // 同分類 +3 分
    if (article.category === current.category) score += 3;
    // 每個共同標籤 +2 分
    const commonTags = article.tags.filter(tag => current.tags.includes(tag));
    score += commonTags.length * 2;
    // 精選文章 +1 分
    if (article.featured) score += 1;
    return score;
  };

  // ========================================
  // 文章詳情頁
  // ========================================
  if (currentArticle) {
    const categoryInfo = getCategoryInfo(currentArticle.category);
    const CategoryIcon = categoryInfo.icon;

    // 相關文章（根據相關度排序，取前 3 篇）
    const relatedArticles = blogArticles
      .map(a => ({ article: a, score: getRelatedScore(a, currentArticle) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.article);

    return (
      <div className="min-h-screen bg-slate-950">
        {/* 頂部導航 */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={backToList}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm">返回文章列表</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={shareArticle}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="分享文章"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={onLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
                >
                  免費試用
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 文章內容 */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* 文章標題區 */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400">
                <CategoryIcon size={14} />
                {categoryInfo.name}
              </span>
              {currentArticle.featured && (
                <span className="text-sm text-amber-500 font-bold">精選文章</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {currentArticle.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <User size={16} />
                {currentArticle.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {formatDate(currentArticle.publishDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                閱讀時間 {currentArticle.readTime} 分鐘
              </span>
            </div>

            {/* 標籤 */}
            <div className="flex flex-wrap gap-2 mt-6">
              {currentArticle.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* 文章摘要 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-12">
            <p className="text-slate-300 text-lg leading-relaxed">
              {currentArticle.excerpt}
            </p>
          </div>

          {/* 文章內容 */}
          <div
            className="article-content prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: currentArticle.content }}
          />

          {/* 文章內容樣式覆蓋 */}
          <style>{`
            .article-content,
            .article-content article,
            .article-content .prose {
              color: #cbd5e1 !important; /* slate-300 */
            }
            .article-content h1,
            .article-content h2,
            .article-content h3,
            .article-content h4,
            .article-content h5,
            .article-content h6 {
              color: #ffffff !important;
              font-weight: 700;
            }
            .article-content h2 {
              font-size: 1.5rem;
              margin-top: 3rem;
              margin-bottom: 1.5rem;
              padding-bottom: 0.75rem;
              border-bottom: 1px solid #334155;
            }
            .article-content h3 {
              font-size: 1.25rem;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }
            .article-content p {
              color: #cbd5e1 !important; /* slate-300 */
              line-height: 1.75;
              margin-bottom: 1rem;
            }
            .article-content li {
              color: #cbd5e1 !important; /* slate-300 */
            }
            .article-content strong {
              color: #ffffff !important;
            }
            .article-content a {
              color: #60a5fa !important; /* blue-400 */
            }
            .article-content a:hover {
              text-decoration: underline;
            }
            .article-content table {
              border-collapse: collapse;
              width: 100%;
            }
            .article-content th {
              background-color: #1e293b;
              padding: 0.75rem;
              border: 1px solid #475569;
              color: #ffffff !important;
            }
            .article-content td {
              padding: 0.75rem;
              border: 1px solid #475569;
              color: #cbd5e1 !important;
            }
            .article-content ul,
            .article-content ol {
              padding-left: 1.5rem;
            }
            .article-content ul li {
              list-style-type: disc;
            }
            .article-content ol li {
              list-style-type: decimal;
            }
          `}</style>

          {/* CTA 區塊 */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mt-16">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              想要更專業的理財工具？
            </h3>
            <p className="text-slate-300 text-center mb-6">
              Ultra Advisor 提供 18 種專業財務工具<br />
              免費試用 7 天，無需信用卡
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/calculator');
                  window.location.reload();
                }}
                className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all"
              >
                免費房貸計算機
              </button>
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all border border-blue-500"
              >
                免費試用 7 天
              </button>
            </div>
          </div>

          {/* 相關文章 */}
          {relatedArticles.length > 0 && (
            <section className="mt-16">
              <h3 className="text-xl font-bold text-white mb-6">相關文章</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedArticles.map(article => {
                  const catInfo = getCategoryInfo(article.category);
                  const CatIcon = catInfo.icon;
                  return (
                    <button
                      key={article.id}
                      onClick={() => openArticle(article)}
                      className="text-left bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          <CatIcon size={10} />
                          {catInfo.name}
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-slate-500 text-xs line-clamp-2">
                        {article.excerpt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 延伸閱讀：其他分類的熱門文章 */}
          {(() => {
            const otherCategoryArticles = blogArticles
              .filter(a => a.category !== currentArticle.category && a.id !== currentArticle.id)
              .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
              .slice(0, 3);

            if (otherCategoryArticles.length === 0) return null;

            return (
              <section className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6">延伸閱讀</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {otherCategoryArticles.map(article => {
                    const catInfo = getCategoryInfo(article.category);
                    const CatIcon = catInfo.icon;
                    return (
                      <button
                        key={article.id}
                        onClick={() => openArticle(article)}
                        className="text-left bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all group"
                      >
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                            <CatIcon size={10} />
                            {catInfo.name}
                          </span>
                          {article.featured && (
                            <span className="text-xs text-amber-500">精選</span>
                          )}
                        </div>
                        <h4 className="text-white font-bold text-sm mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2">
                          {article.excerpt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
            <p>&copy; 2026 Ultra Advisor. All rights reserved.</p>
            <div className="mt-4 flex justify-center gap-4">
              <button onClick={backToList} className="hover:text-white transition-colors">
                返回知識庫
              </button>
              <a href="https://line.me/R/ti/p/@ultraadvisor" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1 hover:text-white transition-colors">
                <MessageSquare size={14} />
                LINE 客服
              </a>
            </div>
          </div>
        </footer>

        {/* 回到頂部按鈕 */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg
                       hover:bg-blue-700 transition-all flex items-center justify-center"
            aria-label="回到頂部"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>
    );
  }

  // ========================================
  // 文章列表頁
  // ========================================
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">返回首頁</span>
            </button>

            <h1 className="text-xl font-bold text-white">理財知識庫</h1>

            <button
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
            >
              免費試用
            </button>
          </div>
        </div>
      </header>

      {/* Hero 區域 */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            專業理財知識，免費學習
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            房貸計算、退休規劃、稅務傳承...一站式理財知識庫
          </p>

          {/* 搜尋框 */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="搜尋文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* 分類標籤 */}
      <section className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 精選文章（僅首頁顯示） */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={24} />
              精選文章
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map(post => {
                const categoryInfo = getCategoryInfo(post.category);
                const CategoryIcon = categoryInfo.icon;
                return (
                  <article
                    key={post.id}
                    onClick={() => openArticle(post)}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        <CategoryIcon size={12} />
                        {categoryInfo.name}
                      </span>
                      <span className="text-xs text-amber-500 font-bold">精選</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(post.publishDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readTime} 分鐘
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 文章列表 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">
            {selectedCategory === 'all' ? '所有文章' : getCategoryInfo(selectedCategory).name}
            <span className="text-slate-500 font-normal text-base ml-2">
              ({filteredPosts.length} 篇)
            </span>
          </h3>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-500">找不到符合條件的文章</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const categoryInfo = getCategoryInfo(post.category);
                const CategoryIcon = categoryInfo.icon;
                return (
                  <article
                    key={post.id}
                    onClick={() => openArticle(post)}
                    className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                            <CategoryIcon size={12} />
                            {categoryInfo.name}
                          </span>
                          {post.featured && (
                            <span className="text-xs text-amber-500 font-bold">精選</span>
                          )}
                        </div>
                        <h4 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-slate-500 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(post.publishDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readTime} 分鐘
                        </span>
                      </div>
                    </div>
                    {/* 標籤 */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 text-slate-500"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA 區域 */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            用專業工具實踐理財知識
          </h3>
          <p className="text-slate-300 mb-6">
            Ultra Advisor 提供 18 種專業財務工具<br />
            將理財知識轉化為實際行動方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/calculator');
                window.location.reload();
              }}
              className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all"
            >
              免費房貸計算機
            </button>
            <button
              onClick={onLogin}
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all border border-blue-500"
            >
              免費試用 7 天
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2026 Ultra Advisor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
