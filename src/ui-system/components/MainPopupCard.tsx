import {useCallback, useMemo, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

import {
    Box,
    Button,
    Dialog,
    Tab,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import AppTheme from '../themes/AppTheme';
import { GEPDataInitialState, type CourseSearchData, type PlanSearchData, type GEPData } from '../../course-management/components/TabDataStore/TabData';
import { PlanSearchDataInitialState } from '../../course-management/components/TabDataStore/TabData';
import { CourseSearchDataInitialState } from '../../course-management/components/TabDataStore/TabData';
import CourseSearch from '../../course-management/components/SearchTabs/CourseSearch';
import GEPSearch from '../../course-management/components/SearchTabs/GEPSearch';
import PlanSearch from '../../course-management/components/SearchTabs/PlanSearch';

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

/**
 * Root UI component hosting the three search tabs inside a dialog mounted in the overlay container.
 */
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
                        id="course-search-dialog"
                        slotProps={{
                            paper: {
                              sx: {
                                height: '90vh',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                backgroundImage: `radial-gradient(80% 80% at 50% -15%, rgb(0, 41, 82), transparent)`,
                                backgroundColor: "rgb(5, 7, 10)", // fallback for the rest of the dialog
                                boxShadow: `0 0 10px 4px rgba(33, 150, 243, 0.6)`,
                                color: "white",
                                border: "2px solid black",
                                borderRadius: 2,
                             
                            },
                        }}}
                    >
                        <Box sx={{ 
                            width: '100%', 
                            p: 2,
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0
                        }}>
                            <TabContext value={selectedTab}>
                                <TabList onChange={handleTabChange}>
                                    <Tab value="0" label="Course Search" />
                                    <Tab value="1" label="GEP Search" />
                                    <Tab value="2" label="Major Search" />
                                </TabList>
                            </TabContext>
                        </Box>
                        
                        <Box 
                            id="dialog-scroll-container"
                            sx={{ 
                                flexGrow: 1,
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <TabContext value={selectedTab}>
                                <TabPanel value="0" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                                    {tabContent.courseSearch}
                                </TabPanel>
                                <TabPanel value="1" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                                    {tabContent.gepSearch}
                                </TabPanel>
                                <TabPanel value="2" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                                    {tabContent.planSearch}
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Dialog>
                </Box>
            </AppTheme>
    );
}
