# Plan 011: Users Connect Their Own VM for Agents

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before you start the
> next step. If a "STOP conditions" item occurs, stop and report. Do not
> improvise. When done, set the state of this plan in `plans/README.md`.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Category**: feature
- **Planned at**: 2026-11-07
- **State**: IN PROGRESS

## Why this matters

OpenBot runs agents on a machine. Today that machine is the local desktop, an
OpenBot-hosted boat VM, or a self-hosted server that the user runs. A user who
wants agents on a VM they own has no first-class flow to connect that VM.

## Decision

- Build Option 2: a new user flow to connect an existing VM as the agent host.
- Cover all transport types for Option C: SSH, container, and the full VM via
  the OpenBot server (the self-hosted server case).

## Goal

A user connects their own VM and agents run there.

## Non-goals

- Multi-tenant isolation redesign.
- New billing model.


## Current state

- Local agent execution host: the local process. Provider drivers create the
  client, `AgentClient` owns start/stop, ACP speaks stdio.
- Hosted VM: OpenBot-managed boat VM. Account server creates the VM, sends a
  claim, the VM redeems it and publishes a host.
- Self-hosted VM: the user runs the OpenBot server on their VM; agents run there.

No user-VM execution host kind or transport exists yet.

## Target design

- Agent execution host kinds: `local`, `hosted`, `user-vm`.
- User-VM transports: `ssh`, `container`.
- User-VM host lifecycle: stop/start.

## Phases

### Phase 1: User-VM host foundation

1. Add the user-VM agent host kind and carry it through the provider client
   context.
2. Keep the local host as the default.
3. Verify with `bun run typecheck:node`.

### Phase 2: User-VM agent client

1. Add the ACP client that spawns the agent process on the VM over SSH.
2. Add the container variant.

### Phase 3: Host connection flow

1. Contracts and IPC types.
2. Main IPC handler.
3. Renderer UI.
4. i18n, docs, changelog.

### Phase 4: Transports

1. SSH.
2. Container.
3. Full VM via OpenBot server (already exists).

## Test plan

- `bun run typecheck:node` after Phase 1.
- `bun run typecheck:renderer` after Phase 3.
- `biome check --write --max-diagnostics=none <changed files>`.
- E2E script under `scripts/` if one exists for the host lifecycle.

## Done criteria

- [ ] Phase 1 foundation passes `bun run typecheck:node`.
- [ ] Phase 2 agent client spawns on the user VM.
- [ ] Phase 3 host connection flow is wired.
- [ ] Phase 4 transports are covered.

## STOP conditions

- The "Current state" items no longer match the code.
- The provider client context cannot carry the host without breaking drivers.
- The ACP client cannot spawn on a remote transport.

## Maintenance notes

- Any new per-agent state that a host exit must release needs a scoped end path.
- Reviewers check that each host-scoped call filters by host.

