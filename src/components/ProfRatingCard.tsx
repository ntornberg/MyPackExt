import React from 'react';
import { GaugeComponent } from 'react-gauge-component';
import { useAutoSize } from '../hooks/useAutoSize';
import type {MatchedRateMyProf} from '../types';

export const ProfRatingCard: React.FC<MatchedRateMyProf> = ({
    master_name,
    first_name,
    last_name,
    avgRating,
}) => {
    // fall back to 0.0 when API returns null / undefined
    const rating = parseFloat((avgRating ?? 0.0).toString());

    const displayName =
        `${first_name ?? ''} ${last_name ?? ''}`.trim() || master_name;

    // measure card width so we can scale the gauge
    const [wrapRef, {w}] = useAutoSize();
    const gaugeW = w * 0.9;          // leave a little padding

    return (
        <div
            ref={wrapRef}
            style={{
                /* let the flexbox size the card */
                flex: '1 1 200px',   // may shrink down to 200 px
                width: 'auto',
                maxWidth: 420,

                margin: '.5rem',
                padding: '.25rem',
                background: '#fff',
                boxShadow: '0 0 8px rgba(0,0,0,.2)',
                borderRadius: 8,
                fontSize: 14,
            }}
        >
            <h3 style={{margin: '.25rem 0 .5rem'}}>
                RateMyProfessor&nbsp;Score&nbsp;for:
            </h3>
            <p style={{margin: 0}}>
                <strong>Name:</strong> {displayName}
            </p>

            {/* Gauge scales only through this wrapper's CSS width */}
            <div style={{width: gaugeW, maxWidth: '100%', margin: '0 auto'}}>
                <GaugeComponent
                    type="semicircle"
                    value={rating}
                    minValue={0}
                    maxValue={5}
                    arc={{
                        width: 0.2,
                        padding: 0.005,
                        cornerRadius: 1,
                        gradient: true,
                        subArcs: [
                            {limit: 1, color: '#B22222', showTick: true},
                            {limit: 2, color: '#FF8C00', showTick: true},
                            {limit: 3, color: '#FFD700', showTick: true},
                            {limit: 4, color: '#9ACD32', showTick: true},
                            {color: '#228B22'},           // final arc (4 → 5)
                        ],
                    }}
                    pointer={{
                        color: '#000000',
                        length: 0.8,
                        width: 15,
                    }}
                    labels={{
                        valueLabel: {hide: true},
                        tickLabels: {
                            type: 'outer',
                            defaultTickValueConfig: {style: {fontSize: 10}},
                            ticks: [{value: 1}, {value: 2}, {value: 3}, {value: 4}],
                        },
                    }}
                />
            </div>

            <p style={{color: '#666', marginTop: '.5rem'}}>
                <strong>Average Rating:</strong> {rating.toFixed(2)} / 5
            </p>
        </div>
    );
};
