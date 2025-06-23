import { Box, FormControlLabel, ListItem, ListItemText, Typography, Checkbox} from "@mui/material";
import { Button, TextField, Autocomplete, List } from "@mui/material";
import { useMemo, useCallback, useState } from "react";
import { sortSections } from '../../types/DataGridCourse';
import { type GEPData } from "../TabDataStore/TabData";
import React from "react";

import { DataTable, type DataTableExpandedRows, type DataTableValueArray, type DataTableRowToggleEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ToCartButtonCell } from '../DataGridCells/ToCartButtonCell';
import { StatusAndSlotsCell } from '../DataGridCells/StatusAndSlotsCell';
import { CourseInfoCell } from '../DataGridCells/CourseInfoCell';
import { RateMyProfessorCell } from '../DataGridCells/RateMyProfessorCell';
import { GradeDistributionCell } from '../DataGridCells/GradeDistributionCell';
import { InfoCell } from '../DataGridCells/InfoCell';
import type { GroupedSections, MergedCourseData, ModifiedSection } from "../../../core/utils/CourseSearch/MergeDataUtil";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import { GEP_COURSES } from "../../../degree-planning/DialogAutoCompleteKeys/GEPSearch/gep_courses.typed.ts";
import { customDataTableStyles } from "../../../ui-system/styles/dataTableStyles.ts";
import { AppLogger } from "../../../core/utils/logger.ts";
import type { RequiredCourse } from "../../../degree-planning/types/Plans";
import { fetchGEPCourseData } from "../../services/api/DialogMenuSearch/dataService";
import { SubjectMenuValues } from "../../../degree-planning/DialogAutoCompleteKeys/SubjectSearchValues";
import { CircularProgressWithLabel } from '../../../ui-system/components/shared/CircularProgressWithLabel';

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
        renderInput={(params: any) => 
          <TextField {...params} label="Term" />
        }
      />
      <Autocomplete
        sx={{ width: '100%' }}
        id="subject_selector"
        options={SUBJECT_OPTIONS}
        value={searchSubject}
        onChange={handleSubjectChange}
        renderInput={(params: any) => 
          <TextField {...params} label="Subject" />
        }
      />
    </Box>
  );
});

const MemoizedDataTable = React.memo(({ 
  sections,
  sortFunc 
}: { 
  sections: GroupedSections[]; 
  sortFunc: (a: GroupedSections, b: GroupedSections) => number 
}) => {
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | DataTableValueArray | undefined>(undefined);

  const rowExpansionTemplate = (data: GroupedSections) => {
    AppLogger.info("Row expansion template in GEP Search", { data });
    if (!data.labs || data.labs.length === 0) return null;
    return (
      <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
        <DataTable value={data.labs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="id" header="ID" body={(row: ModifiedSection) => row.section} />
          <Column field="to_cart_button" header="" body={(row: ModifiedSection) => ToCartButtonCell(row, data.lecture || undefined)} />
          <Column field="section" header="Section" body={CourseInfoCell} />
          <Column field="availability" header="Status" body={StatusAndSlotsCell} />
        </DataTable>
      </Box>
    );
  };

  const processedSections = useMemo(() => {
    return sections.sort(sortFunc).flatMap((section, index) => {
        if (section.lecture) {
            return [{
                ...section,
                id: section.lecture.classNumber || `grouped-${index}`
            }];
        }
        if (section.labs && section.labs.length > 0) {
            return section.labs.map((lab, labIndex) => ({
                lecture: lab,
                labs: [],
                id: lab.classNumber || `lab-only-${index}-${labIndex}`
            }));
        }
        return [];
    });
}, [sections, sortFunc]);

  return (
  <>
    <style>{customDataTableStyles}</style>
    <DataTable 
      dataKey="id"
      value={processedSections}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
      className="custom-datatable"
      expandedRows={expandedRows}
      onRowToggle={(e: DataTableRowToggleEvent) => setExpandedRows(e.data)}
      rowExpansionTemplate={rowExpansionTemplate}
    >
      <Column expander={(row: GroupedSections) => !!row.labs && row.labs.length > 0} style={{ width: '3em' }} />
      <Column field="to_cart_button" header="" body={(params: GroupedSections) => params.lecture && ToCartButtonCell(params.lecture)} />
      <Column field="availability" header="Status" body={(params: GroupedSections) => params.lecture && StatusAndSlotsCell(params.lecture)} />
      <Column field="section" header="Course Info" body={(params: GroupedSections) => params.lecture && CourseInfoCell(params.lecture)} />
      <Column field="instructor_name" header="Instructor" body={(row: GroupedSections) => Array.isArray(row.lecture?.instructor_name) ? row.lecture?.instructor_name.join(', ') : row.lecture?.instructor_name} />
      <Column field="professor_rating" header="Rating" body={(params: GroupedSections) => params.lecture && RateMyProfessorCell(params.lecture)} />
      <Column field="grade_distribution" header="Grades" body={(params: GroupedSections) => params.lecture && GradeDistributionCell(params.lecture)} />
      <Column field="info" header="Info" body={(params: GroupedSections) => params.lecture && InfoCell(params.lecture)} />
    </DataTable>
  </>
  );
});

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

const CourseSections = React.memo(({ courseDataEntry }: { courseDataEntry: MergedCourseData | undefined }) => {
    const sections = useMemo(() => {
        if (courseDataEntry?.sections) {
            return Object.values(courseDataEntry.sections);
        }
        return [];
    }, [courseDataEntry?.sections]);

    if (sections.length > 0) {
        return (
            <Box sx={{ height: 'auto', minHeight: '250px', width: '100%', display: 'flex' }}>
                <MemoizedDataTable sections={sections} sortFunc={sortSections} />
            </Box>
        );
    }

    return (
        <Typography variant="body1" sx={{ p: 2 }}>
            No sections available for this course.
        </Typography>
    );
});

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
                  <CourseSections courseDataEntry={courseDataEntry} />
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