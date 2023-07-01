import { open, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { ensureDir, pathExists, copy } from 'fs-extra/esm';
import { globby } from 'globby';

import {
  NO_SUBCAT_KEY,
  SRC_DIRS,
  DEST_DIRS,
  __dirname,
  TEMPLATES,
  STYLES,
} from './constants.mjs';

import md from './mdParser.mjs';
import processHash from './processHash.mjs';
import { metaBlock, createExcerptEntry } from './fnTemplates.mjs';
import {
  resolveVars,
  readSrcFile,
  site,
  resolveSiteVars,
  sortDescending,
  prepareTemplate,
  cleanExcerpt,
  parsePostFrontMatter,
  shouldUpdate,
} from './utils.mjs';

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

const catRex = /\s*(?<main>[^\/]+)\s*(\/\s*(?<sub>[^\/]+)\s*)?/;

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

//-------------------------
// Here is where it does start to do something
//-------------------------
await ensureDir(DEST_DIRS.posts);
const postTpl = await prepareTemplate('post');

const srcPostNames = await globby(['**.htm*', '**.md'], {
  cwd: SRC_DIRS.srcPosts,
  deep: 5,
});

/*
`postsArray` is an ordered array of arrays (duples) 
made of `[srcFileName, relUrl]`
where `relURL` is build out of the date and the slugified title
taken from the frontmatter. 
It is ordered by date, newer on top after the date in the frontmatter.
The ordering is important to get the *previous/next* links right.
*/
const postsArray = srcPostNames
  .map((srcFileName) => {
    const { year, month, day, slug } = parsePostFrontMatter(srcFileName);
    return [srcFileName, `${year}/${month}/${day}/${slug}.html`];
  })
  .sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  });

const parsePostData = (srcFileName, relURL) => {
  const isMd = extname(srcFileName) === '.md';
  const fMat = parsePostFrontMatter(srcFileName, {
    excerpt: true,
    excerpt_separator: isMd ? '---' : '<span class="more"></span>',
  });
  const { year, month, day, slug } = fMat;
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

// Notice that this loop goes over the posts source
// now ordered descending by date, not just as `globby` finds them
for (const [srcFileName, relURL] of postsArray) {
  const post = parsePostData(srcFileName, relURL);

  if (!post.excerpt) console.error('missing excerpt in ', srcFileName);
  if (post.excerpt?.length === 0)
    console.error('empty excerpt in ', srcFileName);
  if (post.excerpt?.length > 800)
    console.error('excerpt too long', srcFileName, post.excerpt.length);
  if (post.content?.length < 20) console.error('short content', srcFileName);

  const outDir = join(DEST_DIRS.posts, post.year, post.month, post.day);
  await ensureDir(outDir);
  const outFile = join(outDir, `${post.slug}.html`);
  if (await shouldUpdate(outFile, join(SRC_DIRS.srcPosts, srcFileName))) {
    await writeFile(outFile, resolveVars(postTpl, 'post', post));
  }

  // Start collecting info for the various index pages.

  // No need to preserve the post content which can be large
  delete post.content;

  addToPostsHash(post);
  addToCatsHash(post);
  if (latestPostsCount) {
    latestPostsCount--;
    latestPostsArray.push(post);
  }
}

// Create home page
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

await writeFile(
  join(DEST_DIRS.posts, 'index.html'),
  resolveVars(homeTpl, 'post', homeVars)
);

// create Etiquetas page
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

await writeFile(
  join(DEST_DIRS.posts, 'categories.html'),
  resolveVars(catsTpl, 'post', catsVars)
);

// Create Arhivo page
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

await writeFile(
  join(DEST_DIRS.posts, 'posts.html'),
  resolveVars(postsTpl, 'post', postsVars)
);

// Create feed.xml
const feedTemplate = resolveSiteVars(
  await readSrcFile(TEMPLATES, 'feed.tpl.html')
);
const entryTemplate = resolveSiteVars(
  await readSrcFile(TEMPLATES, 'feedEntry.tpl.html')
);

const entries = latestPostsArray
  .map((post) => {
    post.catTerms = post.rawCats
      .map((cat) => `<category term="${cat}" />`)
      .join('\n');
    return resolveVars(entryTemplate, 'post', post);
  })
  .join('\n');

await writeFile(
  join(DEST_DIRS.posts, 'feed.xml'),
  resolveVars(feedTemplate, 'feed', { content: entries })
);

// Copy and merge styles
await ensureDir(DEST_DIRS.styles);

const destCSS = join(DEST_DIRS.styles, 'style.css');
const srcCSS = [
  join(SRC_DIRS.styles, 'minima.css'),
  join(__dirname, 'node_modules/highlight.js/styles/github.css'),
  join(SRC_DIRS.styles, 'custom.css'),
];

if (await shouldUpdate(destCSS, ...srcCSS)) {
  console.log('updating styles');
  const outStyle = await open(join(DEST_DIRS.styles, 'style.css'), 'w');
  for (const src of srcCSS) {
    await outStyle.writeFile(await readFile(src));
  }
  await outStyle.close();
}

//---
// copy js
await ensureDir(DEST_DIRS.js);
await copy(SRC_DIRS.js, DEST_DIRS.js);

await ensureDir(DEST_DIRS.images);

const imgNames = await globby(`**/*.*`, {
  cwd: SRC_DIRS.images,
  deep: 5,
});

for (const img of imgNames) {
  const src = join(SRC_DIRS.images, img);
  const dest = join(DEST_DIRS.images, img);
  if (await shouldUpdate(dest, src)) {
    console.log('updating image', img);
    await copy(src, dest, { preserveTimestamps: true });
  }
}
