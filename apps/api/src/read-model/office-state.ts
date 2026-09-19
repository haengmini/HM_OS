import type { OfficeStatusEvent } from '@hm-os/contracts';
import type { AdapterConfig } from '../adapters/config.js';
import { readSystemSnapshot, toOfficeStatusEvent as systemToEvent } from '../adapters/system-adapter.js';
import {
  readAgentOsProfiles,
  toOfficeStatusEvents as agentOsToEvents,
} from '../adapters/agent-os-adapter.js';
import { readRecentWikiNotes, toOfficeStatusEvent as wikiToEvent } from '../adapters/wiki-adapter.js';
import {
  readRecentDocuments,
  toOfficeStatusEvent as recentDocsToEvent,
} from '../adapters/recent-documents-adapter.js';

/**
 * Aggregates all Milestone 2 adapters into a single normalized event
 * list for the office read-model / WebSocket stream. Each adapter is
 * isolated with try/catch so one failing source degrades to a single
 * 'offline'/'unknown' event instead of crashing the whole snapshot —
 * per docs/architecture/DATA_SOURCES.md.
 */
export async function collectOfficeStatusEvents(config: AdapterConfig): Promise<OfficeStatusEvent[]> {
  const observedAt = new Date();
  const results = await Promise.allSettled([
    readSystemSnapshot().then((s) => [systemToEvent(s, observedAt)]),
    readAgentOsProfiles(config.profilesDir, config.kanbanBoardsDir).then((profiles) =>
      agentOsToEvents(profiles, observedAt),
    ),
    readRecentWikiNotes(config.wikiRoot).then((notes) => [
      wikiToEvent(notes, config.staleAfterMs, observedAt),
    ]),
    readRecentDocuments(config.recentDocRoots).then((docs) => [
      recentDocsToEvent(docs, config.staleAfterMs, observedAt),
    ]),
  ]);

  const events: OfficeStatusEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
    // A rejected adapter is silently omitted from this snapshot rather
    // than surfaced as a fabricated event, because we cannot attribute
    // it to a specific entityId here. Adapters are expected to catch
    // their own per-item errors internally (see agent-os-adapter.ts);
    // a rejection at this level means a systemic problem (e.g. the
    // whole adapter module throwing), which is logged by the caller.
  }
  return events;
}
