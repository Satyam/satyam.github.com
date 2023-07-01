import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as htmlParse } from 'node-html-parser';
import matter from 'gray-matter';
import slugify from 'slugify';

import { TEMPLATES, SRC_DIRS } from './constants.mjs';

export const lastMod = async (file) => {
  try {
    const fstat = await stat(file);
    return Math.floor(fstat.mtimeMs / 1000);
  } catch (err) {
    console.error(err);
    return 0;
  }
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

export const site = JSON.parse(await readSrcFile(TEMPLATES, 'site.json'));
site.updated = new Date().toISOString();

export const resolveSiteVars = (template) =>
  resolveVars(template, 'site', site);

const baseTemplate = await readSrcFile(TEMPLATES, 'base.tpl.html');

export const prepareTemplate = async (tpl) => {
  const template = await readSrcFile(TEMPLATES, `${tpl}.tpl.html`);
  const values = {};
  htmlParse(template)
    .querySelectorAll('template')
    .forEach((t) => (values[t.id] = t.innerHTML));
  return resolveSiteVars(resolveVars(baseTemplate, 'template', values));
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
