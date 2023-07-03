import slugify from 'slugify';

import { NO_SUBCAT_KEY } from './constants.mjs';
import { createExcerptEntry } from './fnTemplates.mjs';

const objectMap = (obj, fn, sortFn) =>
  Object.keys(obj)
    .sort(sortFn)
    .map((key, index) => fn(obj[key], key, sortFn));

// a =  [
//       { "title": "El entierro de la sardina" }
//     ],
// It is assumed that posts will be sorted descending by date
const processPostArray = (a) => a.map(createExcerptEntry).join('');

// subCat = "Tres Cantos"
// postArray =  [
//       { "title": "El entierro de la sardina" }
//     ],
// or:
// subCat = "|"
// linkArray =  [
//       { "title": "Andorra la Vella"  }
//     ],
const processSubItem = (postArray, mainCat, subCat) =>
  subCat === NO_SUBCAT_KEY
    ? processPostArray(postArray)
    : `
    <details  id="${slugify(mainCat)}_${slugify(subCat)}" class="subItem">
      <summary>${subCat} (${Object.keys(postArray).length})</summary>
      ${processPostArray(postArray)}
    </details>`;

//  mainCat = "Viajes"
//  subHash = {
//     "|": [
//       { "title": "Andorra la Vella"  }
//     ],
//     "Tres Cantos": [
//       { "title": "El entierro de la sardina" }
//     ],
//     "Italia": [
//       { "title": "Capri y Sorrento" }
//     ],
//   }
const processMainHash = (subHash, mainCat, sortOrder) => `
    <details id="${slugify(mainCat)}" class="mainItem">
      <summary>${mainCat} (${Object.values(subHash).flat().length})</summary>
      ${objectMap(
        subHash,
        (postArray, subCat) => processSubItem(postArray, mainCat, subCat),
        sortOrder
      ).join('')}
    </details>`;

// hash = {
//   "Viajes": {
//     "|": [
//       { "title": "Andorra la Vella"  }
//     ],
//     "Tres Cantos": [
//       { "title": "El entierro de la sardina" }
//     ],
//     "Italia": [
//       { "title": "Capri y Sorrento" }
//     ],
//   },
//   "Tecnología": {
//     "|": [
//       { "title": "Tecnología" }
//     ],
//     "Mega-Ingeniería": [
//       { "title": "Barcos generadores de hidrógeno" }
//     ],
//   }
// }
const processHash = (hash, sortOrder) =>
  `${objectMap(hash, processMainHash, sortOrder).join('')}`;

export default processHash;
