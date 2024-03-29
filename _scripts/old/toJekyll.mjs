#!/usr/bin/env zx
import { parse } from 'node-html-parser';

const srcSite = '..';
const destSite = '../../satyam.com';

const decoderTable = {
  '&aacute;': 'á',
  '&eacute;': 'é',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&#133;': ' ',
  '&#x26;': '&',
  '&#x3C;': '&lt;',
  '&quot;': '"',
  '&ntilde;': 'ñ',
  '&iexcl;': '¡',
  '&iquest;': '¿',
};
const entRex = /&[^;]+;/g;
const entityDecoder = (src) =>
  src.replaceAll(entRex, (m) => {
    if (decoderTable[m]) return decoderTable[m];
    // console.error('unencoded', m);
    return m;
  });
const spacesRex = /\s+/g;
const trimSpaces = (s) => s.trim().replaceAll(spacesRex, ' ');

const fixSingleQuotes = (s) =>
  s
    .replaceAll('\u2019', '´')
    .replaceAll('\u2018', '`')
    .replaceAll('\u00A0', ' ');

const fixTextContent = (s) => fixSingleQuotes(trimSpaces(s ?? ''));

const processMitos = async () => {
  console.log('======= processMitos =========');
  const pages = await glob(path.join(srcSite, 'mitos', '*.htm*'));
  const mitosSite = path.join(destSite, '_mitos');
  fs.ensureDir(mitosSite);
  fs.emptyDir(mitosSite);
  for (const page of pages) {
    const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
    const title =
      root.querySelector('title')?.innerHTML ??
      root.querySelector('h1')?.innerHTML;

    root.querySelector('h1').remove();
    const body = root.querySelector('body')?.innerHTML;
    console.log(page);
    await fs.writeFile(
      path.join(mitosSite, path.basename(page)),
      `---
permalink: /_mitos/${path.basename(page)}
layout: page
title: ${title}
---
${body}
`
    );
  }
};

const processMilagros = async () => {
  console.log('========= processMilagros =========');
  const pages = await glob(path.join(srcSite, 'milagros', '*.htm*'));
  const milagrosSite = path.join(destSite, '_milagros');
  fs.ensureDir(milagrosSite);
  fs.emptyDir(milagrosSite);

  for (const page of pages) {
    const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
    const title =
      root.querySelector('title')?.innerHTML ??
      root.querySelector('h1')?.innerHTML;

    root.querySelector('h1').remove();
    const body = root.querySelector('body');
    const allTds = body.querySelectorAll('td');
    const lastTd = allTds[allTds.length - 1]?.innerHTML;
    console.log(page);
    await fs.writeFile(
      path.join(milagrosSite, path.basename(page)),
      `---
permalink: /_milagros/${path.basename(page)}
layout: page
title: ${title}
---
${lastTd}
`
    );
  }
};

const removePointlessDivs = ($content) => {
  $content.querySelector('div.post-info').remove();
  $content.querySelector('div.post-footer').remove();
  // Remove spurious empty paragraphs (usually at the end)
  for (const $empty of $content.querySelectorAll('p:empty')) {
    $empty.remove();
  }
};

const imgFiles = [];

const copyImage = (srcHref) => {
  const destHref = path.join('/assets/img', path.basename(srcHref));

  // Since I'm going to copy them all to the same folder
  // I want to be sure not to have duplicate names.
  const imgFile = path.basename(srcHref).toLowerCase();
  if (imgFiles.includes(imgFile)) {
    console.error('nombre duplicado', srcHref);
    // didn't find duplicates so I didn't bother to add code to
    // change the name to something unique
  } else {
    imgFiles.push(imgFile);
  }

  // now do copy the image
  fs.copySync(path.join(srcSite, srcHref), path.join(destSite, destHref));

  return destHref;
};

const processImages = ($content) => {
  // Images are inserted as thumbnails surrounded by an anchor pointed to the full image.
  // Sometimes they have a div with the caption, sometimes it is within the image.
  // All images point to the same folder.
  for (const $img of $content.querySelectorAll(
    'img[src^="/blog/wp-content/"]'
  )) {
    // Anchor pointing to the full-size image.
    const $anchor = $img.closest('a[href^="/blog/wp-content/"]');
    const $caption = $img.closest('div.wp-caption');
    // This was to check the various formats images could have.
    // There was no case of "only image"
    // console.log('------------------');
    // if ($caption) {
    //   console.log('has caption', $anchor ? 'has anchor' : 'no anchor');
    //   console.log($caption.outerHTML);
    // } else if ($anchor) {
    //   console.log('has anchor');
    //   console.log($anchor.outerHTML);
    // } else {
    //   console.log('only image');
    //   console.log($img.outerHTML);
    // }
    if (!$anchor) {
      console.error('no anchor', $img.outerHTML);
      continue;
      // actually, didn't find any img without anchor
    }

    // Pick the caption from either of the two alternatives
    const caption = fixTextContent(
      $caption?.querySelector('p.wp-caption-text')?.textContent ??
        $img.getAttribute('alt')
    );

    const title = fixTextContent($img.getAttribute('title'));

    // Take the reference to the full image, no thumbnail
    // These days there is enough bandwidth anyway
    const destHref = copyImage($anchor.getAttribute('href'));
    // Now replace the div enclosing the image and the caption
    // or the image (both enclosed in an anchor)
    // with a figure tag
    ($caption ?? $anchor).replaceWith(`
        <figure>
          <img
            src="${destHref}"
            alt="${caption}"
            ${title ? `title="${title}"` : ''}
          />
          <figcaption>${caption}</figcaption>
        </figure>`);
  }
};

