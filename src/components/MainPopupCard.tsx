import { useState } from 'react';
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
    
    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    return (
        <CacheProvider value={myEmotionCache}>
            <AppTheme>
                <CssBaseline enableColorScheme />
                <Box sx={{ p: 2, pointerEvents: 'auto' }}>
                    <Button variant='outlined' onClick={() => setDrawerOpen(true)}>Course Search</Button>

                    <Dialog 
                        fullWidth 
                        maxWidth='lg' 
                        open={drawerOpen} 
                        onClose={() => setDrawerOpen(false)} 
                      
                        // sx={(theme) => ({
                        //     '& .MuiDialog-paper': {
                        //         '--Paper-overlay': 'none',
                        //         borderRadius: '10px',
                        //         border: '1px solid',
                        //         borderColor: (theme.vars || theme).palette.divider,
                        //         backgroundColor: (theme.vars || theme).palette.background.paper,
                        //     },
                        // })} 
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
                            <Box sx={{ width: '100%', p: 2 }}>
                                <TabList onChange={handleTabChange}>
                                    <Tab value="0" label="Course Search" />
                                    <Tab value="1" label="GEP Search" />
                                    <Tab value="2" label="Major Search" />
                                </TabList>
                            </Box>
                            <TabPanel value="0">
                                <CourseSearch />
                            </TabPanel>
                            <TabPanel value="1">
                                <GEPSearch />
                            </TabPanel>
                            <TabPanel value="2">
                                <PlanSearch />
                            </TabPanel>
                        </TabContext>
                    </Dialog>
                </Box>
            </AppTheme>
        </CacheProvider>
    );
}
