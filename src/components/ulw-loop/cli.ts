import { parseSteer, enforceGoalBudget } from './steer.js';
import { writeHookOutput, exitCodeForHookOutput } from '../../shared/serialize.js';

async function main() {
  const event = process.argv[3];
  let raw = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) raw += chunk;
  const payload = raw ? JSON.parse(raw) : {};

  const output =
    event === 'user-prompt-submit'
      ? parseSteer(payload)
      : event === 'pre-tool-use'
        ? enforceGoalBudget(payload)
        : { hookSpecificOutput: { hookEventName: event ?? '', additionalContext: '' } };
  writeHookOutput(output);
  process.exit(exitCodeForHookOutput(output));
}

main().catch((e) => { console.error(e); process.exit(0); });
