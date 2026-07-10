import { readBoulder, hasIncompleteWork } from './boulder.js';
import { writeHookOutput, exitCodeForHookOutput } from '../../shared/serialize.js';

async function main() {
  const event = process.argv[3];
  const projectDir = process.env.OMO_KIMI_PROJECT ?? process.cwd();
  const state = readBoulder(projectDir);
  const hookEventName = event === 'subagent-stop' ? 'SubagentStop' : 'Stop';
  const output = hasIncompleteWork(state)
    ? {
        decision: 'block' as const,
        reason: 'Active Boulder work is incomplete',
        hookSpecificOutput: {
          hookEventName,
          additionalContext: 'There is an active start-work plan. Finish it before stopping.',
        },
      }
    : { hookSpecificOutput: { hookEventName, additionalContext: '' } };
  writeHookOutput(output);
  process.exit(exitCodeForHookOutput(output));
}

main().catch((e) => { console.error(e); process.exit(0); });
