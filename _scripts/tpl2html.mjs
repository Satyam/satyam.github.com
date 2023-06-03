#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';
import slugify from 'slugify';

const ASSETS = 'assets';
const SRC_DIRS = {
  templates: path.join(__dirname, 'templates'),
  jekyllPosts: path.join(__dirname, 'posts'),
  styles: path.join(__dirname, ASSETS, 'styles'),
  images: path.join(__dirname, ASSETS, 'imgs'),
  js: path.join(__dirname, ASSETS, 'js'),
};

const SITE_DIR = path.join(__dirname, 'blog');
const ASSETS_DIR = path.join(SITE_DIR, ASSETS);
const DEST_DIRS = {
  posts: SITE_DIR,
  styles: path.join(ASSETS_DIR, 'css'),
  images: path.join(ASSETS_DIR, 'img'),
  js: path.join(ASSETS_DIR, 'js'),
};

// Important: the reason for the | key is because it gets sorted after all alpha characters
const NO_SUBCAT_KEY = '|';

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

const sortDescending = (a, b) => {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
};
const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;
const catRex = /\s*(?<main>[^\/]+)\s*(\/\s*(?<sub>[^\/]+)\s*)?/;

const cleanExcerpt = (e) => {
  const eEl = htmlParse(e);
  eEl.querySelectorAll('figure').forEach((fig) => fig.remove());
  return eEl.innerText.replaceAll(/[ ]+/g, ' ');
};

const createExcerptEntry = (post) => `
<div class="excerpt-title p-name" itemprop="name headline">
  <a class="home-post-link" href="${post.relURL}">${post.title}</a>
</div>
<div class="excerpt-extra">
  <time class="excerpt-date" datetime="${
    post.ISODate
  }" itemprop="datePublished">${post.localizedDate}</time>
  <span class="excerpt-cats">${post.catLinks ?? ''}</span>
</div>
<blockquote class="excerpt">${post.excerpt}</blockquote>
`;

const parsePostData = (postFileName, postContent) => {
  const m = blogInfoRex.exec(path.basename(postFileName));
  if (!m) {
    console.error('no match', postFileName);
    process.exit(1);
  }
  const { year, month, day, slug } = m.groups;
  const fMat = matter(postContent, {
    excerpt: true,
    excerpt_separator: '<span class="more"></span>',
  });
  const result = {
    year,
    month,
    day,
    slug,
    excerpt: cleanExcerpt(fMat.excerpt),
    content: fMat.content,
    locale: fMat.data.language,
    ISODate: `${year}-${month}-${day}T00:00:00+01:00`,
    localizedDate: `${parseInt(day, 10)} / ${
      meses[parseInt(month, 10)]
    } / ${year}`,
    fullURL: `${site.url}${site.root}/${year}/${month}/${day}/${slug}.html`,
    relURL: `${year}/${month}/${day}/${slug}.html`,
    title: fMat.data.title,
    categories: fMat.data.categories.map((cat) => {
      const m = catRex.exec(cat);
      if (!m) {
        console.error('cat no match', cat, postFileName);
        process.exit(1);
      }
      return m.groups;
    }),
  };
  result.catLinks = result.categories
    .map((cat) =>
      cat.sub
        ? `
          <a href="categories/#${slugify(cat.main)}_${slugify(
            cat.sub
          )}" rel="category tag">
            ${cat.main} / ${cat.sub}
          </a>`
        : `
          <a href="categories/#${slugify(cat.main)}" rel="category tag">
            ${cat.main}
          </a>`
    )
    .join('\n');
  if (result.excerpt.length > 800)
    console.error('excerpt too long', postFileName, result.excerpt.length);
  return result;
};

const catsHash = {};
const postsHash = {};
await fs.ensureDir(DEST_DIRS.posts);
// await fs.emptyDir(DEST_DIRS.posts);
const postTpl = resolveSiteVars(
  await fs.readFile(path.join(SRC_DIRS.templates, 'post.tpl.html'), 'utf8')
);

