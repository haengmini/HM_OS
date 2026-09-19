import type { CSSProperties } from 'react';
import type { OfficeStatusEvent } from '@hm-os/contracts';
import { colorForState, labelForState, opacityForConfidence } from './roomLayout.js';

export interface AgentTileProps {
  event: OfficeStatusEvent;
}

/**
 * A single pixel-art-style "agent desk" tile. Deliberately simple
 * (colored square + label) for the Milestone 3 MVP — sprite art and
 * animation are a post-V1 visual pass, not a blocker for a working
 * vertical slice.
 */
export function AgentTile({ event }: AgentTileProps) {
  const color = colorForState(event.state);
  const opacity = opacityForConfidence(event.confidence);

  return (
    <div
      className="hm-os-agent-tile"
      style={{ '--tile-color': color, opacity } as CSSProperties}
      title={event.detail ?? labelForState(event.state)}
      data-source={event.source}
      data-entity-id={event.entityId}
      data-state={event.state}
    >
      <div className="hm-os-agent-tile-avatar" aria-hidden="true" />
      <div className="hm-os-agent-tile-label">{event.entityId}</div>
      <div className="hm-os-agent-tile-state">{labelForState(event.state)}</div>
      {event.detail && <div className="hm-os-agent-tile-detail">{event.detail}</div>}
    </div>
  );
}
