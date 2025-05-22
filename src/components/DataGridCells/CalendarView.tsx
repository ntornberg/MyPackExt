import {Box} from '@mui/material';
import {
    ScheduleComponent,
    Day,
    Week,
    WorkWeek,
    Month,
    Agenda,
    Inject,
    ViewsDirective,
    ViewDirective
} from '@syncfusion/ej2-react-schedule';
import {getCacheCategory} from '../../cache/CourseRetrieval';
import type {GridRenderCellParams} from '@mui/x-data-grid';
import {AppLogger} from '../../utils/logger';
import {useState, useEffect} from 'react';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-split-buttons/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';

const DayOfWeek: Record<string, string> = {
    MO: "2025-05-05",
    TU: "2025-05-06",
    WE: "2025-05-07",
    TH: "2025-05-08",
    FR: "2025-05-09",
}
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

interface EventSettingsModel {
    Id: number;
    Subject: string;
    StartTime: Date;
    EndTime: Date;
    IsAllDay: boolean;
    RecurrenceRule?: string;
    Description?: string;
    Location?: string;
    CategoryColor?: string;
}

export const CalendarView = (params: GridRenderCellParams) => {
    // @ts-ignore
    const {dayTime, course_title} = params.row;

    const [eventData, setEventData] = useState<EventSettingsModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courses = await getCacheCategory('scheduleTableData');
                const events: EventSettingsModel[] = [];
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
                                        meeting_days.push('MO');
                                        break;
                                    case 'T':
                                        meeting_days.push('TU');
                                        break;
                                    case 'W':
                                        meeting_days.push('WE');
                                        break;
                                    case 'Th':
                                        meeting_days.push('TH');
                                        break;
                                    case 'F':
                                        meeting_days.push('FR');
                                        break;
                                    case 'Sa':
                                        meeting_days.push('SA');
                                        break;
                                    case 'Su':
                                        meeting_days.push('SU');
                                        break;
                                }
                            } else if (index + 4 < time_array.length) {
                                start_time = `${item} ${time_array[index + 1]}`;
                                end_time = `${time_array[index + 3]} ${time_array[index + 4]}`;
                                break;
                            }
                        }

                        if (meeting_days.length > 0 && start_time && end_time) {
                            const startDate = new Date(`${DayOfWeek[meeting_days[0]]} ${start_time}`);
                            const endDate = new Date(`${DayOfWeek[meeting_days[0]]} ${end_time}`);
                            const recurrRule = `FREQ=WEEKLY;BYDAY=${meeting_days.join(',')}`;

                            events.push({
                                Id: eventId++,
                                Subject: course_title,
                                StartTime: startDate,
                                EndTime: endDate,
                                IsAllDay: false,
                                RecurrenceRule: recurrRule,
                                CategoryColor: '#2ECC71' // Green color
                            });
                        }
                    }

                    // Process course data
                    for (const course of Object.values(courses)) {
                        AppLogger.info(course);
                        AppLogger.info(course.combinedData);

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
                                                recurrRule.push('MO');
                                                break;
                                            case 'Tue':
                                                recurrRule.push('TU');
                                                break;
                                            case 'Wed':
                                                recurrRule.push('WE');
                                                break;
                                            case 'Thu':
                                                recurrRule.push('TH');
                                                break;
                                            case 'Fri':
                                                recurrRule.push('FR');
                                                break;
                                            case 'Sat':
                                                recurrRule.push('SA');
                                                break;
                                            case 'Sun':
                                                recurrRule.push('SU');
                                                break;
                                        }
                                    }

                                    if (recurrRule.length > 0) {
                                        const [startTime, endTime] = section.time.split('-').map(t => t.trim());
                                        const startDay = new Date(`${DayOfWeek[recurrRule[0]]} ${startTime}`);
                                        const endDay = new Date(`${DayOfWeek[recurrRule[0]]} ${endTime}`);
                                        const recurrRuleStr = `FREQ=WEEKLY;BYDAY=${recurrRule.join(',')}`;
                                        const sectionType = section.type || 'Section';
                                        const subject = `${schedule_entry.classs?.trim() || ''} ${sectionType}`.trim();

                                        events.push({
                                            Id: eventId++,
                                            Subject: subject,
                                            StartTime: startDay,
                                            EndTime: endDay,
                                            IsAllDay: false,
                                            RecurrenceRule: recurrRuleStr,
                                            Description: section.course_topic || undefined,
                                            CategoryColor: '#E74C3C' // Red color
                                        });
                                    }
                                }
                            }
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
    }, [dayTime, course_title]); // Add dependencies that should trigger refetch

    if (isLoading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <Box sx={{width: '100%', height: '500px'}}>
            <ScheduleComponent
                width='100%'
                height='100%'
                selectedDate={new Date(DayOfWeek['MO'])}
                eventSettings={{dataSource: eventData}}
                currentView='Week'
                startHour='06:00'
                endHour='24:00'
                timeScale={{interval: 60}}
                firstDayOfWeek={0}
            >
                <ViewsDirective>
                    <ViewDirective option='Day'/>
                    <ViewDirective option='Week'/>
                    <ViewDirective option='WorkWeek'/>
                    <ViewDirective option='Month'/>
                    <ViewDirective option='Agenda'/>
                </ViewsDirective>
                <Inject services={[Day, Week, WorkWeek, Month, Agenda]}/>
            </ScheduleComponent>
        </Box>
    );
};
