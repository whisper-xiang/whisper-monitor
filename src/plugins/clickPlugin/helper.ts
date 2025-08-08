export function getDomSelector(el: any) {
  if (!el) return "";

  // 如果有 id，直接使用
  if (el.id) return `#${el.id}`;

  let path = [];
  while (el && el.nodeType === 1 && path.length < 5) {
    // 限制层级
    let selector = el.nodeName.toLowerCase();

    if (el.className) {
      const classNames = el.className.trim().split(/\s+/).join(".");
      selector += "." + classNames;
    }

    const sibling = el.parentNode ? Array.from(el.parentNode.children) : [];
    const index = sibling.indexOf(el);
    if (index > -1) {
      selector += `:nth-child(${index + 1})`;
    }

    path.unshift(selector);
    el = el.parentNode;
  }

  return path.join(" > ");
}
