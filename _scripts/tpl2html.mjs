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

const objectMap = (obj, fn, sortFn) =>
  Object.keys(obj)
    .sort(sortFn)
    .map((key, index) => fn(obj[key], key, index));

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
for (const postName of postNames.sort((a, b) => {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
})) {
  const post = new PostData(postName, await fs.readFile(postName, 'utf8'));

  post.categories.forEach((cat) => {
    const { main, sub } = cat;
    // Important: the reason for the | key is because it gets sorted after all alpha characters
    if (!(main in catsHash)) catsHash[main] = { '|': [] };
    const cMain = catsHash[main];
    const { title, relURL, localizedDate, excerpt } = post;
    if (sub) {
      if (!(sub in cMain)) cMain[sub] = [];
      cMain[sub].push({ title, relURL, localizedDate, excerpt });
    } else {
      cMain['|'].push({ title, relURL, localizedDate, excerpt });
    }
  });
  const outDir = path.join(DEST_DIRS.posts, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  await fs.writeFile(
    path.join(outDir, `${post.slug}.html`),
    post.resolveVars(postTpl)
  );
}

// p = { "title": "El entierro de la sardina" }
const processPostItem = (p) => `
  <li>
    <a href="../${p.relURL}">${p.title}</a> ${p.localizedDate}
    <blockquote>${p.excerpt}</blockquote>
  </li>`;

// a =  [
//       { "title": "El entierro de la sardina" }
//     ],
// It is assumed that posts will be sorted descending by date
const processPostArray = (a) => a.map(processPostItem).join('');

// subCat = "Tres Cantos"
// postArray =  [
//       { "title": "El entierro de la sardina" }
//     ],
// or:
// subCat = "|"
// linkArray =  [
//       { "title": "Andorra la Vella"  }
//     ],
const processSubItem = (postArray, subCat) =>
  subCat === '|'
    ? processPostArray(postArray)
    : `
    <li>
      <h4>${subCat}</h4>
      <ul>${processPostArray(postArray)}</ul>
    </li>`;

//  mainCat = "Viajes"
//  subHash = {
//     "|": [
//       { "title": "Andorra la Vella"  }
//     ],
//     "Tres Cantos": [
//       { "title": "El entierro de la sardina" }
//     ],
//     "Italia": [
//       { "title": "Capri y Sorrento" }
//     ],
//   }
const processMainHash = (subHash, mainCat) => `
    <li>
      <h3>${mainCat}</h3>
      <ul>${objectMap(subHash, processSubItem).join('')}</ul>
    </li>`;

// hash = {
//   "Viajes": {
//     "|": [
//       { "title": "Andorra la Vella"  }
//     ],
//     "Tres Cantos": [
//       { "title": "El entierro de la sardina" }
//     ],
//     "Italia": [
//       { "title": "Capri y Sorrento" }
//     ],
//   },
//   "Tecnología": {
//     "|": [
//       { "title": "Tecnología" }
//     ],
//     "Mega-Ingeniería": [
//       { "title": "Barcos generadores de hidrógeno" }
//     ],
//   }
// }
const processCatsHash = (hash) =>
  `<ul>${objectMap(hash, processMainHash).join('')}</ul>`;

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
  // content: `<pre>${JSON.stringify(
  //   catsHash,
  //   (key, value) =>
  //     ['excerpt', 'relURL', 'localizedDate'].includes(key)
  //       ? undefined
  //       : Array.isArray(value)
  //       ? value.slice(0, 1)
  //       : value,
  //   2
  // )}</pre>`,

  content: processCatsHash(catsHash),
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
