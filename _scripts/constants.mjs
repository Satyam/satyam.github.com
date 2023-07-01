import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));

// Important: the reason for the | key is because it gets sorted after all alpha characters
export const NO_SUBCAT_KEY = '|';

const ASSETS = 'assets';
export const TEMPLATES = 'templates';
export const STYLES = 'styles';

const ROOT = join(__dirname, '..');
const SCRIPT = __dirname;
export const SRC_DIRS = {
  templates: join(SCRIPT, TEMPLATES),
  srcPosts: join(ROOT, 'blogsrc'),
  styles: join(SCRIPT, ASSETS, STYLES),
  images: join(ROOT, ASSETS, 'img'),
  js: join(SCRIPT, ASSETS, 'js'),
};

const SITE_DIR = join(__dirname, '../docs/blog');
const ASSETS_DIR = join(SITE_DIR, ASSETS);
export const DEST_DIRS = {
  posts: SITE_DIR,
  styles: join(ASSETS_DIR, 'css'),
  images: join(ASSETS_DIR, 'img'),
  js: join(ASSETS_DIR, 'js'),
};
