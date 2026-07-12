import fs from 'node:fs';

const MARKERS = ['TODO', 'FIXME', 'HACK', 'XXX', 'BUG'];
const MARKER_RE = new RegExp(`\\b(${MARKERS.join('|')})\\b`, 'g');

export interface CheckResult {
  hasIssue: boolean;
  matches: string[];
}

interface StringRange {
  start: number;
  end: number;
}

// Finds all single-quoted, double-quoted, and template literal ranges in the
// content, handling escape sequences and `${...}` template interpolation.
export function findStringRanges(content: string): StringRange[] {
  const ranges: StringRange[] = [];
  let i = 0;
  while (i < content.length) {
    const quote = content[i];
    if (quote !== "'" && quote !== '"' && quote !== '`') {
      i++;
      continue;
    }
    const start = i;
    i++;
    let escaped = false;
    while (i < content.length) {
      const ch = content[i];
      if (escaped) {
        escaped = false;
        i++;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        i++;
        continue;
      }
      if (ch === quote) {
        ranges.push({ start, end: i });
        i++;
        break;
      }
      if (quote === '`' && ch === '$' && i + 1 < content.length && content[i + 1] === '{') {
        // Skip template interpolation, counting braces and handling nested strings.
        i += 2;
        let depth = 1;
        while (i < content.length && depth > 0) {
          const c = content[i];
          if (c === '{') {
            depth++;
            i++;
          } else if (c === '}') {
            depth--;
            i++;
          } else if (c === "'" || c === '"' || c === '`') {
            // Nested string literal inside interpolation.
            const nestedQuote = c;
            i++;
            let nestedEscaped = false;
            while (i < content.length) {
              const nc = content[i];
              if (nestedEscaped) {
                nestedEscaped = false;
                i++;
                continue;
              }
              if (nc === '\\') {
                nestedEscaped = true;
                i++;
                continue;
              }
              if (nc === nestedQuote) {
                i++;
                break;
              }
              i++;
            }
          } else {
            i++;
          }
        }
        continue;
      }
      i++;
    }
  }
  return ranges;
}

function isInsideString(ranges: StringRange[], offset: number): boolean {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ranges[mid];
    if (offset < r.start) hi = mid - 1;
    else if (offset > r.end) lo = mid + 1;
    else return true;
  }
  return false;
}

function findLineCommentStart(line: string, ranges: StringRange[], lineStartOffset: number): number {
  let start = -1;

  // Find the earliest '//' that is not preceded by ':' (avoids '://' in URLs)
  // and is not inside a string literal.
  let idx = -1;
  while (true) {
    const next = line.indexOf('//', idx + 1);
    if (next === -1) break;
    const globalOffset = lineStartOffset + next;
    if (line.charAt(next - 1) !== ':' && !isInsideString(ranges, globalOffset)) {
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
    const globalOffset = lineStartOffset + next;
    if (precededByBoundary && !isInsideString(ranges, globalOffset)) {
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
  const ranges = findStringRanges(content);
  const lines = content.split('\n');
  let inBlock = false;
  let blockStartLine = 0;
  let blockText = '';
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStartOffset = offset;
    const lineCommentStart = findLineCommentStart(line, ranges, lineStartOffset);

    if (inBlock) {
      const end = line.indexOf('*/');
      if (end !== -1 && !isInsideString(ranges, lineStartOffset + end)) {
        blockText += '\n' + line.slice(0, end);
        comments.push({ text: blockText, line: blockStartLine + 1 });
        blockText = '';
        inBlock = false;
      } else {
        blockText += '\n' + line;
      }
      offset += line.length + 1;
      continue;
    }

    // HTML block comment start/end on same line
    for (const htmlMatch of line.matchAll(/<!--(.*?)-->/g)) {
      if (!isInsideString(ranges, lineStartOffset + htmlMatch.index!)) {
        comments.push({ text: htmlMatch[1], line: i + 1 });
      }
    }

    // C-style block comment start. Ignore a `/*` that is inside a line comment
    // (e.g. `// /* TODO`) or inside a string literal.
    const start = line.indexOf('/*');
    let blockStart = -1;
    let blockEnd = -1;
    if (
      start !== -1 &&
      !isInsideString(ranges, lineStartOffset + start) &&
      (lineCommentStart === -1 || start < lineCommentStart)
    ) {
      const end = line.indexOf('*/', start + 2);
      if (end !== -1 && !isInsideString(ranges, lineStartOffset + end)) {
        comments.push({ text: line.slice(start + 2, end), line: i + 1 });
        blockStart = start;
        blockEnd = end;
      } else {
        inBlock = true;
        blockStartLine = i;
        blockText = line.slice(start + 2);
        offset += line.length + 1;
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
        offset += line.length + 1;
        continue;
      }
      const markerLen = line.charAt(lineCommentStart) === '/' ? 2 : 1;
      comments.push({ text: line.slice(lineCommentStart + markerLen), line: i + 1 });
    }
    offset += line.length + 1;
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
