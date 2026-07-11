import fs from 'node:fs';

const MARKERS = ['TODO', 'FIXME', 'HACK', 'XXX', 'BUG'];
const MARKER_RE = new RegExp(`\\b(${MARKERS.join('|')})\\b`, 'g');

export interface CheckResult {
  hasIssue: boolean;
  matches: string[];
}

// Returns true if `index` in `line` falls inside a single- or double-quoted
// string literal on that line. This is a cheap heuristic; it does not track
// multi-line template literals or interpolated strings.
function isInsideString(line: string, index: number): boolean {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < index && i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    }
  }
  return inSingle || inDouble;
}

function findLineCommentStart(line: string): number {
  let start = -1;

  // Find the earliest '//' that is not preceded by ':' (avoids '://' in URLs)
  // and is not inside a string literal.
  let idx = -1;
  while (true) {
    const next = line.indexOf('//', idx + 1);
    if (next === -1) break;
    if (line.charAt(next - 1) !== ':' && !isInsideString(line, next)) {
      start = next;
      break;
    }
    idx = next;
  }

  // Find the earliest '#' that is at the start of the line or preceded by
  // whitespace, and is not inside a string literal.
  let hashIdx = -1;
  while (true) {
    const next = line.indexOf('#', hashIdx + 1);
    if (next === -1) break;
    const prev = next - 1;
    const precededByBoundary = prev < 0 || /\s/.test(line.charAt(prev));
    if (precededByBoundary && !isInsideString(line, next)) {
      if (start === -1 || next < start) {
        start = next;
      }
      break;
    }
    hashIdx = next;
  }

  return start;
}

function extractComments(content: string): Array<{ text: string; line: number }> {
  const comments: Array<{ text: string; line: number }> = [];
  const lines = content.split('\n');
  let inBlock = false;
  let blockStartLine = 0;
  let blockText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineCommentStart = findLineCommentStart(line);

    if (inBlock) {
      const end = line.indexOf('*/');
      if (end !== -1 && !isInsideString(line, end)) {
        blockText += '\n' + line.slice(0, end);
        comments.push({ text: blockText, line: blockStartLine + 1 });
        blockText = '';
        inBlock = false;
      } else {
        blockText += '\n' + line;
      }
      continue;
    }

    // HTML block comment start/end on same line
    for (const htmlMatch of line.matchAll(/<!--(.*?)-->/g)) {
      if (!isInsideString(line, htmlMatch.index!)) {
        comments.push({ text: htmlMatch[1], line: i + 1 });
      }
    }

    // C-style block comment start. Ignore a `/*` that is inside a line comment
    // (e.g. `// /* TODO`) or inside a string literal.
    const start = line.indexOf('/*');
    let blockStart = -1;
    let blockEnd = -1;
    if (start !== -1 && !isInsideString(line, start) && (lineCommentStart === -1 || start < lineCommentStart)) {
      const end = line.indexOf('*/', start + 2);
      if (end !== -1 && !isInsideString(line, end)) {
        comments.push({ text: line.slice(start + 2, end), line: i + 1 });
        blockStart = start;
        blockEnd = end;
      } else {
        inBlock = true;
        blockStartLine = i;
        blockText = line.slice(start + 2);
        continue;
      }
    }

    // Line comments. Split '//' and '#' handling: allow '//' after any
    // character except ':', and require '#' to start the line or follow
    // whitespace.
    if (lineCommentStart !== -1) {
      // Ignore a line-comment marker that is actually inside a same-line block
      // comment (e.g. `/* block // comment */`).
      if (blockStart !== -1 && blockEnd !== -1 && lineCommentStart > blockStart && lineCommentStart < blockEnd) {
        continue;
      }
      const markerLen = line.charAt(lineCommentStart) === '/' ? 2 : 1;
      comments.push({ text: line.slice(lineCommentStart + markerLen), line: i + 1 });
    }
  }
  return comments;
}

export function findStaleMarkers(content: string): Array<{ line: number; marker: string; text: string }> {
  const results: Array<{ line: number; marker: string; text: string }> = [];
  const seen = new Set<string>();
  const comments = extractComments(content);
  for (const comment of comments) {
    const matches = [...comment.text.matchAll(MARKER_RE)];
    for (const m of matches) {
      const key = `${comment.line}:${m[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ line: comment.line, marker: m[1], text: comment.text.trim() });
    }
  }
  return results;
}

export function checkFile(filePath: string): CheckResult {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const markers = findStaleMarkers(content);
    return { hasIssue: markers.length > 0, matches: markers.map((m) => m.marker) };
  } catch {
    return { hasIssue: false, matches: [] };
  }
}
