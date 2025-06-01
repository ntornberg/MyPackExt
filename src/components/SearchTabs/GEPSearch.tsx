import { Box, CircularProgress, FormControlLabel, ListItem, ListItemText, Typography, Checkbox} from "@mui/material";
import { Button, TextField, Autocomplete, List } from "@mui/material";
import { AppLogger } from "../../utils/logger";
import { useMemo, useCallback, useState } from "react";
import { fetchGEPCourseData } from "../../services/api/CourseSearch/dataService";
import { GEP_COURSES } from "../../Data/CourseSearch/gep_courses.typed";
import type { MergedCourseData } from "../../utils/CourseSearch/MergeDataUtil";
import { TermIdByName } from "../../Data/TermID";
import { OpenCourseSectionsColumn } from '../../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';
import type { RequiredCourse } from "../../types/Plans";
import { sortSections } from '../../types/DataGridCourse';
import { type GEPData } from "../TabDataStore/TabData";
import React from "react";
import { SubjectMenuValues } from "../../Data/SubjectSearchValues";

export function CircularProgressWithLabel({ value, label }: { value: number; label?: string }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
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
      {label && (
        <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: '200px' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

interface AutocompletesProps {
  selectedTerm: string | null;
  searchSubject: string | null;
  setGepSearchTabData: (key: keyof GEPData, value: any) => void;
}

// Memoize the term options to prevent recalculation
const TERM_OPTIONS = Object.keys(TermIdByName);

// Memoize the subject options to prevent recalculation  
const SUBJECT_OPTIONS = Object.keys(GEP_COURSES);

const MemoizedAutocompletes: React.FC<AutocompletesProps> = React.memo(({ 
  selectedTerm,
  searchSubject,
  setGepSearchTabData
}) => {
  const handleTermChange = useCallback((_: React.SyntheticEvent, value: string | null) => {
    setGepSearchTabData('selectedTerm', value);
  }, [setGepSearchTabData]);

  const handleSubjectChange = useCallback((_: React.SyntheticEvent, value: string | null) => {
    setGepSearchTabData('searchSubject', value);
  }, [setGepSearchTabData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Autocomplete
        sx={{ width: '100%' }}
        id="term_selector"
        options={TERM_OPTIONS}
        value={selectedTerm}
        defaultValue={TERM_OPTIONS[0]}
        onChange={handleTermChange}
        renderInput={(params) => 
          <TextField {...params} label="Term" />
        }
      />
      <Autocomplete
        sx={{ width: '100%' }}
        id="subject_selector"
        options={SUBJECT_OPTIONS}
        value={searchSubject}
        onChange={handleSubjectChange}
        renderInput={(params) => 
          <TextField {...params} label="Subject" />
        }
      />
    </Box>
  );
});

// Memoized DataGrid component to prevent unnecessary re-renders - MOVED OUTSIDE COMPONENT
const MemoizedDataGrid = React.memo(({ 
  sections,
  sortFunc 
}: { 
  sections: any[]; 
  sortFunc: (a: any, b: any) => number 
}) => (
  <DataGrid
    getRowId={(row) => row.id || row.classNumber || `${row.section}-${row.instructor_name?.[0] || ''}`}
    rows={sections.sort(sortFunc)}
    columns={OpenCourseSectionsColumn}
    columnVisibilityModel={{ id: false }}
    disableRowSelectionOnClick
    pageSizeOptions={[5, 10, 25]}
    initialState={{
      pagination: {
        paginationModel: {
          pageSize: 5,
        },
      },
    }}
    sx={{
      width: '100%',
      '& .MuiDataGrid-main': { overflow: 'visible' },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: (theme) => theme.palette.background.paper,
        minHeight: '64px !important',
        lineHeight: '24px !important',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 'bold',
        overflow: 'visible',
        lineHeight: '1.2 !important',
        whiteSpace: 'normal',
        textOverflow: 'clip',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem'
        }
      },
      '& .MuiDataGrid-cell': {
        whiteSpace: 'normal',
        padding: '8px 16px',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '0.925rem'
        }
      },
      '& .MuiDataGrid-row': {
        width: '100%'
      },
      '& .MuiDataGrid-virtualScroller': {
        width: '100%'
      },
      '& .MuiButtonBase-root': {
        fontSize: {
          xs: '0.7rem',
          sm: '0.8rem',
          md: '0.875rem'
        },
        '& .MuiSvgIcon-root' :{
          color: 'none'
        }
      }
    }}
  />
));

// Define the structure for grouped courses
export interface GroupedCourse { 
  displayTitle: string;
  courses: RequiredCourse[];
  courseAbr: string; // Keep track of the abbreviation for keys/state
}

interface GEPTreeProps {
  groupedData: GroupedCourse[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (courseAbr: string) => void;
  courseData: Record<string, MergedCourseData> | {}; // For section details
}

const GEPTree: React.FC<GEPTreeProps> = React.memo((
  { groupedData, expandedGroups, onToggleGroup, courseData }
) => {
  return (
    <Box sx={{ width: '100%'}}>
      {groupedData.map(group => (
        <React.Fragment key={`group-fragment-${group.courseAbr}`}>
          <div
            key={`group-${group.courseAbr}`}
            style={{
              borderBottom: '1px solid #ccc',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => onToggleGroup(group.courseAbr)}
          >
            <Typography variant="h6">{group.displayTitle} ({group.courses.length})</Typography>
            <Typography>{expandedGroups[group.courseAbr] ? '[-]' : '[+]'}</Typography>
          </div>
          {expandedGroups[group.courseAbr] && group.courses.map(course => {
            const courseKey = `${course.course_abr} ${course.catalog_num}`;
            const courseDataEntry = (courseData as Record<string, MergedCourseData>)[courseKey];
            return (
              <ListItem 
                key={`course-${courseKey}`}
                alignItems="flex-start" 
                sx={{
                  paddingLeft: '20px',
                  py: 1, 
                  minHeight: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #eee',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <ListItemText
                    primary={`${course.course_descrip} (${course.course_abr} ${parseInt(course.catalog_num)})`}
                    secondary={courseKey}
                    sx={{ mb: 1 }}
                  />
                  {courseDataEntry?.sections && Object.keys(courseDataEntry.sections).length > 0 ? (
                    <Box sx={{ height: 'auto', minHeight: '250px', width: '100%', display: 'flex' }}>
                      <MemoizedDataGrid sections={Object.values(courseDataEntry.sections)} sortFunc={sortSections} />
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ p: 2 }}>
                      No sections available for this course.
                    </Typography>
                  )}
                </Box>
              </ListItem>
            );
          })}
        </React.Fragment>
      ))}
    </Box>
  );
});

export default function GEPSearch({setGepSearchTabData, gepSearchData}: {setGepSearchTabData: (key: keyof GEPData, value: any) => void, gepSearchData: GEPData}) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const { 
      selectedTerm, 
      searchSubject, 
      isLoaded, 
      courses, // This will be the raw flat list from the API
      courseData, 
      hideNoSections,
      progress,
      progressLabel
    } = gepSearchData;
    
    const courseSearch = useCallback(async () => {
      // Reset expanded groups on new search
      setExpandedGroups({});
      setGepSearchTabData('progress', 10);
      setGepSearchTabData('progressLabel', 'Initializing GEP course search...');
      setGepSearchTabData('isLoaded', false);
      AppLogger.info("Course search clicked with:", { 
        selectedTerm, 
        searchSubject 
      });
      
      try {
        if (searchSubject && selectedTerm) {
          const courseInfo = (GEP_COURSES as any)[searchSubject];
          if(courseInfo) {
            const coursesResult = Object.entries(courseInfo).map(([course_title, course_info_val]) => {
              const title = course_title as string;
              const course_entry = course_info_val as {course_title: string, course_id: string};
              return {
                course_id: course_entry.course_id,
                course_abr: title.split('-')[0].trim(), // Ensure course_abr is clean
                catalog_num: title.split('-')[1].trim(),
                course_descrip: course_entry.course_title,
                term: selectedTerm
              } as RequiredCourse; // Ensure correct type
            });
            
            setGepSearchTabData('courses', coursesResult);
            setGepSearchTabData('progressLabel', `Processing ${coursesResult.length} GEP courses for ${searchSubject}`);
            
            const courseDataResult = await fetchGEPCourseData(
              coursesResult, 
              selectedTerm, 
              (progressValue, statusMessage) => {
                setGepSearchTabData('progress', progressValue);
                if (statusMessage) {
                  setGepSearchTabData('progressLabel', statusMessage);
                }
              }
            );
            
            AppLogger.info("[GEP RENDER DEBUG] Received course data:", courseDataResult);
            setGepSearchTabData('courseData', courseDataResult || {});
          }
        }
      } catch (error) {
        AppLogger.error("Error fetching course data:", error);
        setGepSearchTabData('progressLabel', 'Error fetching GEP course data');
      } finally {
        setGepSearchTabData('progress', 100);
        setGepSearchTabData('progressLabel', 'Complete');
        setGepSearchTabData('isLoaded', true);
      }
    }, [selectedTerm, searchSubject, setGepSearchTabData]);

    // 1. Filter courses first (as before)
    const filteredCourses = useMemo(() => {
        if (!isLoaded || !courses || courses.length === 0) return [];
        if (!hideNoSections || !courseData) return courses;
        return courses.filter((course: RequiredCourse) => {
          const key = `${course.course_abr} ${course.catalog_num}`;
          const courseDataEntry = (courseData as Record<string, MergedCourseData>)[key];
          return courseDataEntry && courseDataEntry.sections && Object.keys(courseDataEntry.sections).length > 0;
        });
    }, [courses, hideNoSections, courseData, isLoaded]);

    // 2. Group the filtered courses by course_abr
    const groupedAndFilteredCourses = useMemo(() => {
        if (!filteredCourses || filteredCourses.length === 0) return [];
        
        const groups: Record<string, GroupedCourse> = {};
        
        filteredCourses.forEach(course => {
            const abr = course.course_abr;
            if (!groups[abr]) {
                groups[abr] = {
                    courseAbr: abr,
                    displayTitle: SubjectMenuValues[abr] || `${abr} - Unknown Subject`, // Fallback title
                    courses: []
                };
            }
            groups[abr].courses.push(course);
        });
        // Sort groups by displayTitle or courseAbr
        return Object.values(groups).sort((a, b) => a.displayTitle.localeCompare(b.displayTitle));
    }, [filteredCourses]);

    const handleToggleGroup = useCallback((courseAbr: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [courseAbr]: !prev[courseAbr]
        }));
    }, []);

    const handleHideNoSectionsChange = useCallback((_: React.SyntheticEvent, checked: boolean) => {
      setGepSearchTabData('hideNoSections', checked);
    }, [setGepSearchTabData]);

    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <List sx={{ width: '100%' }}>
          <MemoizedAutocompletes 
            selectedTerm={selectedTerm}
            searchSubject={searchSubject}
            setGepSearchTabData={setGepSearchTabData}
          />
          <Button variant='outlined' sx={{ width: '50%', mt: 2 }} onClick={courseSearch}>
            Search
          </Button>
          <FormControlLabel
            control={<Checkbox checked={hideNoSections} onChange={handleHideNoSectionsChange} />}
            label="Hide courses with no open sections"
            sx={{ mt: 2, display: 'block' }}
          />
          {!isLoaded && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgressWithLabel value={progress} label={progressLabel || ''} />
            </Box>
          )}
        </List>

        {isLoaded && groupedAndFilteredCourses.length > 0 && (
          <GEPTree 
            groupedData={groupedAndFilteredCourses}
            expandedGroups={expandedGroups}
            onToggleGroup={handleToggleGroup}
            courseData={courseData}
            key={`gep-tree-${hideNoSections}-${groupedAndFilteredCourses.map(g=>g.courseAbr).join('-')}`}
          />
        )}
        {isLoaded && groupedAndFilteredCourses.length === 0 && (
          <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
            No GEP courses found matching your criteria. {hideNoSections && "Try unchecking 'Hide courses with no open sections'."}
          </Typography>
        )}
      </Box>
    );
  }
