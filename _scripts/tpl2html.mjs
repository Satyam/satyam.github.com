#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';
import slugify from 'slugify';

const SRC_DIRS = {
  templates: path.join(__dirname, 'templates'),
  styles: path.join(__dirname, 'styles'),
  jekyllPosts: path.join(__dirname, 'posts'),
  images: path.join(__dirname, 'imgs'),
};

const SITE = path.join(__dirname, 'blog');
const ASSETS = path.join(SITE, 'assets');
const DEST_DIRS = {
  posts: SITE,
  styles: path.join(ASSETS, 'css'),
  images: path.join(ASSETS, 'img'),
};

const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;

const resolveVars = (template, prefix, values) => {
  const rex = new RegExp(`{{\\s*${prefix}\\.(\\w+)\\s*}}`, 'g');
  return template.replaceAll(rex, (_, prop) => {
    if (prop in values) return values[prop] ?? '';
    console.error('??? resolving', prefix, 'var', prop);
  });
};

const site = require(path.join(SRC_DIRS.templates, 'site.json'));

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
    return this.data.language;
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
      .map((cat) =>
        cat.sub
          ? `
          <a href="/blog/categories/#${slugify(cat.main)}_${slugify(
              cat.sub
            )}" rel="category tag">
            ${cat.main} / ${cat.sub}
          </a>`
          : `
          <a href="/blog/categories/#${slugify(cat.main)}" rel="category tag">
            ${cat.main}
          </a>`
      )
      .join('\n');
  }
  resolveVars(template) {
    return resolveVars(template, 'post', this);
  }
}
const catsHash = {};
await fs.ensureDir(DEST_DIRS.posts);
// await fs.emptyDir(DEST_DIRS.posts);
const postTpl = resolveSiteVars(
  await fs.readFile(path.join(SRC_DIRS.templates, 'post.tpl.html'), 'utf8')
);
const postNames = await glob(path.join(SRC_DIRS.jekyllPosts, '*.htm*'));
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
  const outDir = path.join(DEST_DIRS.posts, post.year, post.month, post.day);
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

  // TODO cambiar estructura a https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul#try_it
  content: Object.keys(catsHash)
    .sort()
    .map((mainCat) => {
      let out = '';
      if (mainCat !== lastMainCat) {
        out += `<h3 id="${slugify(
          mainCat
        )}" class="main-category">${mainCat}</h3><ul hidden>`;
      }
      out += Object.keys(catsHash[mainCat])
        .sort()
        .map(
          (subCat) => `
        ${
          subCat
            ? `<h4 id="${slugify(mainCat)}_${slugify(
                subCat
              )}" class="sub-category">${subCat}</h4>`
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
  await fs.readFile(
    path.join(SRC_DIRS.templates, 'categories.tpl.html'),
    'utf8'
  )
);

await fs.writeFile(
  path.join(DEST_DIRS.posts, 'categories.html'),
  resolveVars(catsTpl, 'post', catsVars)
);

// Copy and merge styles
await fs.ensureDir(DEST_DIRS.styles);
const outStyle = await open(path.join(DEST_DIRS.styles, 'style.css'), 'w');
await outStyle.writeFile(
  await fs.readFile(path.join(SRC_DIRS.styles, 'minima.css'), 'utf8')
);
await outStyle.writeFile(
  await fs.readFile(path.join(SRC_DIRS.styles, 'custom.css'), 'utf8')
);
await outStyle.close();

//---

if (!(await fs.pathExists(DEST_DIRS.images))) {
  console.log('copying images');
  await fs.ensureDir(DEST_DIRS.images);
  await fs.copy(SRC_DIRS.images, DEST_DIRS.images);
}
