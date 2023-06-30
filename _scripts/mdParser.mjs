import md_anchor from 'markdown-it-anchor';
import md_sub from 'markdown-it-sub';
import md_sup from 'markdown-it-sup';
import md_emoji from 'markdown-it-emoji';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (err) {
        console.error(err);
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});
md.use(md_anchor).use(md_sub).use(md_sup).use(md_emoji);
export default md;
