import type { CSSProperties } from 'react';
import type { OfficeStatusEvent } from '@hm-os/contracts';
import { colorForState, labelForState, opacityForConfidence } from './roomLayout.js';

export interface AgentTileProps { event: OfficeStatusEvent; index?: number }

const PALETTES = [
  ['#f7c59f', '#4f46e5', '#312e81'],
  ['#d8b4fe', '#0f766e', '#134e4a'],
  ['#fcd34d', '#be123c', '#881337'],
  ['#93c5fd', '#7c3aed', '#4c1d95'],
  ['#86efac', '#c2410c', '#7c2d12'],
] as const;

function paletteFor(id: string) {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length] ?? PALETTES[0];
}

/** A CSS-only pixel character driven by a real OfficeStatusEvent. */
export function AgentTile({ event, index = 0 }: AgentTileProps) {
  const color = colorForState(event.state);
  const opacity = opacityForConfidence(event.confidence);
  const [skin, shirt, pants] = paletteFor(event.entityId);

  return (
    <article
      className="hm-os-agent-tile"
      style={{
        '--tile-color': color,
        '--skin-color': skin,
        '--shirt-color': shirt,
        '--pants-color': pants,
        '--agent-delay': `${(index % 6) * -0.35}s`,
        opacity,
      } as CSSProperties}
      title={event.detail ?? labelForState(event.state)}
      data-source={event.source}
      data-entity-id={event.entityId}
      data-state={event.state}
    >
      <div className="hm-os-agent-stage" aria-hidden="true">
        <div className="hm-os-agent-shadow" />
        <div className="hm-os-pixel-character">
          <span className="hm-os-character-hair" />
          <span className="hm-os-character-head"><i /><b /></span>
          <span className="hm-os-character-body" />
          <span className="hm-os-character-arm hm-os-character-arm-left" />
          <span className="hm-os-character-arm hm-os-character-arm-right" />
          <span className="hm-os-character-leg hm-os-character-leg-left" />
          <span className="hm-os-character-leg hm-os-character-leg-right" />
        </div>
        <div className="hm-os-agent-prop">
          <span className="hm-os-prop-screen" />
          <span className="hm-os-prop-base" />
        </div>
        <div className="hm-os-agent-state-pip" />
      </div>
      <div className="hm-os-agent-copy">
        <strong className="hm-os-agent-tile-label">{event.entityId}</strong>
        <span className="hm-os-agent-tile-state">{labelForState(event.state)}</span>
      </div>
      {event.detail && <div className="hm-os-agent-speech">{event.detail}</div>}
    </article>
  );
}
