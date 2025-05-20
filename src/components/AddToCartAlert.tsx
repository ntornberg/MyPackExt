import type { ToCartResponse } from "../types/ToCartResponse";
import { Alert, AlertTitle } from "@mui/material";
export function ToCartAlert(response: ToCartResponse) {
    if (response.status === "success") {
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