const fixIntraLinks = ($content) => {
  // Posts were stored as an index.html file in a folder named for the post
  // Need to change that to an html file named for the post.
  for (const $intralink of $content.querySelectorAll('a[href^="/blog"]')) {
    // console.log('Internal reference', $intralink.outerHTML);
    $intralink.setAttribute(
      'href',
      $intralink.getAttribute('href').replace(/\/$/, '.html')
    );
  }
};

const fixExcerptSeparator = ($content) => {
  const excerptSeparator = '<span class="more"></span>';
  // change the tag signalling the end of the excerpt for the new one.
  for (const $more of $content.querySelectorAll('span[id^="more"]')) {
    $more.replaceWith(excerptSeparator);
  }

  // Check if the article does indeed have an exceprt separator
  // and if not insert one after the first element, usually a paragraph
  if ($content.querySelectorAll('span.more') == 0) {
    $content.childNodes.find(($n) => {
      if ($n.tagName) {
        $n.insertAdjacentHTML('afterend', excerptSeparator);
        return true;
      }
    });
  }
};

const processContent = ($content) => {
  removePointlessDivs($content);
  processImages($content);
  fixIntraLinks($content);
  fixExcerptSeparator($content);
};

const blogInfoRex =
  /blog\/(?<year>\d+)\/(?<month>\d+)\/(?<day>\d+)\/(?<slug>[^\/]+)/;

const processPosts = async () => {
  console.log('========== processPosts =========');
  const postsSite = path.join(destSite, '_posts');
  fs.ensureDir(postsSite);
  fs.emptyDir(postsSite);
  const globFilenames = await glob(
    path.join(srcSite, 'blog/20*/*/*/*/index.html')
  );
  for (const name of globFilenames) {
    // console.log(name);
    const m = blogInfoRex.exec(name);
    // if (m) console.log(m.groups);
    if (!m) {
      console.error('no match', name);
      continue;
    }
    const { year, month, day, slug } = m.groups;
    const filename = `${year}-${month}-${day}-${slug}.html`;
    console.log(filename);
    const root = parse(await fs.readFile(name, 'utf8'));
    const $$content = root.querySelectorAll('.post-content');
    if ($$content.length !== 1) {
      console.error('not just one content', $$content.length, name);
      console.log(root.outerHTML);
      continue;
    }
    // $content is the actual post content, one and only one per post.

    processContent($$content[0]);

    // Now we are puting together the strings we need to
    // make the actual new blog post.

    // Now that we cleaned it all, get the remaining content
    // and decode the entities that are not needed with utf-8 encoding.
    const content = fixSingleQuotes(entityDecoder($$content[0].innerHTML));

    // Get the basic page info from the post info section
    const $$postInfo = root.querySelectorAll('.post-info');
    if ($$postInfo.length !== 1) {
      console.error('not just one post-info section', $$postInfo.length);
      continue;
    }
    const $postInfo = $$postInfo[0];
    const $postTitle = $postInfo.querySelector('.post-title');
    if ($postTitle) {
      const title = fixTextContent(entityDecoder($postTitle.textContent));
      const category = fixTextContent(
        entityDecoder($postInfo.querySelector('a[rel~="category"]').textContent)
      );

      // Finally, write it!
      await fs.writeFile(
        path.join(postsSite, filename),
        `---
title:  "${title}"
date:   ${year}-${month}-${day}
category: "${category}"
---
${content}
    `
      );
    }
  }
};

const catHash = {};
const postHash = {};

