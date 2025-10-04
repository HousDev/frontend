const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { format } = require('date-fns');

router.get('/feed.xml', async (req, res) => {
    const [rows] = await pool.query("SELECT id, title, slug, summary, created_at FROM blogs ORDER BY created_at DESC LIMIT 20");

    const items = rows.map(post => `
    <item>
      <title>${post.title}</title>
      <link>https://resaleexpert.com/blog/${post.slug}</link>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>https://resaleexpert.com/blog/${post.slug}</guid>
    </item>
  `).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Resale Expert Blog</title>
        <link>https://resaleexpert.com/blog</link>
        <description>Latest blog posts from Resale Expert</description>
        ${items}
      </channel>
    </rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
});

module.exports = router;
