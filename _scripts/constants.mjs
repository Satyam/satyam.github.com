import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));

// Important: the reason for the | key is because it gets sorted after all alpha characters
export const NO_SUBCAT_KEY = '|';

const ROOT = join(__dirname, '..');

const ASSETS = 'assets';
export const TEMPLATES = 'templates';
export const STYLES = 'styles';

const SCRIPT = __dirname;
const BLOG_SRC = join(ROOT, 'blogsrc');

export const SRC_DIRS = {
  templates: join(SCRIPT, TEMPLATES),
  srcPosts: BLOG_SRC,
  styles: join(SCRIPT, ASSETS, STYLES),
  images: join(BLOG_SRC, ASSETS, 'img'),
  js: join(SCRIPT, ASSETS, 'js'),
};

const SITE_DIR = join(ROOT, 'docs/blog');
const ASSETS_DIR = join(SITE_DIR, ASSETS);

export const DEST_DIRS = {
  posts: SITE_DIR,
  styles: join(ASSETS_DIR, 'css'),
  images: join(ASSETS_DIR, 'img'),
  js: join(ASSETS_DIR, 'js'),
};
