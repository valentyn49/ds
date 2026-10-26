import { useId, useState } from 'react';
import { Button } from '../Button/Button';
import { RadioButton } from '../RadioButton/RadioButton';
import { Tooltip } from './Tooltip';
import '../../docs/tooltip-usage-example.css';

/** Relevant purchase-panel crop from Figma Snapshots 5276:1406 / panel 5276:1440. */
export function TooltipUsageExample() {
  const group = useId();
  const [premium, setPremium] = useState(false);
  return <div className="ds-tooltip-snapshot-example">
    <section className="ds-tooltip-snapshot-example__panel" aria-labelledby={`${group}-heading`}>
      <div className="ds-tooltip-snapshot-example__body">
        <div className="ds-tooltip-snapshot-example__header">
          <div className="ds-tooltip-snapshot-example__heading">
            <h3 id={`${group}-heading`}>Purchase New Snapshots Reports for this Market (requires MACs)</h3>
            <p>Optional - this is a one-time instant purchase using MACs, not recurring.</p>
          </div>
          <div className="ds-tooltip-snapshot-example__balance">
            <span>Current MAC Balance:</span><strong>0 MACs</strong>
            <a href="#" onClick={event => event.preventDefault()}>Purchase more MACs</a>
          </div>
        </div>
        <div className="ds-tooltip-snapshot-example__options" role="group" aria-label="Snapshot report options">
          <RadioButton name={`${group}-snapshot`} value="premium" checked={premium} onChange={() => setPremium(true)}
            title="Socrates Premium Snapshot - 3 MACs" subtitle="Includes D/W/M Reversals & Timing Arrays" />
          <div className="ds-tooltip-snapshot-example__unavailable">
            <RadioButton name={`${group}-snapshot`} value="enterprise" disabled
              title="Socrates Enterprise Snapshot - 10 MACs"
              subtitle={<>
                <Tooltip title="" type="top" className="ds-tooltip-snapshot-example__tooltip"
                  subtitle="You can’t choose Enterprise Snapshot, as this market does not have enough historical data for this version of the snapshot.">
                  <span tabIndex={0} className="ds-tooltip-snapshot-example__explanation">Includes D/W/M/Q/Y</span>
                </Tooltip>{' Reversals & Timing Arrays. Check '}
                <a href="#" onClick={event => event.preventDefault()}>data availability</a>
              </>} />
            <p className="ds-tooltip-snapshot-example__warning">Not have enough historical data.</p>
          </div>
        </div>
      </div>
      <Button variant="purchase" size={48}>Purchase</Button>
    </section>
  </div>;
}
