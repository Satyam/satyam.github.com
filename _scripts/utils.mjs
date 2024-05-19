import { open, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as htmlParse } from 'node-html-parser';
import matter from 'gray-matter';
import slugify from 'slugify';
import { ensureDir, copy } from 'fs-extra/esm';
import { TEMPLATES, SRC_DIRS } from './constants.mjs';

import { __dirname } from './constants.mjs';
export const lastMod = async (file) => {
  try {
    const fstat = await stat(file);
    return Math.floor(fstat.mtimeMs / 1000);
  } catch (err) {
    return 0;
  }
};

export const shouldUpdate = async (dest, ...srcs) => {
  const destMod = await lastMod(dest);
  if (destMod === 0) return true;
  for (const src of srcs) {
    if (destMod < (await lastMod(src))) return true;
  }

  return false;
};

export const resolveVars = (template, prefix, values) => {
  const rex = new RegExp(`{{\\s*${prefix}\\.(\\w+)\\s*}}`, 'g');
  return template.replaceAll(rex, (_, prop) => {
    if (prop in values) return values[prop] ?? '';
    // console.error('??? resolving', prefix, 'var', prop);
    return '';
  });
};

export const readSrcFile = async (folder, file) =>
  await readFile(join(SRC_DIRS[folder], file), 'utf8');

export const readJsonConfig = async (name) => {
  const values = JSON.parse(await readSrcFile(TEMPLATES, `${name}.json`));
  values.updated = new Date().toISOString();
  return values;
};

export const resolveSiteVars = (template, siteVars) =>
  resolveVars(template, 'site', siteVars);

const baseTemplate = await readSrcFile(TEMPLATES, 'base.tpl.html');

export const prepareTemplate = async (tpl, siteVars) => {
  const template = await readSrcFile(TEMPLATES, `${tpl}.tpl.html`);
  const values = {};
  htmlParse(template)
    .querySelectorAll('template')
    .forEach((t) => (values[t.id] = t.innerHTML));
  return resolveSiteVars(
    resolveVars(baseTemplate, 'template', values),
    siteVars
  );
};

export const sortDescending = (a, b) => {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
};

export const cleanExcerpt = (e) => {
  const eEl = htmlParse(e);
  eEl.querySelectorAll('figure').forEach((fig) => fig.remove());
  return eEl.innerText.replaceAll(/[ ]+/g, ' ');
};

export const parsePostFrontMatter = (srcFileName, options) => {
  const fMat = matter.read(join(SRC_DIRS.srcPosts, srcFileName), options);
  const [year, month, day] = fMat.data.date.split('-');
  const slug = slugify(fMat.data.title, { lower: true, strict: true });
  return {
    ...fMat,
    year,
    month,
    day,
    slug,
  };
};

// Copy and merge styles
export const copyStyles = async (destination) => {
  await ensureDir(destination);

  const destCSS = join(destination, 'style.css');
  const srcCSS = [
    join(SRC_DIRS.styles, 'minima.css'),
    join(SRC_DIRS.styles, 'github.min.css'),
    join(SRC_DIRS.styles, 'custom.css'),
  ];

  if (await shouldUpdate(destCSS, ...srcCSS)) {
    console.log('updating styles');

    const outStyle = await open(destCSS, 'w');
    for (const src of srcCSS) {
      await outStyle.writeFile(await readFile(src));
    }
    return await outStyle.close();
  }
};
//---
export const copyJs = async (destination) => {
  // copy js
  await ensureDir(destination);
  return await copy(SRC_DIRS.js, destination);
};

export const meses = [
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
export const formatDMY = (day, month, year) =>
  `${parseInt(day, 10)} / ${meses[parseInt(month, 10)]} / ${year}`;
