import { checkFile } from './check.js';
import { writeHookOutput } from '../../shared/serialize.js';

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
  if (result.hasIssue) {
    writeHookOutput({
      decision: 'block',
      reason: `Found unresolved markers: ${result.matches.slice(0, 3).join(', ')}`,
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `Please resolve TODO/FIXME comments in ${filePath} before proceeding.`,
      },
    });
  } else {
    writeHookOutput({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: '' } });
  }
}

main().catch((e) => { console.error(e); process.exit(0); });
