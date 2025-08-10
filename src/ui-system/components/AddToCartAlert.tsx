import {Alert, AlertTitle} from "@mui/material";
import {AppLogger} from "../../core/utils/logger";
import type {ToCartResponse} from "../../course-management/types/ToCartResponse.ts";


/**
 * Renders a MUI Alert based on the result of an add-to-cart operation.
 *
 * @param {ToCartResponse} response Server response from add-to-cart request
 * @returns {JSX.Element} Success or error alert
 */
export function ToCartAlert(response: ToCartResponse) {
    if (response.status === "success") {
        AppLogger.info("Course added to cart: ", response);
        return <Alert severity="success">Course added to cart</Alert>;
    }else{
        if(response.title && response.message){
            return <Alert severity="error"><AlertTitle>{response.title}</AlertTitle>{response.message}</Alert>;
        }else if(response.message){
            return <Alert severity="error">{response.message}</Alert>;
        }else{
            return <Alert severity="error">Error adding course to cart</Alert>;
        }
       
    }
}