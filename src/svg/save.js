export function getSvgHtml(svg) {
  const node = svg.cloneNode(true);

  const tmp = document.createElement('div');
  tmp.appendChild(node);

  return tmp.innerHTML;
}


export function downloadSvg(blob, filename) {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';

  const url = URL.createObjectURL(blob);

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  document.body.removeChild(a);
}
