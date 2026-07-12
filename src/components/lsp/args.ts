// Shell-like argument splitter that respects single/double quotes and backslash
// escapes, so paths or flags containing spaces can be passed via LAZYKIMICODE_LSP_ARGS.
// Backslashes are kept literal unless they escape a quote, another backslash, or
// whitespace; this preserves Windows paths such as C:\Users\name\server.exe.
export function parseLspArgs(raw: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuote: '"' | "'" | null = null;
  let escaped = false;

  const isEscapable = (ch: string) => ch === '"' || ch === "'" || ch === '\\' || /\s/.test(ch);

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      const next = raw[i + 1];
      if (inQuote ? next === inQuote || next === '\\' : next !== undefined && isEscapable(next)) {
        escaped = true;
        continue;
      }
      // Backslash is not escaping anything special: treat it as a literal char.
    }
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        args.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }

  if (current) args.push(current);
  return args;
}
