#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse as htmlParse } from 'node-html-parser';

const tplDir = path.join(__dirname, 'templates');
const destSite = '../../satyam.com';

const placeholder = /{{\s*(\w+)\.(\w+)\s*}}/g;

const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;

const site = require(path.join(tplDir, 'site.json'));

const catTpl = await fs.readFile(
  path.join(tplDir, 'catentry.tpl.html'),
  'utf8'
);

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
    this._date = new Date(this.year, this.month - 1, this.day, 2);
    this.excerpt = htmlParse(this.excerpt).removeWhitespace().innerText;
  }
  get locale() {
    return 'es-ES';
  }
  get ISODate() {
    return `${this.year}-${this.month}-${this.day}T00:00:00+01:00`;
  }
  get localizedDate() {
    return this._date.toLocaleDateString('es-ES', { dateStyle: 'medium' });
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
      .map((cat) => catTpl.replaceAll('{{cat}}', cat))
      .join('');
  }
}

const postsSite = path.join(destSite, 'site1', 'blog');
await fs.ensureDir(postsSite);
await fs.emptyDir(postsSite);
const jekyllPosts = path.join(destSite, '_posts');
const postNames = await glob(path.join(jekyllPosts, '*.htm*'));
for (const postName of postNames.sort()) {
  const post = new PostData(postName, await fs.readFile(postName, 'utf8'));

  // const site = await fs.readJSON(path.join(tplDir, 'site.json'));
  // const post = await fs.readJSON(path.join(tplDir, 'bilbobus.json'));
  const tplFile = await open(path.join(tplDir, 'post.tpl.html'), 'r');
  const outDir = path.join(postsSite, post.year, post.month, post.day);
  await fs.ensureDir(outDir);
  const outFile = await open(path.join(outDir, `${post.slug}.html`), 'w');
  for await (const line of tplFile.readLines({ encoding: 'utf8' })) {
    const replacement = line.replaceAll(placeholder, (_, obj, prop) => {
      switch (obj) {
        case 'site':
          return site[prop];
        case 'post':
          return post[prop];
        // case 'categories':
        //   return post.categories
        //     .map((cat) => catTpl.replaceAll('{{cat}}', cat))
        //     .join('');
        default:
          console.error('???', _, obj, prop);
          return _;
      }
    });
    await outFile.write(replacement);
  }
  tplFile.close();
  outFile.close();
}
