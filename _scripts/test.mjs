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
/*
// Mitos:
{
  const pages = await glob(path.join(srcSite, 'mitos', '*.htm*'));
  const mitosSite = path.join(destSite, '_mitos');
  fs.ensureDir(mitosSite);
  fs.emptyDir(mitosSite);
  console.log('======= mitos 35 =========')
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
}
// Milagros:
{
  const pages = await glob(path.join(srcSite, 'milagros', '*.htm*'));
  const milagrosSite = path.join(destSite, '_milagros');
  fs.ensureDir(milagrosSite);
  fs.emptyDir(milagrosSite);

  console.log('========= milagros 64 =========')
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
}
*/

const blogInfoRex =
  /blog\/(?<year>\d+)\/(?<month>\d+)\/(?<day>\d+)\/(?<slug>[^\/]+)/;

const postFilenames = {};
// posts
{
  console.log('========== posts 96 =========');
  const imgFiles = [];
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
    const $content = $$content[0];

    // remove pointless sections
    $content.querySelector('div.post-info').remove();
    $content.querySelector('div.post-footer').remove();

    // Images are inserted as thumbnails surrounded by an anchor pointed to the full image.
    // Sometimes they have a div with the caption, sometimes it is within the image.
    // All images point to the same folder.
    for (const $img of $content.querySelectorAll(
      'img[src^="/blog/wp-content/"]'
    )) {
      // Anchor pointing to the full-size image.
      const $anchor = $img.closest('a[href^="/blog/wp-content/"]');
      const $caption = $img.closest('div.wp-caption');
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
      const caption =
        $caption?.querySelector('p.wp-caption-text')?.textContent ??
        $img.getAttribute('alt');

      const title = $img.getAttribute('title');

      // Take the reference to the full image, no thumbnail
      // These days there is enough bandwidth anyway
      const srcHref = $anchor.getAttribute('href');
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

    // Posts were stored as an index.html file in a folder named for the post
    // Need to change that to an html file named for the post.
    for (const $intralink of $content.querySelectorAll('a[href^="/blog"]')) {
      // console.log('Internal reference', $intralink.outerHTML);
      $intralink.setAttribute(
        'href',
        $intralink.getAttribute('href').replace(/\/$/, '.html')
      );
    }

    // Remove spurious empty paragraphs (usually at the end)
    for (const $empty of $content.querySelectorAll('p:empty')) {
      $empty.remove();
    }

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

    // Now we are puting together the strings we need to
    // make the actual new blog post.

    // Now that we cleaned it all, get the remaining content
    // and decode the entities that are not needed with utf-8 encoding.
    const content = entityDecoder($content.innerHTML);

    // Get the basic page info from the post info section
    const $$postInfo = root.querySelectorAll('.post-info');
    if ($$postInfo.length !== 1) {
      console.error('not just one post-info section', $$postInfo.length);
      continue;
    }
    const $postInfo = $$postInfo[0];
    const $postTitle = $postInfo.querySelector('.post-title');
    if ($postTitle) {
      const title = trimSpaces(entityDecoder($postTitle.textContent));
      const category = trimSpaces(
        entityDecoder($postInfo.querySelector('a[rel~="category"]').textContent)
      );
      // console.log(title, category, slug);

      postFilenames[filename] = [];
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
}

// Deal with nested categories
{
  console.log('==== nested categories 271 ==========');
  const catsSite = path.join(destSite, '_categorias');
  fs.ensureDir(catsSite);
  fs.emptyDir(catsSite);

  // all pages contain the sidebar with the categories so
  // I might as well read it from the home page.
  const $home = parse(
    entityDecoder(
      await fs.readFile(path.join(srcSite, 'blog/index.html'), 'utf8')
    )
  );

  const catHash = {};

  // read all the links in the categories, read the description and the url
  for (const $a of $home
    .getElementById('sidebar')
    .querySelectorAll('li.cat-item a')) {
    // const $a = $item.querySelector('a');
    const name = $a.textContent;
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
        url,
      };
    }
    if (l === 6) {
      const p4 = parts[4];
      const id = [p3, p4].join('/');
      if (!catHash[id]) catHash[id] = { id, name, url, parent: p3 };
    }
  }
  // Read each of the categories pages and pick info about the posts
  // contained in the indices
  console.log('====== looking for posts in catHash 315 ==========');
  for (const cat of Object.values(catHash)) {
    console.log(cat.id, cat.name);
    const posts = [];
    const parentPosts = catHash[cat.parent]?.posts;
    // Big categories take several pages of indexes:
    const pages = await glob([
      path.join(srcSite, cat.url, 'index.html'),
      path.join(srcSite, cat.url, 'page/*/index.html'),
    ]);
    // For each category index page, read the posts it contains
    // and get the title and url of each post.
    for (const page of pages) {
      console.log(page);
      const root = parse(entityDecoder(await fs.readFile(page, 'utf8')));
      const $$h3 = root.querySelectorAll('h3');
      if ($$h3.length !== 1) console.error('more than one h3', $$h3.length);
      for (const $post of root.querySelectorAll('div.post')) {
        const $$title = $post.querySelectorAll('.post-title a');
        if ($$title.length !== 1)
          console.error('not just one title', $$title.length);
        const $anchor = $$title[0];
        const url = $anchor.getAttribute('href');

        // Get the date and slug from the url
        const m = blogInfoRex.exec(url);
        // if (m) console.log(m.groups);
        if (!m) {
          console.error('no match', url);
          continue;
        }
        const { year, month, day, slug } = m.groups;

        posts.push({
          date: [year, month, day].join('-'),
          title: trimSpaces($anchor.textContent),
          url,
          year,
          month,
          day,
          slug,
        });

        // If this post is listed under the parent category, remove it from the parent
        // Since parent folders come listed before children, the parent will already be
        // populated.
        if (parentPosts) {
          const i = parentPosts.findIndex((pp) => pp.url === url);
          if (i !== -1) parentPosts.splice(i, 1);
        }
      }
    }

    // save those posts in the category entry
    cat.posts = posts;

    // write the new category entry (only the front matter is needed)
    const filename = path.join(catsSite, `${cat.id}.html`);
    await fs.ensureFile(filename);
    await fs.writeFile(
      filename,
      `---
layout: category
cat: "${cat.name}"
title:  "${cat.name}"
---
`
    );
  }

  // just a check to make sure that all posts are included.
  // Check those colected from the categories against those
  // listed in `postFilenames` which has been populated
  // from the posts folders.

  Object.values(catHash).forEach((cat) => {
    cat.posts.forEach((post) => {
      const parts = post.url.split('/');
      const [, , y, m, d, s] = parts;
      const fn = `${y}-${m}-${d}-${s}.html`;
      if (Array.isArray(postFilenames[fn])) postFilenames[fn].push(cat.id);
      else console.error('no está en postfilenames', fn);
    });
  });
  console.log('===== posts in categories =========');
  const postsInGeneral = catHash.general.posts;
  for (const post in postFilenames) {
    const l = postFilenames[post].length;
    if (l !== 1) {
      console.log(post, l, postFilenames[post]);
    }

    // If a post was listed in a specific category but also in 'general'
    // remove it from the ''general' (unclassified) category.
    if (l > 1 && postFilenames[post].includes('general')) {
      const date = post.substring(0, 10);
      const slug = post.substring(11).replace('.html', '');
      console.log(date, slug);
      postsInGeneral.some((p, i) => {
        if (p.date === date && p.slug === slug) {
          console.log('remove entry', p, ' at  ', i);
          postsInGeneral.splice(i, 1);
          return true;
        }
      });
    }
  }
  console.log(
    '=======catHash 400 ==========',
    JSON.stringify(catHash, null, 2)
  );
}
