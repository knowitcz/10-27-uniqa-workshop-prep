// PreToolUse guard for the prod-reviewer subagent: the only shell command it may
// run is the read-only delivery-analysis script. Everything else is denied.
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const command = JSON.parse(input).tool_input?.command?.trim() ?? '';
  const allowed = /^node \.claude\/skills\/analyse-delivery\/scripts\/analyse-delivery\.mjs( --tests| [\w~^./-]+)?$/.test(command);
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: allowed ? 'allow' : 'deny',
      permissionDecisionReason: allowed ? 'the read-only analysis script' : 'prod-reviewer may only run the analyse-delivery script',
    },
  }));
});
