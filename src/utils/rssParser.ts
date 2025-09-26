// src/pages/utils/rssParser.ts

import { BlogPost, RSSArticle } from "@/types/blog";


export class RSSParser {
  private static readonly CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://api.cors.lol/?url='
  ];

  /**
   * Fetch feed using optional CORS proxies and parse to BlogPost[]
   */
  static async fetchAndParseFeed(url: string, sourceName: string, category: string, timeoutMs = 10000): Promise<BlogPost[]> {
    try {
      for (let i = 0; i < this.CORS_PROXIES.length; i++) {
        const proxyUrl = `${this.CORS_PROXIES[i]}${encodeURIComponent(url)}`;
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeoutMs);
          const response = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(id);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          // many proxies (like allorigins) return JSON with contents field
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await response.json();
            const content = (json.contents || json.response || json.body || json.data) as string;
            if (content) return this.parseXMLContent(content, sourceName, category, url);
          } else {
            const text = await response.text();
            return this.parseXMLContent(text, sourceName, category, url);
          }
        } catch (proxyError) {
          // continue to next proxy
          // eslint-disable-next-line no-console
          console.warn(`Proxy ${i + 1} failed:`, proxyError);
          if (i === this.CORS_PROXIES.length - 1) throw proxyError;
        }
      }

      throw new Error('All CORS proxies failed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`RSS fetch failed for ${sourceName}:`, error);
      return this.generateSampleRSSPosts(sourceName, category);
    }
  }

  static parseXMLContent(xmlContent: string, sourceName: string, category: string, originalUrl: string): BlogPost[] {
    try {
      // prefer DOMParser if available (browser)
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
        const parseError = xmlDoc.querySelector('parsererror');
        if (!parseError) {
          const items = Array.from(xmlDoc.querySelectorAll('item, entry'));
          const posts: BlogPost[] = [];
          for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];
            const article = this.extractArticleData(item, xmlDoc);
            if (article.title && article.content) {
              posts.push(this.convertToBlogPost(article, sourceName, category, originalUrl));
            }
          }
          return posts;
        }
        // fall-through to fallback parsing if parseError
      }

      // fallback simple parse (best-effort)
      return this._fallbackParse(xmlContent).map(a => this.convertToBlogPost(a, sourceName, category, originalUrl));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing XML:', error);
      return this.generateSampleRSSPosts(sourceName, category);
    }
  }

  private static extractArticleData(item: Element, _xmlDoc: Document): RSSArticle {
    const title = this.getElementText(item, ['title']);
    const description = this.getElementText(item, ['description', 'summary', 'content', 'content:encoded']);
    const link = this.getElementText(item, ['link']) || this.getElementText(item, ['guid']);
    const pubDate = this.getElementText(item, ['pubDate', 'published', 'updated']);
    const author = this.getElementText(item, ['author', 'dc:creator']);

    const imageUrl = this.extractImageUrl(item, description);

    return {
      title: this.cleanText(title),
      content: this.formatContent(description),
      excerpt: this.generateExcerpt(description),
      link: link,
      pubDate: this.parseDate(pubDate),
      author: author || undefined,
      imageUrl: imageUrl || undefined,
      tags: this.extractTags((title || '') + ' ' + (description || ''))
    };
  }

  private static getElementText(parent: Element, selectors: string[]): string {
    for (const selector of selectors) {
      // try direct tag and also namespaced variants
      let element = parent.querySelector(selector);
      if (!element) {
        // try common namespaced forms
        element = parent.querySelector(selector.replace(':', '\\:'));
      }
      if (element?.textContent) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  private static extractImageUrl(item: Element, content: string): string | null {
    // media:content or enclosure[type="image"]
    const media = item.querySelector('media\\:content, enclosure[type^="image"], enclosure[url]');
    if (media) {
      return media.getAttribute('url') || media.getAttribute('href') || media.getAttribute('src') || null;
    }

    // Extract from content HTML — fixed regex for quotes
    const imgMatch = content && content.match(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/i);
    if (imgMatch) {
      return imgMatch[1];
    }

    // fallback image
    return 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg';
  }

  private static cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static formatContent(content: string): string {
    const cleaned = this.cleanText(content);
    if (!cleaned) return '';

    let formatted = cleaned.replace(/\. ([A-Z])/g, '.\n\n$1');
    formatted = formatted.replace(/(\d+\.\s)/g, '\n$1');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted += '\n\n---\n\n*This article was automatically imported from RSS feed and formatted for better readability.*';
    return formatted.trim();
  }

  private static generateExcerpt(content: string, maxLength = 160): string {
    const cleaned = this.cleanText(content);
    if (cleaned.length <= maxLength) return cleaned;
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastSentence = truncated.lastIndexOf('.');
    const cutPoint = lastSentence > lastSpace - 20 ? lastSentence + 1 : lastSpace;
    return (cutPoint > 0 ? truncated.substring(0, cutPoint).trim() : truncated.trim()) + '...';
  }

  private static extractTags(content: string): string[] {
    const realEstateKeywords = [
      'property', 'real estate', 'housing', 'apartment', 'villa', 'flat',
      'investment', 'market', 'price', 'sale', 'rent', 'rera', 'loan',
      'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai',
      'bandra', 'andheri', 'juhu', 'worli', 'powai'
    ];

    const text = (content || '').toLowerCase();
    const foundTags = realEstateKeywords.filter(k => text.includes(k));

    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    const freq: Record<string, number> = {};
    for (const w of words) {
      if (!this.isStopWord(w)) freq[w] = (freq[w] || 0) + 1;
    }
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
    return Array.from(new Set([...foundTags, ...topWords])).slice(0, 8);
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'they', 'them', 'their', 'there', 'where', 'when', 'why',
      'how', 'what', 'which', 'who', 'whom', 'whose', 'will', 'would',
      'could', 'should', 'might', 'must', 'shall', 'can', 'may', 'does',
      'did', 'has', 'have', 'had', 'been', 'being', 'are', 'was', 'were'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  private static parseDate(dateString: string): string {
    if (!dateString) return new Date().toISOString();
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }

  private static convertToBlogPost(article: RSSArticle, sourceName: string, category: string, originalUrl: string): BlogPost {
    const now = new Date().toISOString();
    return {
      id: `RSS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: article.title,
      slug: this.generateSlug(article.title),
      content: article.content,
      excerpt: article.excerpt,
      author: article.author || sourceName,
      category: category,
      tags: article.tags,
      status: 'draft',
      featured: false,
      featuredImage: article.imageUrl || 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
      publishedAt: '',
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0,
      comments: 0,
      seoTitle: this.generateSEOTitle(article.title, category),
      seoDescription: this.generateSEODescription(article.excerpt, category),
      readTime: Math.max(1, Math.ceil((article.content?.length ?? 0) / 200)),
      source: 'rss',
      rssSource: sourceName,
      originalUrl: article.link
    };
  }

  private static generateSlug(title: string): string {
    return (title || 'untitled').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  private static generateSEOTitle(title: string, category: string): string {
    const baseSEO = `${title} | ${category} News | ResaleExpert`;
    return baseSEO.length <= 60 ? baseSEO : `${title} | ResaleExpert`;
  }

  private static generateSEODescription(excerpt: string, category: string): string {
    const baseDesc = `${excerpt} Read latest ${category.toLowerCase()} news and insights on ResaleExpert.`;
    return baseDesc.length <= 160 ? baseDesc : (excerpt || '').substring(0, 157) + '...';
  }

  static generateSampleRSSPosts(sourceName: string, category: string): BlogPost[] {
    const sampleArticles = [
      {
        title: `${category} Market Update - ${new Date().toLocaleDateString()}`,
        content: `The ${category.toLowerCase()} market continues to evolve with new trends and opportunities emerging for both buyers and sellers.\n\nKey highlights include:\n\n• Market stability in premium locations\n• Increased demand for ready-to-move properties\n• New infrastructure projects boosting connectivity\n• Favorable interest rates encouraging investments\n\nExperts suggest that current market conditions present excellent opportunities for informed buyers and investors.`,
        excerpt: `Latest ${category.toLowerCase()} market analysis with key trends and investment opportunities.`,
        tags: [category.toLowerCase(), 'market update', 'investment', 'real estate'],
        link: 'https://example.com/market-update',
        pubDate: new Date().toISOString(),
        author: sourceName
      }
    ];

    return sampleArticles.map(article => this.convertToBlogPost(article as RSSArticle, sourceName, category, 'https://example.com'));
  }

  // Fallback raw parser for non-DOM environments
  private static _fallbackParse(text: string): RSSArticle[] {
    try {
      const items: RSSArticle[] = [];
      const splits = text.split(/<item\b|<entry\b/i).slice(1);
      for (const chunk of splits) {
        const getTag = (tag: string) => {
          const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
          const m = chunk.match(re);
          return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
        };
        const title = getTag('title');
        const link = (chunk.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || chunk.match(/href=["']([^"']+)["']/i)?.[1]) || '';
        const content = getTag('content:encoded') || getTag('content') || getTag('description') || '';
        const excerpt = getTag('description') || '';
        const pubDate = getTag('pubDate') || getTag('published') || getTag('updated') || '';
        const author = getTag('author') || '';
        const tagsRaw = (chunk.match(/<category[^>]*>([\s\S]*?)<\/category>/ig) || []).map(s => s.replace(/<\/?category[^>]*>/ig, '').trim());
        const tags = tagsRaw.filter(Boolean);
        const image = (chunk.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] || '') || '';

        items.push({
          title,
          content,
          excerpt,
          link,
          pubDate,
          tags,
          author,
          category: tags[0] ?? undefined,
          imageUrl: image ?? undefined
        } as RSSArticle);
      }
      return items;
    } catch {
      return [];
    }
  }
}

export default RSSParser;
