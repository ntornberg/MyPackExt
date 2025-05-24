import {Box} from '@mui/material';



import {getCacheCategory} from '../../cache/CourseRetrieval';
import type {GridRenderCellParams} from '@mui/x-data-grid';
import {useState, useEffect} from 'react';

import CreateCalender, { toMinutes } from './CalenderResizeListener';


type ScheduleTableEntry = {
    DT_RowId: string | null;
    career: string | null;
    classs: string | null;
    crse_grade: string | null;
    crse_id: string | null;
    crse_offer_nbr: string | null;
    crse_title: string | null;
    description: string | null;
    enrl_status: string | null;
    enroll_class_nbr: string | null;
    eventid: string | null;
    grade_basis: string | null;
    grade_basis_enrl: string | null;
    instructor_id: string | null;
    section_details: {
        building_address: string | null;
        class_nbr: string | null;
        class_notes: string[] | null;
        course_topic: string | null;
        dates: string | null;
        facility: string | null;
        instr_mode: string | null;
        instructors: string[] | null;
        location: string | null;
        meet_days: string | null;
        section: string | null;
        time: string | null;
        type: string | null;
    }[] | null;
    session: string | null;
    units: string | null;
    waitlist_position: string | null;
    waitlist_total: string | null;
};

export interface ScheduleEvent {
  id: number;
  subj: string;
  start: string;
  end: string;
  days: {day : string, isOverlapping : boolean}[];
  color: string;
}


export const CalendarView = (params: GridRenderCellParams) => {
    // @ts-ignore
    const {dayTime, courseData} = params.row;

    const [eventData, setEventData] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const courses = await getCacheCategory('scheduleTableData');
                const events: ScheduleEvent[] = [];
                let eventId = 1;

                if (courses) {
                    // Handle dayTime event
                    if (dayTime) {
                        const time_array = dayTime.split(' ');
                        const meeting_days: string[] = [];
                        let start_time = '';
                        let end_time = '';

                        for (const [index, item] of time_array.entries()) {
                            if (['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].includes(item)) {
                                switch (item) { 
                                    case 'M':
                                        meeting_days.push('Mon');
                                        break;
                                    case 'T':
                                        meeting_days.push('Tue');
                                        break;
                                    case 'W':
                                        meeting_days.push('Wed');
                                        break;
                                    case 'Th':
                                        meeting_days.push('Thu');
                                        break;
                                    case 'F':
                                        meeting_days.push('Fri');
                                        break;
                                 
                                }
                            } else if (index + 4 < time_array.length) {
                                start_time = `${item} ${time_array[index + 1]}`;
                                end_time = `${time_array[index + 3]} ${time_array[index + 4]}`;
                                break;
                            }
                        }

                        if (meeting_days.length > 0 && start_time && end_time) {
                         
                            

                            events.push({
                                id: eventId++,
                                subj: courseData.code,
                                start: start_time,
                                end: end_time,
                                days: meeting_days.map((dayValue) => { return {day: dayValue,isOverlapping: false}}),
                                color: '#2ECC71', // Green color
                            });
                        }
                    }

                    // Process course data
                    for (const course of Object.values(courses)) {
  

                        let schedule_entry: ScheduleTableEntry | null = null;
                        if (typeof course.combinedData !== 'string') {
                            schedule_entry = course.combinedData as unknown as ScheduleTableEntry;
                        }

                        if (schedule_entry?.section_details) {
                            for (const section of schedule_entry.section_details) {
                                if (section.meet_days && section.time) {
                                    const recurrRule: string[] = [];

                                    for (const day of section.meet_days.split('/')) {
                                        switch (day.trim()) {
                                            case 'Mon':
                                                recurrRule.push('Mon');
                                                break;
                                            case 'Tue':
                                                recurrRule.push('Tue');
                                                break;
                                            case 'Wed':
                                                recurrRule.push('Wed');
                                                break;
                                            case 'Thu':
                                                recurrRule.push('Thu');
                                                break;
                                            case 'Fri':
                                                recurrRule.push('Fri');
                                                break;
                                      
                                        }
                                    }

                                    if (recurrRule.length > 0) {
                                        const [startTime, endTime] = section.time.split('-').map(t => t.trim());
                                
                                      
                                        const sectionType = section.type || 'Section';
                                        const subject = `${schedule_entry.classs?.trim() || ''} ${sectionType}`.trim();
                  
                                        events.push({
                                            id: eventId++,
                                            subj: subject,
                                            start: startTime,
                                            end: endTime,
                                            days: recurrRule.map((dayValue) => { return {day: dayValue,isOverlapping: false}}),
                                            color: '#E74C3C', // Red color
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                for (let i = 0; i < events.length; i++) {
                    for (let j = i + 1; j < events.length; j++) {
                      const eventA = events[i];
                      const eventB = events[j];
                 
                      if (
                        toMinutes(eventA.start) < toMinutes(eventB.end) &&
                        toMinutes(eventA.end) > toMinutes(eventB.start)
                      ) {
                        const daysA = Object.fromEntries(eventA.days.map(day => [day.day, true]));
                        const daysB = Object.fromEntries(eventB.days.map(day => [day.day, true]));
                  
                        // Mark overlaps for both events, only on shared days
                        eventA.days = eventA.days.map(day =>
                          daysB[day.day] ? { ...day, isOverlapping: true } : day
                        );
                        eventB.days = eventB.days.map(day =>
                          daysA[day.day] ? { ...day, isOverlapping: true } : day
                        );
                      }
                    }
                  }
                  
                
                setEventData(events);
            } catch (error) {
                console.error('Error fetching schedule data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dayTime, courseData]); // Add dependencies that should trigger refetch

    if (isLoading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <Box sx={{width: '100%', height: '100%'}}>
            <CreateCalender eventData={eventData} />
        </Box>
    );
};
