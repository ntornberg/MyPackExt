import { useState, useCallback, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';

import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    Typography,
    Tab,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import AppTheme from '../themes/AppTheme';
import { CacheProvider } from '@emotion/react';
import { myEmotionCache } from '../content';
import CourseSearch from './SearchTabs/CourseSearch';
import PlanSearch from './SearchTabs/PlanSearch';
import GEPSearch from './SearchTabs/GEPSearch';
import { GEPDataInitialState, type CourseSearchData, type PlanSearchData, type GEPData } from './TabDataStore/TabData';
import { PlanSearchDataInitialState } from './TabDataStore/TabData';
import { CourseSearchDataInitialState } from './TabDataStore/TabData';
import React from 'react';

// Memoize tabs to prevent re-renders
const MemoizedCourseSearchTab = React.memo(({ setCourseSearchTabData, courseSearchData }: 
  { setCourseSearchTabData: (key: keyof CourseSearchData, value: any) => void; courseSearchData: CourseSearchData }) => (
  <CourseSearch setCourseSearchTabData={setCourseSearchTabData} courseSearchData={courseSearchData} />
));

const MemoizedGEPSearchTab = React.memo(({ setGepSearchTabData, gepSearchData }: 
  { setGepSearchTabData: (key: keyof GEPData, value: any) => void; gepSearchData: GEPData }) => (
  <GEPSearch setGepSearchTabData={setGepSearchTabData} gepSearchData={gepSearchData} />
));

const MemoizedPlanSearchTab = React.memo(({ setPlanSearchTabData, planSearchData }: 
  { setPlanSearchTabData: (key: keyof PlanSearchData, value: any) => void; planSearchData: PlanSearchData }) => (
  <PlanSearch setPlanSearchTabData={setPlanSearchTabData} planSearchData={planSearchData} />
));

export function CircularProgressWithLabel({ value }: { value: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={value} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function SlideOutDrawer() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("0");
    const [courseSearchData, setCourseSearchData] = useState(CourseSearchDataInitialState);
    const [planSearchData, setPlanSearchData] = useState(PlanSearchDataInitialState);
    const [gepSearchData, setGepSearchData] = useState(GEPDataInitialState);
    
    // Create stable references for all setter functions
    const setCourseSearchTabData = useCallback((key: keyof CourseSearchData, value: any) => {
        setCourseSearchData((prev) => ({ ...prev, [key]: value }));
    }, []);
    
    const setPlanSearchTabData = useCallback((key: keyof PlanSearchData, value: any) => {
      if(key === 'open'){
        setPlanSearchData((prevState) => ({
          ...prevState, 
          open: {
            ...prevState.open,
            [value]: !prevState.open[value]
          }
        }));
      } else {
        setPlanSearchData((prev) => ({ ...prev, [key]: value }));
      }
    }, []);
    
    const setGepSearchTabData = useCallback((key: keyof GEPData, value: any) => {
        setGepSearchData((prev) => ({ ...prev, [key]: value }));
    }, []);
    
    // Memoize all other handlers
    const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    }, []);

    const handleDrawerOpen = useCallback(() => {
        setDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    // Memoize the tab content to prevent re-renders when switching tabs
    const tabContent = useMemo(() => ({
        courseSearch: (
            <MemoizedCourseSearchTab 
                setCourseSearchTabData={setCourseSearchTabData} 
                courseSearchData={courseSearchData} 
            />
        ),
        gepSearch: (
            <MemoizedGEPSearchTab 
                setGepSearchTabData={setGepSearchTabData} 
                gepSearchData={gepSearchData} 
            />
        ),
        planSearch: (
            <MemoizedPlanSearchTab 
                setPlanSearchTabData={setPlanSearchTabData} 
                planSearchData={planSearchData} 
            />
        )
    }), [
        setCourseSearchTabData, courseSearchData,
        setGepSearchTabData, gepSearchData,
        setPlanSearchTabData, planSearchData
    ]);

    return (
        <CacheProvider value={myEmotionCache}>
            <AppTheme>
                <CssBaseline enableColorScheme />
                <Box sx={{ p: 2, pointerEvents: 'auto' }}>
                    <Button variant='outlined' sx={{
                       color: 'white',
                       backgroundColor: 'rgb(11, 14, 20) !important',
                       borderColor: 'rgb(51, 60, 77) !important',
                       backgroundImage: 'none !important',
                       fontSize: {
                         xs: '0.7rem',
                         sm: '0.8rem',
                         md: '0.875rem',
                       },
                       '&:hover': {
                         backgroundColor: 'rgb(20, 25, 35) !important',
                       },
                    }}  onClick={handleDrawerOpen}>Course Search</Button>

                    <Dialog 
                        keepMounted={true}
                        fullWidth 
                        maxWidth='lg' 
                        open={drawerOpen} 
                        onClose={handleDrawerClose} 
                        slotProps={{
                            paper: {
                              sx: {
                                backgroundImage: `radial-gradient(80% 80% at 50% -15%, rgb(0, 41, 82), transparent)`,
                                backgroundColor: "rgb(5, 7, 10)", // fallback for the rest of the dialog
                                boxShadow: `0 0 10px 4px rgba(33, 150, 243, 0.6)`,
                              color: "white",
                              border: "2px solid black",
                              borderRadius: 2,
                             
                            },
                        }}}
                    >
                        <TabContext value={selectedTab}>
                            <Box sx={{ 
                                width: '100%', p: 2 }}>
                                <TabList onChange={handleTabChange}>
                                    <Tab value="0" label="Course Search" />
                                    <Tab value="1" label="GEP Search" />
                                    <Tab value="2" label="Major Search" />
                                </TabList>
                            </Box>
                            <TabPanel value="0" keepMounted={true}>
                                {tabContent.courseSearch}
                            </TabPanel>
                            <TabPanel value="1" keepMounted={true}>
                                {tabContent.gepSearch}
                            </TabPanel>
                            <TabPanel value="2" keepMounted={true}>
                                {tabContent.planSearch}
                            </TabPanel>
                        </TabContext>
                    </Dialog>
                </Box>
            </AppTheme>
        </CacheProvider>
    );
}
