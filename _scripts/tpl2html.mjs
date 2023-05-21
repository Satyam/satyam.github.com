#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';

const tplDir = path.join(__dirname, 'templates');
const destSite = '../../satyam.com';

const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;

const resolveVars = (template, prefix, values) => {
  const rex = new RegExp(`{{\\s*${prefix}\\.(\\w+)\\s*}}`, 'g');
  return template.replaceAll(rex, (_, prop) => {
    if (prop in values) return values[prop] ?? '';
    console.error('??? resolving', prefix, 'var', prop);
  });
};

const site = require(path.join(tplDir, 'site.json'));

const resolveSiteVars = (template) => resolveVars(template, 'site', site);

const meses = [
  '??',
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const catTitles = {
  viajes: 'Viajes',
  tecnologia: 'Tecnología',
  general: 'General',
  urbanismo: 'Urbanismo',
  historia: 'Historia',
  mitos: 'Mitos',
  papel: 'Papel',
  futuro: 'Futuro',
  'the-gods-that-werent': "The Gods that Weren't",
  egipto: 'Egipto',
  francia: 'Francia',
  grecia: 'Grecia',
  italia: 'Italia',
  sitges: 'Sitges',
  'tres-cantos': 'Tres Cantos',
  turquia: 'Turquía',
  'mega-ingenieria': 'Mega-Ingeniería',
  programacion: 'Programación',
};

const catRex = /\s*(?<main>[^\/]+)\s*(\/\s*(?<sub>[^\/]+)\s*)?/;
class PostData {
  constructor(postFileName, postContent) {
    const m = blogInfoRex.exec(path.basename(postFileName));
    if (!m) {
      console.error('no match', postFileName);
      process.exit(1);
    }
    Object.assign(
      this,
      { _fileName: postFileName },
      m.groups,
      matter(postContent, {
        excerpt: true,
        excerpt_separator: '<span class="more"></span>',
      })
    );
    this.excerpt = htmlParse(this.excerpt).removeWhitespace().innerText;
  }
  get locale() {
    return 'es-ES';
  }
  get ISODate() {
    return `${this.year}-${this.month}-${this.day}T00:00:00+01:00`;
  }
  get localizedDate() {
    return `${parseInt(this.day, 10)} / ${meses[parseInt(this.month, 10)]} / ${
      this.year
    }`;
  }
  get fullURL() {
    return `${site.url}/blog/${this.year}/${this.month}/${this.day}/${this.slug}.html`;
  }
  get relURL() {
    return `${this.year}/${this.month}/${this.day}/${this.slug}.html`;
  }
  get title() {
    return this.data.title;
  }
  get categories() {
    return this.data.categories.map((cat) => {
      const m = catRex.exec(cat);
      if (!m) {
        console.error('cat no match', cat, this._fileName);
        process.exit(1);
      }
      return m.groups;
    });
  }
  get catLinks() {
    return this.categories
      .map(
        (cat) => `<a href="/blog/categories/#${cat.main}_${cat.sub}"
      >${catTitles[cat.main]}${cat.sub ? ` / ${catTitles[cat.sub]}` : ''}
      </a>`
      )
      .join('\n');
  }
  resolveVars(template) {
    return resolveVars(template, 'post', this);
  }
}
const catsHash = {};
const postsSite = path.join(destSite, 'site1', 'blog');
await fs.ensureDir(postsSite);
await fs.emptyDir(postsSite);
const postTpl = resolveSiteVars(
  await fs.readFile(path.join(tplDir, 'post.tpl.html'), 'utf8')
);
const jekyllPosts = path.join(destSite, '_posts');
const postNames = await glob(path.join(jekyllPosts, '*.htm*'));
for (const postName of postNames.sort()) {
  const post = new PostData(postName, await fs.readFile(postName, 'utf8'));

  post.categories.forEach((cat) => {
    const { main, sub } = cat;
    if (!(main in catsHash)) catsHash[main] = { '': [] };
    const cMain = catsHash[main];
    if (sub) {
      if (!(sub in cMain)) cMain[sub] = [];
      cMain[sub].push({ title: post.title, url: post.relURL });
    } else {
      cMain[''].push({ title: post.title, url: post.relURL });
    }
  });
  const outDir = path.join(postsSite, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  await fs.writeFile(
    path.join(outDir, `${post.slug}.html`),
    post.resolveVars(postTpl)
  );
}
let lastMainCat = '';
const catsVars = {
  fullURL: `${site.url}/blog/categories.html`,
  relURL: 'categories.html',
  ISODate: new Date().toISOString(),
  localizedDate: new Date().toLocaleDateString('es-ES', {
    dateStyle: 'medium',
  }),
  title: 'Categories',
  locale: 'es-ES',
  excerpt: "Categories for posts on Satyam's blog",
  // content: `<pre>${JSON.stringify(catsHash, null, 2)}</pre>`,
  content: Object.keys(catsHash)
    .sort()
    .map((mainCat) => {
      let out = '';
      if (mainCat !== lastMainCat) {
        out += `<h3 id="${mainCat}_">${
          catTitles[mainCat] ?? `?? ${mainCat}`
        }</h3><ul hidden>`;
      }
      out += Object.keys(catsHash[mainCat])
        .sort()
        .map(
          (subCat) => `
        ${
          subCat
            ? `<h4 id="${mainCat}_${subCat}">${
                catTitles[subCat] ?? `?? ${subCat}`
              }</h4>`
            : ''
        }
        <ul hidden>
          ${catsHash[mainCat][subCat]
            .map((p) => `<li><a href="../${p.url}">${p.title}</a></li>\n`)
            .join('\n')}
        </ul>
        `
        )
        .join('\n');
      if (mainCat !== lastMainCat) {
        lastMainCat = mainCat;
        out += '</ul>';
      }
      return out;
    })
    .join('\n'),
};
const catsTpl = resolveSiteVars(
  await fs.readFile(path.join(tplDir, 'categories.tpl.html'), 'utf8')
);

await fs.writeFile(
  path.join(postsSite, 'categories.html'),
  resolveVars(catsTpl, 'post', catsVars)
);
