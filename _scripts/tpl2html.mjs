#!/usr/bin/env zx
import { open } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse } from 'node-html-parser';

const tplDir = path.join(__dirname, 'templates');
const placeholder = /{{\s*(\w+)\.(\w+)\s*}}/g;

const blogInfoRex = /(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-(?<slug>.+)\.html/;

const site = {
  name: 'Comentarios',
  descr: 'Comentarios, viajes, ideas e historias',
  authorEmail: 'satyam@satyam.com.ar',
  url: 'www.satyam.com.ar',
  root: '/',
};

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
    this.excerpt = parse(this.excerpt).innerText.replaceAll(/\s+/g, ' ').trim();
  }
  get locale() {
    return 'es-ES';
  }
  get ISODate() {
    return this._date.toISOString();
  }
  get localizedDate() {
    return this._date.toLocaleDateString('es-ES', { dateStyle: 'medium' });
  }
  get url() {
    return `${site.url}/blog/${this.year}/${this.month}/${this.day}/${this.slug}.html`;
  }
  get uurl() {
    return `/blog/${this.year}/${this.month}/${this.day}/${this.slug}.html`;
  }
  get title() {
    return this.data.title;
  }
  get categories() {
    return this.data.categories;
  }
}

const jekyllPosts = '../../satyam.com/_posts';
const posts = await glob(path.join(jekyllPosts, '*.htm*'));
const post = new PostData(posts[0], await fs.readFile(posts[0], 'utf8'));

// const site = await fs.readJSON(path.join(tplDir, 'site.json'));
// const post = await fs.readJSON(path.join(tplDir, 'bilbobus.json'));
const tplFile = await open(path.join(tplDir, 'post.tpl.html'), 'r');
const catTpl = await fs.readFile(
  path.join(tplDir, 'catentry.tpl.html'),
  'utf8'
);
const outFile = await open(path.join(tplDir, 'bilbobus.html'), 'w');
for await (const line of tplFile.readLines({ encoding: 'utf8' })) {
  const replacement = line.replaceAll(placeholder, (_, obj, prop) => {
    switch (obj) {
      case 'site':
        return site[prop];
      case 'post':
        return post[prop];
      case 'categories':
        return post.categories
          .map((cat) => catTpl.replaceAll('{{cat}}', cat))
          .join('');
      default:
        console.error('???', _, obj, prop);
        return _;
    }
  });
  await outFile.write(replacement);
}
tplFile.close();
outFile.close();
