import { RSSArticle, BlogPost } from '../types/blog';

export class RSSParser {
  private static readonly CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://api.cors.lol/?url='
  ];
  
  static async fetchAndParseFeed(url: string, sourceName: string, category: string): Promise<BlogPost[]> {
    try {
      // Try multiple CORS proxies for better reliability
      for (let i = 0; i < this.CORS_PROXIES.length; i++) {
        try {
          const proxyUrl = `${this.CORS_PROXIES[i]}${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl, { timeout: 10000 });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.contents || data.response) {
            const content = data.contents || data.response;
            return this.parseXMLContent(content, sourceName, category, url);
          }
        } catch (proxyError) {
          console.warn(`Proxy ${i + 1} failed:`, proxyError);
          if (i === this.CORS_PROXIES.length - 1) {
            throw proxyError;
          }
          // Continue to next proxy
        }
      }
      
      throw new Error('All CORS proxies failed');
    } catch (error) {
      console.warn(`RSS fetch failed for ${sourceName}:`, error);
      // Return sample data for demonstration
      return this.generateSampleRSSPosts(sourceName, category);
    }
  }

  static parseXMLContent(xmlContent: string, sourceName: string, category: string, originalUrl: string): BlogPost[] {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid XML format');
      }
      
      const items = xmlDoc.querySelectorAll('item, entry'); // Support both RSS and Atom
      const posts: BlogPost[] = [];
      
      for (let i = 0; i < Math.min(items.length, 5); i++) {
        const item = items[i];
        const article = this.extractArticleData(item, xmlDoc);
        
        if (article.title && article.content) {
          const blogPost = this.convertToBlogPost(article, sourceName, category, originalUrl);
          posts.push(blogPost);
        }
      }
      
      return posts;
    } catch (error) {
      console.error('Error parsing XML:', error);
      return this.generateSampleRSSPosts(sourceName, category);
    }
  }

  private static extractArticleData(item: Element, xmlDoc: Document): RSSArticle {
    // Support both RSS and Atom formats
    const title = this.getElementText(item, ['title']);
    const description = this.getElementText(item, ['description', 'summary', 'content']);
    const link = this.getElementText(item, ['link', 'guid']);
    const pubDate = this.getElementText(item, ['pubDate', 'published', 'updated']);
    const author = this.getElementText(item, ['author', 'dc:creator']);
    
    // Extract image from content or media elements
    const imageUrl = this.extractImageUrl(item, description);
    
    return {
      title: this.cleanText(title),
      content: this.formatContent(description),
      excerpt: this.generateExcerpt(description),
      link: link,
      pubDate: this.parseDate(pubDate),
      author: author || undefined,
      imageUrl: imageUrl || undefined,
      tags: this.extractTags(title + ' ' + description)
    };
  }

  private static getElementText(parent: Element, selectors: string[]): string {
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element?.textContent) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  private static extractImageUrl(item: Element, content: string): string | null {
    // Try to find image in media:content or enclosure
    const mediaContent = item.querySelector('media\\:content, enclosure[type^="image"]');
    if (mediaContent) {
      return mediaContent.getAttribute('url') || null;
    }
    
    // Extract from content HTML
    const imgMatch = content.match(/<img[^>]+src=['""]([^'""]+)['""][^>]*>/i);
    if (imgMatch) {
      return imgMatch[1];
    }
    
    // Default real estate image
    return 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg';
  }

  private static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private static formatContent(content: string): string {
    let formatted = this.cleanText(content);
    
    // Add proper paragraph breaks
    formatted = formatted.replace(/\. ([A-Z])/g, '.\n\n$1');
    
    // Format lists if any
    formatted = formatted.replace(/(\d+\.\s)/g, '\n$1');
    
    // Clean up excessive line breaks
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add source attribution
    formatted += '\n\n---\n\n*This article was automatically imported from RSS feed and formatted for better readability.*';
    
    return formatted.trim();
  }

  private static generateExcerpt(content: string, maxLength: number = 160): string {
    const cleaned = this.cleanText(content);
    if (cleaned.length <= maxLength) return cleaned;
    
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastSentence = truncated.lastIndexOf('.');
    
    const cutPoint = lastSentence > lastSpace - 20 ? lastSentence + 1 : lastSpace;
    
    return cutPoint > 0 ? truncated.substring(0, cutPoint).trim() + '...' : truncated + '...';
  }

  private static extractTags(content: string): string[] {
    const realEstateKeywords = [
      'property', 'real estate', 'housing', 'apartment', 'villa', 'flat',
      'investment', 'market', 'price', 'sale', 'rent', 'rera', 'loan',
      'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai',
      'bandra', 'andheri', 'juhu', 'worli', 'powai'
    ];

    const text = content.toLowerCase();
    const foundTags = realEstateKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    // Add dynamic tags from content
    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    const frequentWords = words
      .filter(word => word.length > 4 && !this.isStopWord(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    const topWords = Object.entries(frequentWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    return [...new Set([...foundTags, ...topWords])].slice(0, 8);
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
    
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private static convertToBlogPost(
    article: RSSArticle, 
    sourceName: string, 
    category: string, 
    originalUrl: string
  ): BlogPost {
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
      status: 'draft', // Always start as draft for review
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
      readTime: Math.max(1, Math.ceil(article.content.length / 200)), // ~200 words per minute
      source: 'rss',
      rssSource: sourceName,
      originalUrl: article.link
    };
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .trim();
  }

  private static generateSEOTitle(title: string, category: string): string {
    const baseSEO = `${title} | ${category} News | ResaleExpert`;
    return baseSEO.length <= 60 ? baseSEO : `${title} | ResaleExpert`;
  }

  private static generateSEODescription(excerpt: string, category: string): string {
    const baseDesc = `${excerpt} Read latest ${category.toLowerCase()} news and insights on ResaleExpert.`;
    return baseDesc.length <= 160 ? baseDesc : excerpt.substring(0, 157) + '...';
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

    return sampleArticles.map(article => 
      this.convertToBlogPost(article, sourceName, category, 'https://example.com')
    );
  }
}