#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';

const tplDir = path.join(__dirname, 'templates');
const destSite = '../../satyam.com';

const placeholder = /{{\s*(\w+)\.(\w+)\s*}}/g;

const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;

const resolve = (template, prefix, values) => {
  const rex = new RegExp(`{{\\s*${prefix}\\.(\\w+)\\s*}}`, 'g');
  return template.replaceAll(rex, (_, prop) => {
    if (prop in values) return values[prop];
    console.error('??? resolving', prefix, 'var', prop);
  });
};

const site = require(path.join(tplDir, 'site.json'));

const resolveSiteVars = (template) => resolve(template, 'site', site);

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

const catTpl = await fs.readFile(
  path.join(tplDir, 'catentry.tpl.html'),
  'utf8'
);
const postRex = /{{\s*post\.(\w+)\s*}}/g;

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
    return this.data.categories;
  }
  get catLinks() {
    return this.data.categories
      .map((cat) => catTpl.replaceAll('{{cat}}', cat.replace('/', '_')))
      .join('');
  }
  resolveVars(template) {
    return resolve(template, 'post', this);
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

  // console.log(post.relURL, post.categories);
  post.categories.forEach((cat) => {
    const [c0, c1] = cat.split('/');
    if (!(c0 in catsHash)) catsHash[c0] = { _: [] };
    if (c1) {
      if (!(c1 in catsHash[c0])) catsHash[c0][c1] = [];
      catsHash[c0][c1].push(post.relURL);
    } else {
      catsHash[c0]['_'].push(post.relURL);
    }
  });
  const outDir = path.join(postsSite, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  await fs.writeFile(
    path.join(outDir, `${post.slug}.html`),
    post.resolveVars(postTpl)
  );
}

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
    .map((mainCat) =>
      Object.keys(catsHash[mainCat])
        .sort()
        .map(
          (subCat) => `
          <h3 id="${mainCat}_${subCat}">${mainCat} / ${subCat}</h3>
          <ul>
            ${catsHash[mainCat][subCat]
              .map((p) => `<li>${p}</li>\n`)
              .join('\n')}
          </ul>
          `
        )
        .join('\n')
    )
    .join('\n'),
};
const catsTpl = resolveSiteVars(
  await fs.readFile(path.join(tplDir, 'categories.tpl.html'), 'utf8')
);

await fs.writeFile(
  path.join(postsSite, 'categories.html'),
  resolve(catsTpl, 'post', catsVars)
);
