@.claude/skills/using-superpowers/SKILL.md

# Project Instructions

## Superpowers Skills

This project uses the Superpowers framework. All skills are available in `.claude/skills/`. Use the `Skill` tool to invoke them.

### Available Skills

| Skill | When to Use |
|-------|-------------|
| `using-superpowers` | Starting any conversation - establishes skill usage discipline |
| `brainstorming` | Before writing code for a new feature - design refinement |
| `writing-plans` | After brainstorming - break design into atomic tasks |
| `subagent-driven-development` | Executing plans with fresh subagent per task |
| `executing-plans` | Executing plans in current session (alternative to SDD) |
| `test-driven-development` | Writing any production code - RED-GREEN-REFACTOR |
| `requesting-code-review` | Between tasks - spec compliance and code quality review |
| `receiving-code-review` | Processing review feedback |
| `systematic-debugging` | Fixing bugs - root cause analysis before fixes |
| `verification-before-completion` | Before claiming work is done - run fresh verification |
| `using-git-worktrees` | Creating isolated workspaces for changes |
| `finishing-a-development-branch` | Branch completion - merge/PR/keep/discard |
| `dispatching-parallel-agents` | Dispatching parallel agents for independent work |
| `writing-skills` | Creating or improving skills |

### Key Principles

1. **Invoke skills BEFORE any response or action** — even a 1% chance is enough
2. **Design before code** — brainstorm first, plan second, execute third
3. **Test before implementation** — TDD is not optional
4. **Verify before declaring done** — evidence over confidence
5. **Review before merging** — spec compliance then code quality
