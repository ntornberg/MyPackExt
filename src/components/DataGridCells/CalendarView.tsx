import { Box } from '@mui/material';
import Scheduler, { type SchedulerTypes } from 'devextreme-react/scheduler';
import { getCacheCategory, type CacheEntry } from '../../cache/CourseRetrieval';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import { AppLogger } from '../../utils/logger';
import { useState } from 'react';
const views: SchedulerTypes.ViewType[] = ['week'];


const DayOfWeek : Record<string, string> = {
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
  
const CustomAppointment = ({ data, ...restProps }: { data: SchedulerTypes.Appointment & { template?: React.ComponentType<any> } }) => (
    <div
      {...restProps}
      style={{
        backgroundColor: data.color,
        color: '#fff',
        borderRadius: '4px',
        padding: '5px',
      }}
    >
      {data.text}
    </div>
  );
  
export const CalendarView  = async (params: GridRenderCellParams) => {
    // @ts-ignore
    const { dayTime, course_title } = params.row;
    const courses : Promise<Record<string, CacheEntry> | null> = getCacheCategory('scheduleTableData') || [];
    // M W 1:30 PM - 2:45 PM
    let data : Record<string, CacheEntry> | null = null;
    let appointment_list : SchedulerTypes.Appointment[] = [];
    const [appointments, setAppointments] = useState<SchedulerTypes.Appointment[]>(appointment_list);
    if(courses){
        data = await courses;
    }
    if(dayTime){
        const time_array = dayTime.split(' ');
        let meeting_days = [];
        let start_time = '';
        let end_time = '';

        for(const [index, item] of time_array.entries()){
                if(item === 'M' || item === 'T' || item === 'W' || item === 'Th' || item === 'F' || item === 'Sa' || item === 'Su'){
                    switch(item){
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
                            
                    }
                }
                else{
                    if(index+4 < time_array.length){
                        start_time = `${item} ${time_array[index + 1]}`;
                        end_time = `${time_array[index + 3]} ${time_array[index + 4]}`;
                        break;
                    }
                }


            
        }
        let startDate = new Date(`${DayOfWeek[meeting_days[0]]} ${start_time}`);
        let endDate = new Date(`${DayOfWeek[meeting_days[0]]} ${end_time}`);
        let recurrRule = meeting_days.join(',');
        let recurrRuleStr = `FREQ=WEEKLY;BYDAY=${recurrRule}`;
        let appointment : SchedulerTypes.Appointment = {
            startDate: startDate,
            endDate: endDate,
            recurrenceRule: recurrRuleStr,
            startDateTimeZone: "America/New_York",
            endDateTimeZone: "America/New_York",
            allDay: false,
            text: course_title,
            title: course_title,
            color: 'green',
        }
        appointment_list.push(appointment);
        
    }

    if(data){
        for(const course of Object.values(data)){
            AppLogger.info(course);
            AppLogger.info(course.combinedData);
           let schedule_entry : ScheduleTableEntry | null
            if (typeof course.combinedData !== 'string') {
                schedule_entry = course.combinedData as unknown as ScheduleTableEntry;
              }else{
                schedule_entry = null;
              }
            if(schedule_entry && schedule_entry.section_details){
                for(const section of schedule_entry.section_details){
                    let recurrRule = []
                    
                    if(section.meet_days && section.time){
                        for(const day of section.meet_days.split('/')){
                            switch(day){
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
                        let section_type = section.type;
                        let startTime = section.time.split('-')[0].trim();
                        let endTime = section.time.split('-')[1].trim();
                        let startDay = new Date(`${DayOfWeek[recurrRule[0]]} ${startTime}`);
                        let endDay = new Date(`${DayOfWeek[recurrRule[0]]} ${endTime}`);
                        let recurrRuleDays = recurrRule.join(',');
                        let recurrRuleStr = `FREQ=WEEKLY;BYDAY=${recurrRuleDays}`;
                        let appointment : SchedulerTypes.Appointment = {
                            startDate: startDay,
                            startDateTimeZone: "America/New_York",
                            endDate: endDay,
                            endDateTimeZone: "America/New_York",
                            allDay: false,
                            text: `${schedule_entry.classs?.trim()} ${section_type?.trim()}`,
                            title: section.course_topic,
                            //description: section.description,
                            color: 'red',
                            recurrenceRule: recurrRuleStr,
                        }
                        appointment_list.push(appointment);
                        AppLogger.info(appointment);
                    }
                }
            }
        }
        setAppointments(appointment_list);

    }
    return (
        <Box sx={{ width: '100%', height: '100%' }}>
        <Scheduler
            dataSource={appointments}
            timeZone = "America/New_York"
            views={views}
            defaultCurrentView="day"
            startDayHour={6}
            endDayHour={24}
            defaultCurrentDate={new Date(DayOfWeek['MO'])}
            height='100%'
            appointmentComponent={CustomAppointment}
        >
        </Scheduler>
        </Box>
    );
};

