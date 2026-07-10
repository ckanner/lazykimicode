import { checkFile } from './check.js';
import { writeHookOutput, exitCodeForHookOutput } from '../../shared/serialize.js';

async function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) raw += chunk;
  const payload = raw ? JSON.parse(raw) : {};
  const filePath = payload.toolInput?.path ?? payload.toolInput?.file_path;
  if (!filePath || typeof filePath !== 'string') {
    writeHookOutput({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: '' } });
    return;
  }
  const result = checkFile(filePath);
  const output = result.hasIssue
    ? {
        decision: 'block' as const,
        reason: `Found unresolved markers: ${result.matches.slice(0, 3).join(', ')}`,
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: `Please resolve TODO/FIXME comments in ${filePath} before proceeding.`,
        },
      }
    : { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: '' } };
  writeHookOutput(output);
  process.exit(exitCodeForHookOutput(output));
}

main().catch((e) => { console.error(e); process.exit(0); });
