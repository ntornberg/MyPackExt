import { Box } from '@mui/material';
import Scheduler, { type SchedulerTypes } from 'devextreme-react/scheduler';
import { getCacheCategory, type CacheEntry } from '../../cache/CourseRetrieval';
import type { GridRenderCellParams } from '@mui/x-data-grid';
const views: SchedulerTypes.ViewType[] = ['week'];
const currentDate = new Date(2025, 5, 5);
export const CalenderView = async (params: GridRenderCellParams) => {
    // @ts-ignore
    const { dayTime } = params.row;
    const courses : Promise<Record<string, CacheEntry> | null> = getCacheCategory('scheduleCalEventsData') || [];
    // M W 1:30 PM - 2:45 PM
    let data : Record<string, CacheEntry> | null = null;
    if(courses){
        data = await courses;
    }
    return (
        <Box sx={{ width: '100%', height: '100%' }}>
        <Scheduler
            dataSource={data}
            timeZone = "America/New_York"
            views={views}
            defaultCurrentView="day"
            startDayHour={6}
            endDayHour={24}
            defaultCurrentDate={currentDate}
            height='100%'
        />
        </Box>
    );
};

