// Markdown LaTeX delimiters. Accepts legacy whitespace inside $ ... $;
// fenced code and inline code are handled first by markdown-it itself.
function closing(text, delimiter, from) {
  let at = from;
  while ((at = text.indexOf(delimiter, at)) !== -1) {
    let slashes = 0;
    for (let i = at - 1; i >= 0 && text[i] === '\\'; i--) slashes++;
    if (slashes % 2 === 0) return at;
    at += delimiter.length;
  }
  return -1;
}
export default function mathPlugin(md, engine) {
  md.inline.ruler.before('escape', 'latex_math', (state, silent) => {
    const rest = state.src.slice(state.pos);
    const opening = rest.startsWith('$$') ? '$$' : rest.startsWith('$') ? '$' : rest.startsWith('\\(') ? '\\(' : null;
    if (!opening) return false;
    const endDelimiter = opening === '\\(' ? '\\)' : opening === '\\[' ? '\\]' : opening;
    const end = opening.startsWith('\\') ? state.src.indexOf(endDelimiter, state.pos + opening.length) : closing(state.src, endDelimiter, state.pos + opening.length);
    if (end === -1) return false;
    const tex = state.src.slice(state.pos + opening.length, end).trim();
    if (!tex) return false;
    if (!silent) {
      const token = state.push(opening === '$$' || opening === '\\[' ? 'math_display_inline' : 'math_inline', '', 0);
      token.content = tex;
    }
    state.pos = end + endDelimiter.length;
    return true;
  });
  md.block.ruler.before('fence', 'latex_display', (state, start, end, silent) => {
    const first = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]);
    const opening = first.startsWith('$$') ? '$$' : first.startsWith('\\[') ? '\\[' : null;
    if (!opening) return false;
    const delimiter = opening === '$$' ? '$$' : '\\]';
    const lines = [];
    let final = start, found = false;
    for (; final < end; final++) {
      const current = final === start ? first.slice(opening.length) : state.src.slice(state.bMarks[final] + state.tShift[final], state.eMarks[final]);
      const at = delimiter === '$$' ? closing(current, delimiter, 0) : current.indexOf(delimiter);
      if (at !== -1) {
        if (current.slice(at + delimiter.length).trim()) return false;
        lines.push(current.slice(0, at)); found = true; break;
      }
      lines.push(current);
    }
    if (!found) return false;
    if (silent) return true;
    const token = state.push('math_block', '', 0);
    token.block = true; token.content = lines.join('\n').trim(); token.map = [start, final + 1];
    state.line = final + 1;
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.renderer.rules.math_inline = (tokens, i) => engine.renderToString(tokens[i].content, { displayMode: false });
  md.renderer.rules.math_display_inline = (tokens, i) => engine.renderToString(tokens[i].content, { displayMode: true });
  md.renderer.rules.math_block = (tokens, i) => `<div class="math-block">${engine.renderToString(tokens[i].content, { displayMode: true })}</div>\n`;
}
