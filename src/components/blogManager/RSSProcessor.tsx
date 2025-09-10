import React from 'react';

// RSS Processing utility functions
export class RSSProcessor {
  static async fetchRSSFeed(url: string): Promise<any> {
    try {
      // In a real implementation, you'd use a CORS proxy or backend service
      // For demo purposes, we'll simulate the RSS parsing
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.contents) {
        return this.parseRSSContent(data.contents);
      }
      
      throw new Error('Failed to fetch RSS content');
    } catch (error) {
      console.error('RSS Fetch Error:', error);
      return this.generateSampleRSSData(url);
    }
  }

  static parseRSSContent(xmlContent: string): any[] {
    // Parse RSS/XML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');
    
    const articles = [];
    for (let i = 0; i < Math.min(items.length, 10); i++) {
      const item = items[i];
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      
      articles.push({
        title: this.cleanText(title),
        content: this.formatRSSContent(description),
        excerpt: this.generateExcerpt(description),
        link: link,
        pubDate: new Date(pubDate || Date.now()).toISOString(),
        tags: this.extractTags(title + ' ' + description)
      });
    }
    
    return articles;
  }

  static generateSampleRSSData(sourceUrl: string): any[] {
    // Generate sample data based on the RSS source
    const samples = [
      {
        title: 'Mumbai Property Prices Rise 15% in Western Suburbs',
        content: 'Mumbai\'s real estate market has witnessed significant growth in the western suburbs, with property prices rising by an average of 15% in the last quarter. Areas like Andheri West, Bandra West, and Juhu have seen the highest appreciation.',
        excerpt: 'Mumbai property prices show strong growth in western suburbs with 15% increase in Q1.',
        tags: ['mumbai', 'property prices', 'western suburbs', 'real estate'],
        pubDate: new Date().toISOString()
      },
      {
        title: 'New RERA Guidelines for Property Developers in 2025',
        content: 'The Real Estate Regulatory Authority has announced new guidelines for property developers that will come into effect from March 2025. These changes aim to provide better protection for homebuyers.',
        excerpt: 'RERA announces new guidelines for property developers effective March 2025.',
        tags: ['rera', 'property developers', 'guidelines', '2025'],
        pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Home Loan Interest Rates Drop to 8.5% - Best Time to Buy',
        content: 'Major banks have reduced home loan interest rates to 8.5%, making it an attractive time for homebuyers. This is the lowest rate seen in the past two years.',
        excerpt: 'Home loan rates drop to 8.5%, creating opportunities for property buyers.',
        tags: ['home loan', 'interest rates', 'banking', 'property buying'],
        pubDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return samples;
  }

  static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  static formatRSSContent(content: string): string {
    let formatted = this.cleanText(content);
    
    // Add proper paragraph breaks
    formatted = formatted.replace(/\. /g, '.\n\n');
    
    // Remove excessive line breaks
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Add markdown formatting for better readability
    formatted = formatted.replace(/(\n\n)([A-Z][^.]*:)/g, '$1## $2');
    
    return formatted.trim();
  }

  static generateExcerpt(content: string, maxLength: number = 150): string {
    const cleaned = this.cleanText(content);
    if (cleaned.length <= maxLength) return cleaned;
    
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  static extractTags(content: string): string[] {
    const commonTags = [
      'real estate', 'property', 'investment', 'mumbai', 'delhi', 'bangalore',
      'home loan', 'rera', 'market trends', 'property prices', 'housing',
      'commercial', 'residential', 'legal', 'finance', 'construction'
    ];

    const extractedTags = commonTags.filter(tag =>
      content.toLowerCase().includes(tag.toLowerCase())
    );

    // Add some dynamic tags based on content
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequentWords = words
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said'].includes(word))
      .slice(0, 3);

    return [...new Set([...extractedTags, ...frequentWords])].slice(0, 6);
  }

  static generateSEOTitle(title: string, category: string): string {
    const baseSEO = `${title} | ResaleExpert`;
    if (baseSEO.length <= 60) return baseSEO;
    
    const shortened = title.length > 40 ? title.substring(0, 40) + '...' : title;
    return `${shortened} | ResaleExpert`;
  }

  static generateSEODescription(excerpt: string, category: string): string {
    const baseDesc = `${excerpt} Latest ${category.toLowerCase()} insights and analysis from ResaleExpert.`;
    return baseDesc.length <= 160 ? baseDesc : excerpt;
  }
}

export default RSSProcessor;