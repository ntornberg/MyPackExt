import { Button, ButtonBase } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import { AppLogger } from "../../utils/logger";
import { generateScriptContentUrl } from "../../services/ToCartService";
import { ToCartAlert } from "../AddToCartAlert";

export const ToCartButtonCell = (params: GridRenderCellParams) => {
    const section = params.row;
    
    // Extract the necessary parameters from the row
    const {
        course_id,
        classNumber,
        catalog_nbr,
        course_career = 'UGRD',
        session_code = '1',
        grading_basis = 'GRD',
        rqmnt_designtn = '',
        wait_list_okay = 'N',
        courseData,
    } = section;
    
    // Get units from the parent course data
    const unt_taken = courseData?.units || '3';
    
    // Skip if missing required data
    if (!course_id || !classNumber || !catalog_nbr || !courseData || !unt_taken) {
        AppLogger.warn("Missing required data for section: ",section);
        if(!course_id) {
            AppLogger.warn("Course ID is missing for section: ",section);
        }
        if(!classNumber) {
            AppLogger.warn("Class number is missing for section: ",section);
        } if(!catalog_nbr) {
            AppLogger.warn("Catalog number is missing for section: ",section);
        } if(!courseData) {
            AppLogger.warn("Course data is missing for section: ",section);
        } if(!unt_taken) {
            AppLogger.warn("Units taken is missing for section: ",section);
        }
        AppLogger.warn("Section: ",section);
        return (
            <Button variant="contained" disabled title="Missing required data" sx={{
                color: 'white',
                backgroundColor: 'rgb(11, 14, 20)',
                borderColor: 'rgb(65, 70, 81)',
                padding: '4px 4px',
                borderRadius: '2px',
                backgroundImage: 'none',
                fontSize: {
                  xs: '0.7rem',
                  sm: '0.8rem',
                  md: '0.875rem',
                },
                '&:hover': {
                  backgroundColor: 'rgb(20, 25, 35)',
                },
              }}>
                Add to Cart
            </Button>
        );
    }
    
    const handleAddToCart = async () => {

        AppLogger.info("Adding to cart: " + course_id + " " + classNumber + " " + catalog_nbr);
        const url = generateScriptContentUrl({
            record: "WEBLIB_ENROLL",
            field:  "ISCRIPT1",
            event:  "FieldFormula",
            script: "IScript_addClassToShopCart"
          });
          AppLogger.info("URL: " + url);
          const payload = {
            course_career:     course_career,
            session_code:      session_code,
            crse_id:           course_id,
            class_nbr:         classNumber,
            catalog_nbr:       catalog_nbr,
            unt_taken:         unt_taken,
            grading_basis:     grading_basis,
            rqmnt_designtn:    rqmnt_designtn,
            wait_list_okay:    wait_list_okay
          };
  // fire it without worrying about p_row
  const fullURL = `${url}?${new URLSearchParams(payload)}`;
  AppLogger.info("Full URL: " + fullURL);
  const res = await fetch(fullURL, { credentials: "include" });
  const data = await res.json();
  
  if (data.status === "success") {
    AppLogger.info("Added to cart! " + data.message);
    
  } else {
    AppLogger.warn("Server returned:", data);
  }
  return ToCartAlert(data);
}
    
    return (
        <ButtonBase
             
            onClick={handleAddToCart}
            sx={{
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
              }}
        >Add to Cart
        </ButtonBase>
    );
}; 