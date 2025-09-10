import { A4_WIDTH_PX, A4_HEIGHT_PX, PAGE_PADDING, HEADER_HEIGHT, FOOTER_HEIGHT, computeContentMetrics } from './constants';

// Replace variable chips back to plain {{var}} before save
export const normalizeVariablesForSave = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('span[data-var]').forEach((el: Element) => {
    const name = (el as HTMLElement).getAttribute('data-var');
    const textNode = document.createTextNode(`{{${name}}}`);
    el.parentNode?.replaceChild(textNode, el);
  });

  return container.innerHTML;
};

// Build paginated preview
export const buildPaginatedPreview = (content: string): string[] => {
  const { contentWidth, usableHeight } = computeContentMetrics();
  const FUDGE = 2; // small rounding buffer

  // sandbox to measure with SAME typography as preview
  const sandbox = document.createElement('div');
  sandbox.style.position = 'absolute';
  sandbox.style.left = '-99999px';
  sandbox.style.top = '0';
  sandbox.style.width = `${contentWidth}px`;
  sandbox.style.visibility = 'hidden';
  sandbox.style.boxSizing = 'border-box';
  sandbox.style.fontFamily = 'Arial, sans-serif';
  sandbox.style.fontSize = '14px';
  sandbox.style.lineHeight = '1.6';
  sandbox.style.color = '#111827';
  document.body.appendChild(sandbox);

  // wrap source to prevent margin collapse
  const sourceWrapper = document.createElement('div');
  sourceWrapper.className = 'page-content-inner';
  sourceWrapper.innerHTML = normalizeVariablesForSave(content || '');
  sandbox.appendChild(sourceWrapper);

  const newPages: string[] = [];

  const makeEmptyPage = () => {
    const p = document.createElement('div');
    const inner = document.createElement('div');
    inner.className = 'page-content-inner';
    p.appendChild(inner);
    return p;
  };
  let currentPage = makeEmptyPage();

  const innerOf = (p: HTMLElement) =>
    (p.firstElementChild as HTMLElement) || p;

  const flushPage = () => {
    newPages.push(innerOf(currentPage).innerHTML);
    currentPage = makeEmptyPage();
  };

  const measurePageHeight = () => {
    sandbox.innerHTML = '';
    sandbox.appendChild(currentPage.cloneNode(true));
    return sandbox.scrollHeight;
  };

  const nodes = Array.from(sourceWrapper.childNodes);

  nodes.forEach((n) => {
    // guard: extremely tall single element
    if (n.nodeType === 1) {
      const probe = document.createElement('div');
      probe.style.width = `${contentWidth}px`;
      const inner = document.createElement('div');
      inner.className = 'page-content-inner';
      inner.appendChild(n.cloneNode(true));
      probe.appendChild(inner);
      document.body.appendChild(probe);
      const h = probe.scrollHeight;
      document.body.removeChild(probe);
      if (h > usableHeight && innerOf(currentPage).innerHTML.trim() !== '') {
        flushPage();
      }
    }

    // try to append
    const clone = n.cloneNode(true);
    innerOf(currentPage).appendChild(clone);

    if (measurePageHeight() > usableHeight + FUDGE) {
      // overflow -> move to next page
      innerOf(currentPage).removeChild(innerOf(currentPage).lastChild!);
      flushPage();
      innerOf(currentPage).appendChild(clone);
    }
  });

  if (innerOf(currentPage).innerHTML.trim() !== '') flushPage();

  document.body.removeChild(sandbox);
  return newPages.length ? newPages : [''];
};