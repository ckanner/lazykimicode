// Shell-like argument splitter that respects single/double quotes and backslash
// escapes, so paths or flags containing spaces can be passed via OMO_KIMI_LSP_ARGS.
export function parseLspArgs(raw: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuote: '"' | "'" | null = null;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
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
