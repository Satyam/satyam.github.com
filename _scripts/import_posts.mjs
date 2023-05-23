#!/usr/bin/env zx
import matter from 'gray-matter';

const inputSite = '../../satyam.com';
const SRC_DIRS = {
  POSTS: path.join(inputSite, '_posts'),
  IMGS: path.join(inputSite, 'assets', 'img'),
};
const DEST_DIRS = {
  POSTS: path.join(__dirname, 'posts'),
  IMGS: path.join(__dirname, 'imgs'),
};

// Copy Images

await fs.ensureDir(DEST_DIRS.IMGS);
await fs.copy(SRC_DIRS.IMGS, DEST_DIRS.IMGS);

// Copy and massage files

const catTitles = {
  viajes: 'Viajes',
  tecnologia: 'Tecnología',
  general: 'General',
  urbanismo: 'Urbanismo',
  historia: 'Historia',
  mitos: 'Mitos',
  papel: 'Papel',
  futuro: 'Futuro',
  'the-gods-that-werent': "The Gods that Weren't",
  egipto: 'Egipto',
  francia: 'Francia',
  grecia: 'Grecia',
  italia: 'Italia',
  sitges: 'Sitges',
  'tres-cantos': 'Tres Cantos',
  turquia: 'Turquía',
  'mega-ingenieria': 'Mega-Ingeniería',
  programacion: 'Programación',
};

const theRx = /\bthe\b/gi;

await fs.ensureDir(DEST_DIRS.POSTS);
const postNames = await glob(path.join(SRC_DIRS.POSTS, '*.htm*'));
for (const postName of postNames) {
  const baseName = path.basename(postName);
  const post = matter.read(postName);

  // Expand categories to full names using `catTables`
  const cats = post.data.categories.map((cat) => {
    const [main, sub] = cat.split('/');
    return catTitles[main] + (sub ? '/' + catTitles[sub] : '');
  });

  // Check for English

  const lang = theRx.test(post.content) ? 'en-US' : 'es-ES';
  const ymd = baseName.split('-').slice(0, 3);
  await fs.writeFile(
    path.join(DEST_DIRS.POSTS, baseName),
    `---
title: "${post.data.title}"
date: "${ymd.join('-')}"
categories: ${JSON.stringify(cats)}
language: "${lang}"
---
${post.content}
`
  );
}