const postNames = await glob(path.join(SRC_DIRS.jekyllPosts, '*.htm*'));
for (const postName of postNames.sort(sortDescending)) {
  const post = parsePostData(postName, await fs.readFile(postName, 'utf8'));
  if (post.excerpt?.length === 0) console.error('empty excerpt in ', postName);
  const outDir = path.join(DEST_DIRS.posts, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  await fs.writeFile(
    path.join(outDir, `${post.slug}.html`),
    resolveVars(postTpl, 'post', post)
  );
  delete post.content;

  if (!(post.year in postsHash)) postsHash[post.year] = [];
  if (!(post.month in postsHash[post.year]))
    postsHash[post.year][post.month] = [];
  postsHash[post.year][post.month].push(post);
  post.categories.forEach((cat) => {
    const { main, sub } = cat;
    if (!(main in catsHash)) catsHash[main] = { [NO_SUBCAT_KEY]: [] };
    const cMain = catsHash[main];
    if (sub && !cMain[sub]) cMain[sub] = [];
    cMain[sub ?? NO_SUBCAT_KEY].push(post);
  });
}

// a =  [
//       { "title": "El entierro de la sardina" }
//     ],
// It is assumed that posts will be sorted descending by date
const processPostArray = (a) => a.map(createExcerptEntry).join('');

// subCat = "Tres Cantos"
// postArray =  [
//       { "title": "El entierro de la sardina" }
//     ],
// or:
// subCat = "|"
// linkArray =  [
//       { "title": "Andorra la Vella"  }
//     ],
const processSubItem = (postArray, mainCat, subCat) =>
  subCat === NO_SUBCAT_KEY
    ? processPostArray(postArray)
    : `
    <details  id="${slugify(mainCat)}_${slugify(subCat)}" class="subItem">
      <summary>${subCat}</summary>
      ${processPostArray(postArray)}
    </details>`;

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
    <details id="${slugify(mainCat)}"class="mainItem">
      <summary>${mainCat}</summary>
      ${objectMap(subHash, (postArray, subCat) =>
        processSubItem(postArray, mainCat, subCat)
      ).join('')}
    </details>`;

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
const processHash = (hash) => `${objectMap(hash, processMainHash).join('')}`;

const catsVars = {
  fullURL: `${site.url}${site.root}/categories.html`,
  relURL: 'categories.html',
  ISODate: new Date().toISOString(),
  localizedDate: new Date().toLocaleDateString('es-ES', {
    dateStyle: 'medium',
  }),
  title: 'Categories',
  locale: 'es-ES',
  excerpt: "Categories for posts on Satyam's blog",

  content: processHash(catsHash),
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

const postsVars = {
  fullURL: `${site.url}${site.root}/posts.html`,
  relURL: 'posts.html',
  ISODate: new Date().toISOString(),
  localizedDate: new Date().toLocaleDateString('es-ES', {
    dateStyle: 'medium',
  }),
  title: 'Posts by Year',
  locale: 'es-ES',
  excerpt: "Index of posts by year of publishing for on Satyam's blog",

  content: processHash(postsHash),
};
const postsTpl = resolveSiteVars(
  await fs.readFile(path.join(SRC_DIRS.templates, 'posts.tpl.html'), 'utf8')
);
await fs.writeFile(
  path.join(DEST_DIRS.posts, 'posts.html'),
  resolveVars(postsTpl, 'post', postsVars)
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
// copy js
await fs.ensureDir(DEST_DIRS.js);
await fs.copy(SRC_DIRS.js, DEST_DIRS.js);

if (!(await fs.pathExists(DEST_DIRS.images))) {
  console.log('copying images');
  await fs.ensureDir(DEST_DIRS.images);
  await fs.copy(SRC_DIRS.images, DEST_DIRS.images);
}
