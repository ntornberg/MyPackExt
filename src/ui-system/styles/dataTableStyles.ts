// Shared dark theme styles for PrimeReact DataTable
export const customDataTableStyles = `
  .custom-datatable .p-datatable-thead > tr > th {
    background-color: rgb(5, 7, 10) !important;
    color: white !important;
    border-color: rgb(30, 35, 45) !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:nth-child(even) {
    background-color: rgb(11, 14, 20) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:nth-child(odd) {
    background-color: rgb(20, 25, 35) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:hover {
    background-color: rgb(25, 30, 40) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr > td {
    border-color: rgb(30, 35, 45) !important;
  }
  
  .custom-datatable .p-row-toggler {
    color: white !important;
  }
  
  .custom-datatable .p-row-toggler:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-scrollable-body {
    background-color: rgb(20, 25, 35) !important;
  }
  
  /* Expanded row styling */
  .custom-datatable .p-datatable-row-expansion {
    background-color: rgb(15, 18, 25) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion .card {
    background-color: rgb(20, 25, 35) !important;
    border: 1px solid rgb(30, 35, 45) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion h5,
  .custom-datatable .p-datatable-row-expansion h6 {
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion .border-300 {
    border-color: rgb(30, 35, 45) !important;
  }
`; 