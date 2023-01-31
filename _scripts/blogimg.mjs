#!/usr/bin/env zx

// const list = await glob(['**/*.html', '!wp-content', '!gallery'], {
//   cwd: '../blog',
// });
// console.log(list, list.length);

cd('/home/satyam/Dinahosting/www/blog');
// cd('../blog');
const rexp = /\/blog\/(.*?\.((jpg)|(png)|(gif)))/gi;

const grep = await $`grep -rHEi --include="*.html" "\\.((jpg)|(png)|(gif))" .`;
const lines = grep.stdout.split('\n');
const imgs = [];
lines.forEach((line) => {
  if (!line.startsWith('./gallery')) {
    for (const m of line.matchAll(rexp)) {
      const img = m[0];
      if (!imgs.includes(img)) imgs.push(img);
    }
  }
});
console.log(imgs.sort(), imgs.length);

for (const file of imgs) {
  try {
    await fs.copy(
      `/home/satyam/Dinahosting/www${file}`,
      `/home/satyam/satyam.github.com${file}`
    );
  } catch (err) {
    console.error(err);
    console.log('-', file);
  }
}
