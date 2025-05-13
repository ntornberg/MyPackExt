import React from 'react';
import {PieChart, pieArcLabelClasses} from '@mui/x-charts/PieChart';
import { useAutoSize } from '../hooks/useAutoSize';
import type {GradeData} from '../types';

export const GradeCard: React.FC<GradeData> = (props) => {
    const {
        courseName, instructorName,
        aAverage, bAverage, cAverage, dAverage, fAverage,
        classAverageMin, classAverageMax
    } = props;

    const [wrapRef, {w, h}] = useAutoSize();          // 👈 observe width
    const total = aAverage + bAverage + cAverage + dAverage + fAverage;
    if (!total) return null;                            // skip empty cards

    const colors = ['#2ecc71', '#a3e635', '#facc15', '#f97316', '#ef4444'];

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
                Historical grade data for <strong>{courseName}</strong> with:
            </h3>
            <p style={{margin: 0}}>
                <strong>Instructor:</strong> {instructorName}
            </p>

            <PieChart
                width={w}                 // 👈 live width / height
                height={h}
                hideLegend
                series={[{
                    outerRadius: '90%',
                    arcLabelRadius: '50%',
                    paddingAngle: 0,
                    arcLabel: ({id, value}) =>
                        `${id}: ${(value / total * 100).toFixed(0)}%`,
                    arcLabelMinAngle: 15,
                    data: [
                        {id: 'A', value: aAverage, label: 'A', color: colors[0]},
                        {id: 'B', value: bAverage, label: 'B', color: colors[1]},
                        {id: 'C', value: cAverage, label: 'C', color: colors[2]},
                        {id: 'D', value: dAverage, label: 'D', color: colors[3]},
                        {id: 'F', value: fAverage, label: 'F', color: colors[4]},
                    ],
                }]}
                sx={{[`& .${pieArcLabelClasses.root}`]: {fontWeight: 'bold'}}}
            />

            <h4 style={{color: '#666', margin: '.5rem 0 0'}}>
                Class Avg Range:&nbsp;
                <strong>{classAverageMin}% – {classAverageMax}%</strong>
            </h4>
        </div>
    );
};
