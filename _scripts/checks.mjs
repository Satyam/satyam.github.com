import { globby } from 'globby';
import { open, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as htmlParse } from 'node-html-parser';
import { DEST_DIRS } from './constants.mjs';
import { error } from 'node:console';

const posts = await globby('**/*.html', {
  cwd: DEST_DIRS.posts,
});

const BLOG = 'https://satyam.com.ar/blog/';
for (const post of posts) {
  const dom = htmlParse(await readFile(join(DEST_DIRS.posts, post), 'utf8'));
  // const anchors = dom.querySelectorAll('a');
  // if (anchors.length) {
  //   for (const anchor of anchors) {
  //     const href = anchor.getAttribute('href');
  //     const url = new URL(href, BLOG);
  //     // console.log('-', href);
  //     if (
  //       href !== '../' &&
  //       url.protocol.startsWith('http') &&
  //       !url.href.startsWith(BLOG)
  //     ) {
  //       await fetch(url)
  //         .then((response) => {
  //           if (!response.ok) {
  //             console.log('');
  //             console.log(post);
  //             console.log(' ', url.href, response.statusText);
  //           }
  //         })
  //         .catch((error) => {
  //           console.log('');
  //           console.log(post);
  //           console.log(' ', url.href);
  //           console.log(' ', error);
  //         });
  //     }
  //   }
  // }
  const pres = dom.querySelectorAll('pre');
  if (pres.length) {
    console.log('-----');
    console.log(post);
    console.log('-----');
    for (const pre of pres) {
      console.log('vvvv  pre');
      console.log(pre.innerHTML);
      console.log('^^^^');
    }
  }
  const codes = dom.querySelectorAll('code');
  if (codes.length) {
    console.log('-----');
    console.log(post);
    console.log('-----');
    for (const code of codes) {
      console.log('vvvv code');
      console.log(code.innerHTML);
      console.log('^^^^');
    }
  }
}
