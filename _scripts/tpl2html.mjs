#!/usr/bin/env zx
import { open, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';
import slugify from 'slugify';

const md_anchor = require('markdown-it-anchor');
const md_sub = require('markdown-it-sub');
const md_sup = require('markdown-it-sup');
const md_emoji = require('markdown-it-emoji');
const hljs = require('highlight.js');

const md = require('markdown-it')({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }
          </code></pre>`;
      } catch (err) {
        console.error(err);
      }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

md.use(md_anchor).use(md_sub).use(md_sup).use(md_emoji);

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
    .map((key, index) => fn(obj[key], key, sortFn));

const site = require(path.join(SRC_DIRS.templates, 'site.json'));
site.updated = new Date().toISOString();

const resolveSiteVars = (template) => resolveVars(template, 'site', site);

const sortDescending = (a, b) => {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
};

const readSrcFile = async (folder, file) =>
  await fs.readFile(path.join(SRC_DIRS[folder], file), 'utf8');

const parsePost = (srcFileName, options) =>
  matter.read(path.join(SRC_DIRS.jekyllPosts, srcFileName), options);

const baseTemplate = await readSrcFile('templates', 'base.tpl.html');

const prepareTemplate = async (tpl) => {
  const template = await readSrcFile('templates', `${tpl}.tpl.html`);
  const tplDoc = htmlParse(template);
  const rex = new RegExp(`{{\\s*template\\.(\\w+)\\s*}}`, 'g');
  return resolveSiteVars(
    baseTemplate.replaceAll(rex, (_, prop) => {
      return tplDoc.getElementById(prop)?.innerHTML ?? '';
    })
  );
};

const meses = [
  '??',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const formatDMY = (day, month, year) =>
  `${parseInt(day, 10)} / ${meses[parseInt(month, 10)]} / ${year}`;

const nowVars = () => {
  const now = new Date();
  const [year, month, day] = now.toISOString().split('T')[0].split('-');
  return {
    ISODate: now.toISOString(),
    localizedDate: formatDMY(day, month, year),
  };
};

const metaBlock = (post) => `
<div class="post-meta">
  <div class="date-published">
    Publicado el: 
    <time  datetime="${post.ISODate}" itemprop="datePublished">
    ${post.localizedDate}</time>
  </div>
  ${
    post.categories?.length
      ? `<div class="post-cats">Archivado bajo: ${post.categories
          .map((cat) =>
            cat.sub
              ? `<a
            href="categories/#${slugify(cat.main)}_${slugify(cat.sub)}"
            rel="category tag"
            >${cat.main} / ${cat.sub}
            </a>`
              : `
          <a href="categories/#${slugify(cat.main)}" rel="category tag">
            ${cat.main}
          </a>`
          )
          .join(',\n')}</div>`
      : ''
  }</div>`;

const createExcerptEntry = (post) => `
<div class="excerpt">
  <div class="excerpt-title p-name" itemprop="name headline">
    <a class="home-post-link" href="${post.relURL}">${post.title}</a>
  </div>
  ${metaBlock(post)}
  <blockquote>${post.excerpt}</blockquote>
</div>
`;

const catRex = /\s*(?<main>[^\/]+)\s*(\/\s*(?<sub>[^\/]+)\s*)?/;

const cleanExcerpt = (e) => {
  const eEl = htmlParse(e);
  eEl.querySelectorAll('figure').forEach((fig) => fig.remove());
  return eEl.innerText.replaceAll(/[ ]+/g, ' ');
};

const latestPostsArray = [];
let latestPostsCount = 10;

const postsHash = {};
const addToPostsHash = (post) => {
  if (!(post.year in postsHash)) postsHash[post.year] = [];
  const monthText = meses[parseInt(post.month, 10)];
  if (!(monthText in postsHash[post.year]))
    postsHash[post.year][monthText] = [];
  postsHash[post.year][monthText].push(post);
};
const catsHash = {};

const addToCatsHash = (post) => {
  post.categories.forEach((cat) => {
    const { main, sub } = cat;
    if (!(main in catsHash)) catsHash[main] = { [NO_SUBCAT_KEY]: [] };
    const cMain = catsHash[main];
    if (sub && !cMain[sub]) cMain[sub] = [];
    cMain[sub ?? NO_SUBCAT_KEY].push(post);
  });
};
await fs.ensureDir(DEST_DIRS.posts);
// await fs.emptyDir(DEST_DIRS.posts);
const postTpl = await prepareTemplate('post');

const srcPostNames = await glob(['**.htm*', '**.md'], {
  cwd: SRC_DIRS.jekyllPosts,
  deep: 5,
});

const postsArray = srcPostNames
  .map((srcFileName) => {
    const fMat = parsePost(srcFileName);
    const [year, month, day] = fMat.data.date.split('-');
    const slug = slugify(fMat.data.title, { lower: true, strict: true });
    return [srcFileName, `${year}/${month}/${day}/${slug}.html`];
  })
  .sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  });

const parsePostData = (srcFileName, relURL) => {
  const isMd = path.extname(srcFileName) === '.md';
  const fMat = parsePost(srcFileName, {
    excerpt: true,
    excerpt_separator: isMd ? '---' : '<span class="more"></span>',
  });
  const [year, month, day] = fMat.data.date.split('-');
  const slug = slugify(fMat.data.title, { lower: true, strict: true });
  const content = isMd ? md.render(fMat.content) : fMat.content;
  const result = {
    srcFileName,
    year,
    month,
    day,
    slug,
    excerpt: cleanExcerpt(isMd ? md.render(fMat.excerpt) : fMat.excerpt),
    content,
    locale: fMat.data.language,
    ISODate: `${year}-${month}-${day}T00:00:00+01:00`,
    localizedDate: formatDMY(day, month, year),
    relURL,
    fullURL: `${site.url}${site.root}/${relURL}`,
    title: fMat.data.title,
    rawCats: fMat.data.categories,
    categories: fMat.data.categories.map((cat) => {
      const m = catRex.exec(cat);
      if (!m) {
        console.error('cat no match', cat, srcFileName);
        process.exit(1);
      }
      return m.groups;
    }),
  };
  result.metaBlock = metaBlock(result);

  const postIndex = postsArray.findIndex((item) => relURL === item[1]);

  result.siblings = `
    <div class="next-prev-links">
      ${
        postIndex > 0
          ? `<a  class="prev-link" href="${
              postsArray[postIndex - 1][1]
            }"><div class="triangle-left"></div> Anterior</a>`
          : ''
      }
      ${
        postIndex < postsArray.length - 1
          ? `<a  class="next-link" href="${
              postsArray[postIndex + 1][1]
            }">Siguiente <div class="triangle-right"></div></a>`
          : ''
      }
    </div>`;
  return result;
};

for (const [srcFileName, relURL] of postsArray) {
  const post = parsePostData(srcFileName, relURL);

  if (!post.excerpt) console.error('missing excerpt in ', srcFileName);
  if (post.excerpt?.length === 0)
    console.error('empty excerpt in ', srcFileName);
  if (post.excerpt?.length > 800)
    console.error('excerpt too long', srcFileName, post.excerpt.length);
  if (post.content?.length < 20) console.error('short content', srcFileName);

  const outDir = path.join(DEST_DIRS.posts, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  await fs.writeFile(
    path.join(outDir, `${post.slug}.html`),
    resolveVars(postTpl, 'post', post)
  );

  delete post.content;

  addToPostsHash(post);
  addToCatsHash(post);
  if (latestPostsCount) {
    latestPostsCount--;
    latestPostsArray.push(post);
  }
}
const processHash = (hash, sortOrder) => {
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
  const processMainHash = (subHash, mainCat, sortOrder) => `
    <details id="${slugify(mainCat)}"class="mainItem">
      <summary>${mainCat}</summary>
      ${objectMap(
        subHash,
        (postArray, subCat) => processSubItem(postArray, mainCat, subCat),
        sortOrder
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
  return `${objectMap(hash, processMainHash, sortOrder).join('')}`;
};

const homeVars = {
  ...nowVars(),
  srcFileName: '--generated--',
  fullURL: `${site.url}${site.root}/index.html`,
  relURL: 'index.html',
  title: 'Bienvenido',
  locale: 'es-ES',
  excerpt: 'Artículos más recientes',

  content: `<div class="home-summary">Artículos más recientes</div>
    ${latestPostsArray.map(createExcerptEntry).join('')}`,
};
homeVars.metaBlock = metaBlock(homeVars);

const homeTpl = await prepareTemplate('home');

await fs.writeFile(
  path.join(DEST_DIRS.posts, 'index.html'),
  resolveVars(homeTpl, 'post', homeVars)
);

const catsVars = {
  ...nowVars(),
  srcFileName: '--generated--',
  fullURL: `${site.url}${site.root}/categories.html`,
  relURL: 'categories.html',
  title: 'Etiquetas',
  locale: 'es-ES',
  excerpt: 'Artículos archivados por etiqueta',

  content: processHash(catsHash),
};
catsVars.metaBlock = metaBlock(catsVars);

const catsTpl = await prepareTemplate('categories');

await fs.writeFile(
  path.join(DEST_DIRS.posts, 'categories.html'),
  resolveVars(catsTpl, 'post', catsVars)
);

const postsVars = {
  ...nowVars(),
  srcFileName: '--generated--',
  fullURL: `${site.url}${site.root}/posts.html`,
  relURL: 'posts.html',
  title: 'Artículos por fecha',
  locale: 'es-ES',
  excerpt: 'Artículos por fecha de publicación',

  content: processHash(postsHash, sortDescending),
};
postsVars.metaBlock = metaBlock(postsVars);

const postsTpl = await prepareTemplate('posts');

await fs.writeFile(
  path.join(DEST_DIRS.posts, 'posts.html'),
  resolveVars(postsTpl, 'post', postsVars)
);

const feedTemplate = resolveSiteVars(
  await readSrcFile('templates', 'feed.tpl.html')
);
const entryTemplate = resolveSiteVars(
  await readSrcFile('templates', 'feedEntry.tpl.html')
);

const entries = latestPostsArray
  .map((post) => {
    post.catTerms = post.rawCats
      .map((cat) => `<category term="${cat}" />`)
      .join('\n');
    return resolveVars(entryTemplate, 'post', post);
  })
  .join('\n');

await fs.writeFile(
  path.join(DEST_DIRS.posts, 'feed.xml'),
  resolveVars(feedTemplate, 'feed', { content: entries })
);

// Copy and merge styles
await fs.ensureDir(DEST_DIRS.styles);
const outStyle = await open(path.join(DEST_DIRS.styles, 'style.css'), 'w');
await outStyle.writeFile(await readSrcFile('styles', 'minima.css'));
await outStyle.writeFile(
  await readFile(
    path.join(__dirname, 'node_modules/highlight.js/styles/github.css'),
    'utf8'
  )
);
await outStyle.writeFile(await readSrcFile('styles', 'custom.css'));
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
