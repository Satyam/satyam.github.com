// working is to prevent cascading toggle calls on open and closing tabs
let working = false;
// These two keep track of the only main tab and possibly subtab open at any one time
let currentMainId;
let currentSubId;
// To tell the toggle event listener that the toggle has been requested via code, not the user
// and that the history should not be changed.
let dontPush = false;
document.querySelectorAll('.post-content details').forEach((el) => {
  el.addEventListener('toggle', (ev) => {
    if (working) return;
    working = true;
    const detailsEl = ev.target;
    const id = detailsEl.id;
    const [mainId, subId] = id.split('_');
    if (detailsEl.open) {
      if (currentMainId && mainId !== currentMainId) {
        document.getElementById(currentMainId).open = false;
      }
      currentMainId = mainId;
      if (currentSubId && id !== currentSubId) {
        document.getElementById(currentSubId).open = false;
      }
      currentSubId = subId ? id : undefined;
      if (dontPush) {
        dontPush = false;
      } else {
        const newURL = new URL(location.href);
        newURL.hash = `#${id}`;
        history.pushState({ id }, '', newURL);
      }
    } else {
      currentSubId = undefined;
      if (!subId) currentMainId = undefined;
    }
    detailsEl.scrollIntoView();
    setTimeout(() => {
      working = false;
    }, 0);
  });
});

const openDetails = (id) => {
  if (id) {
    const detailsEl = document.getElementById(id);
    if (detailsEl.matches('details')) {
      dontPush = true;
      detailsEl.open = true;
      if (detailsEl.matches('.subItem')) {
        dontPush = true;
        detailsEl.parentElement.closest('details').open = true;
      }
      return true;
    }
  }
};

if (location.hash.length) {
  const id = location.hash.substring(1);
  if (openDetails(id)) history.replaceState({ id }, '');
}
window.addEventListener('popstate', (ev) => {
  openDetails(ev.state?.id);
});