const analyzeCategories = async () => {
  console.log('==== analyzeCategories ==========');

  // all pages contain the sidebar with the categories so
  // I might as well read it from the home page.
  const $home = parse(
    entityDecoder(
      await fs.readFile(path.join(srcSite, 'blog/index.html'), 'utf8')
    )
  );

  // read all the links in the categories, read the description and the url

  for (const $a of $home
    .getElementById('sidebar')
    .querySelectorAll('li.cat-item a')) {
    const name = fixTextContent($a.textContent);
    const url = $a.getAttribute('href');

    if (!url.startsWith('/blog/category/')) {
      console.error('strange url', name, url);
      continue;
    }
    // make the id for the category out of the url
    const parts = url.split('/');
    const l = parts.length;
    if (l < 5 || l > 6) {
      console.error('url inesperado', l, parts);
      continue;
    }
    const p3 = parts[3];
    if (!catHash[p3]) {
      catHash[p3] = {
        id: p3,
        name,
      };
    }
    if (l === 6) {
      const p4 = parts[4];
      const id = [p3, p4].join('/');
      if (!catHash[id]) catHash[id] = { id, name, parent: p3 };
    }
  }
  // Read each of the categories pages and pick info about the posts
  // contained in the indices
  console.log('====== looking for posts in catHash 315 ==========');
  for (const cat of Object.values(catHash)) {
    console.log(cat.id, cat.name);
    const posts = [];

    // Big categories take several pages of indexes:
    const pages = await glob([
      path.join(srcSite, 'blog/category', cat.id, 'index.html'),
      path.join(srcSite, 'blog/category', cat.id, 'page/*/index.html'),
    ]);
    // For each category index page, read the posts it contains
    // and get the title and url of each post.
    for (const page of pages) {
      console.log(page);
      const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
      const $$h3 = root.querySelectorAll('h3');
      if ($$h3.length !== 1) console.error('more than one h3', $$h3.length);
      if (fixTextContent($$h3[0].textContent) !== cat.name) {
        console.error(
          "Name of category doesn't match",
          fixTextContent($$h3[0].textContent),
          cat.name
        );
      }
      for (const $post of root.querySelectorAll('div.post')) {
        const $$title = $post.querySelectorAll('.post-title a');
        if ($$title.length !== 1)
          console.error('not just one title', $$title.length);
        const $anchor = $$title[0];
        const url = $anchor.getAttribute('href');
        const title = fixTextContent($anchor.textContent);

        // Get the date and slug from the url
        const m = blogInfoRex.exec(url);
        if (!m) {
          console.error('no match', url);
          continue;
        }
        const { year, month, day, slug } = m.groups;
        const postId = [year, month, day, slug].join('/');

        posts.push(postId);
        if (postHash[postId]) {
          postHash[postId].cats.push(cat.id);
        } else {
          postHash[postId] = {
            title,
            year,
            month,
            day,
            slug,
            cats: [cat.id],
          };
        }
      }
    }

    // save those posts in the category entry
    cat.posts = posts;
  }
};
const cleanDuplicatePosts = () => {
  // drop posts from 'general' if they have another categoty
  const genPosts = catHash.general.posts;
  for (const slug in postHash) {
    const cats = postHash[slug].cats;
    if (cats.length > 1) {
      if (cats.includes('general')) {
        cats.splice(
          cats.findIndex((c) => c === 'general'),
          1
        );
        genPosts.splice(
          genPosts.findIndex((item) => slug === item),
          1
        );
      }
    }
    // drop posts from parent category if listed under child
    cats.some((c1, i1) => {
      cats.some((c2, i2) => {
        if (i1 !== i2 && c1.startsWith(c2)) {
          cats.splice(i2, 1);
          const posts = catHash[c2].posts;

          posts.splice(
            posts.findIndex((p) => p === slug),
            1
          );
          return true;
        }
      });
    });
  }
};

const generateCatFiles = async () => {
  const catsSite = path.join(destSite, '_categorias');
  fs.ensureDir(catsSite);
  fs.emptyDir(catsSite);
  for (const cat of Object.values(catHash)) {
    const filename = path.join(catsSite, `${cat.id}.html`);
    await fs.ensureFile(filename);
    await fs.writeFile(
      filename,
      `---
layout: category
cat: "${cat.id}"
title:  "${cat.name}"
---
`
    );
  }
};

const generatePostFiles = async () => {
  console.log('========== generatePostFiles =========');
  const postsSite = path.join(destSite, '_posts');
  fs.ensureDir(postsSite);
  fs.emptyDir(postsSite);

  for (const post of Object.values(postHash)) {
    const { year, month, day, slug, cats, title } = post;
    const srcFile = path.join(
      srcSite,
      'blog',
      year,
      month,
      day,
      slug,
      'index.html'
    );
    const root = parse(await fs.readFile(srcFile, 'utf8'));
    const $$content = root.querySelectorAll('.post-content');
    if ($$content.length !== 1) {
      console.error('not just one content', $$content.length, srcFile);
      console.log(root.outerHTML);
      continue;
    }

    processContent($$content[0]);
    const content = fixSingleQuotes(entityDecoder($$content[0].innerHTML));
    await fs.writeFile(
      path.join(postsSite, `${year}-${month}-${day}-${slug}.html`),
      `---
title:  "${title}"
date:   ${year}-${month}-${day}
categories: ["${cats.join('","')}"]
---
${content}
  `
    );
  }
};
// await processMitos();
// await processMilagros();
// await processPosts();
await analyzeCategories();
cleanDuplicatePosts();

console.log('=======catHash 400 ==========', JSON.stringify(catHash, null, 2));
console.log('============== postHash', JSON.stringify(postHash, null, 2));

await generateCatFiles();
await generatePostFiles();
