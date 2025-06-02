import React from 'react';
import {PieChart, pieArcLabelClasses} from '@mui/x-charts/PieChart';

import type {GradeData} from '../../types/DataBaseResponses/SupaBaseResponseType';
import { useAutoSize } from '../../../core/hooks/useAutoSize';

export const GradeCard: React.FC<GradeData> = (props) => {
    const {a_average, b_average, c_average, d_average, f_average,
        class_avg_min, class_avg_max
    } = props;

    const [wrapRef, {w, h}] = useAutoSize();
    const total = a_average + b_average + c_average + d_average + f_average;
    if (!total) return null;

    const colors = ['#2ecc71', '#a3e635', '#facc15', '#f97316', '#ef4444'];

    return (
        <div
            ref={wrapRef}
            style={{
                flex: '1 1 200px',  
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
            <h4 style={{margin: '.25rem 0 .5rem'}}>
                Historical grade data:
            </h4>


            <PieChart
                width={w}
                height={h}
                hideLegend
                series={[{
                    outerRadius: '90%',
                    arcLabelRadius: '80%',
                    paddingAngle: 0,
                    arcLabel: ({id, value}) =>
                        `${id}: ${(value / total * 100).toFixed(0)}%`,
                    arcLabelMinAngle: 15,
                    data: [
                        {id: 'A', value: a_average, label: 'A', color: colors[0]},
                        {id: 'B', value: b_average, label: 'B', color: colors[1]},
                        {id: 'C', value: c_average, label: 'C', color: colors[2]},
                        {id: 'D', value: d_average, label: 'D', color: colors[3]},
                        {id: 'F', value: f_average, label: 'F', color: colors[4]},
                    ],
                }]}
                sx={{[`& .${pieArcLabelClasses.root}`]: {fontWeight: 'bold'}}}
            />

            <h4 style={{color: '#666', margin: '.5rem 0 0', textAlign: 'center'}}>
                Class Average &nbsp;
                <strong>{class_avg_min}% – {class_avg_max}%</strong>
            </h4>
        </div>
    );
};
