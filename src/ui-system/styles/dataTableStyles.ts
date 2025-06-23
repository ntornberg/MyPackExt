// Enhanced dark theme styles for PrimeReact DataTable with modern flair
export const customDataTableStyles = `
  .custom-datatable {
            background: rgb(5, 7, 10);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 8px 2px rgba(33, 150, 243, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.05);
            position: relative;
        }

        .custom-datatable > * {
            position: relative;
            z-index: 1;
        }

        /* Completely flat, dark header */
        .custom-datatable .p-datatable-thead {
            position: relative;
            background: rgb(5, 7, 10) !important;
        }

        .custom-datatable .p-datatable-thead > tr > th {
            background: rgb(5, 7, 10) !important;
            background-image: none !important;
            color: rgba(255, 255, 255, 0.85) !important;
            border: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            padding: 1.2rem 1rem !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            letter-spacing: 0.3px !important;
            transition: none !important;
            box-shadow: none !important;
        }

        /* Remove any hover effects on individual headers */
        .custom-datatable .p-datatable-thead > tr > th:hover {
            background: rgb(5, 7, 10) !important;
            background-image: none !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }

        /* Unified glow effect on the entire header */
        .custom-datatable .p-datatable-thead::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(33, 150, 243, 0.4) 50%, 
                transparent 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 10;
        }

        .custom-datatable .p-datatable-thead:hover::after {
            opacity: 1;
        }

        /* Darker, richer body colors */
        .custom-datatable .p-datatable-tbody > tr:nth-child(even) {
            background: rgb(8, 12, 18) !important;
            color: rgba(255, 255, 255, 0.95) !important;
            transition: all 0.2s ease;
        }

        .custom-datatable .p-datatable-tbody > tr:nth-child(odd) {
            background: rgb(15, 20, 28) !important;
            color: rgba(255, 255, 255, 0.95) !important;
            transition: all 0.2s ease;
        }

        /* Enhanced hover with subtle blue accent */
        .custom-datatable .p-datatable-tbody > tr:hover {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(33, 150, 243, 0.08) 100%) !important;
            color: white !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(33, 150, 243, 0.2);
        }

        .custom-datatable .p-datatable-tbody > tr > td {
            border: none !important;
            border-bottom: 1px solid rgba(33, 150, 243, 0.08) !important;
            padding: 1rem !important;
            font-size: 0.9rem;
        }

        /* Remove the left border effect */
        .custom-datatable .p-datatable-tbody > tr > td:first-child {
            border-left: none;
        }

        .custom-datatable .p-datatable-tbody > tr:hover > td:first-child {
            border-left: none;
        }

        /* Simplified toggle buttons matching theme */
        .custom-datatable .p-row-toggler {
            color: rgba(33, 150, 243, 0.8) !important;
            background: rgba(33, 150, 243, 0.1) !important;
            border-radius: 4px !important;
            padding: 0.4rem !important;
            transition: all 0.2s ease !important;
        }

        .custom-datatable .p-row-toggler:hover {
            background: rgba(33, 150, 243, 0.2) !important;
            color: rgba(33, 150, 243, 1) !important;
        }

        /* Enhanced scrollable area */
        .custom-datatable .p-datatable-scrollable-body {
            background: transparent !important;
        }

        /* Enhanced expanded row styling */
        .custom-datatable .p-datatable-row-expansion {
            background: linear-gradient(135deg, 
                rgba(15, 23, 42, 0.9) 0%, 
                rgba(30, 41, 59, 0.9) 100%) !important;
            color: white !important;
            border-top: 2px solid rgba(33, 150, 243, 0.3) !important;
            animation: expandIn 0.3s ease-out;
        }

        @keyframes expandIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .custom-datatable .p-datatable-row-expansion .card {
            background: linear-gradient(135deg, 
                rgba(30, 41, 59, 0.8) 0%, 
                rgba(15, 23, 42, 0.8) 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
            color: white !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }

        .custom-datatable .p-datatable-row-expansion h5,
        .custom-datatable .p-datatable-row-expansion h6 {
            color: rgba(33, 150, 243, 0.9) !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .custom-datatable .p-datatable-row-expansion .border-300 {
            border-color: rgba(255, 255, 255, 0.1) !important;
        }

        /* Loading state enhancement */
        .custom-datatable .p-datatable-loading-overlay {
            background: rgba(15, 23, 42, 0.9) !important;
            backdrop-filter: blur(5px);
        }

        /* Enhanced pagination styling */
        .custom-datatable .p-paginator {
            background: rgb(5, 7, 10) !important;
            border: none !important;
            border-top: 1px solid rgba(33, 150, 243, 0.2) !important;
            color: white !important;
            padding: 1rem !important;
        }

        .custom-datatable .p-paginator .p-paginator-first,
        .custom-datatable .p-paginator .p-paginator-prev,
        .custom-datatable .p-paginator .p-paginator-next,
        .custom-datatable .p-paginator .p-paginator-last {
            background: rgb(15, 18, 25) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 6px !important;
            padding: 0.6rem 0.8rem !important;
            margin: 0 0.3rem !important;
            font-size: 0.9rem !important;
            min-width: 36px !important;
            min-height: 36px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
        }

        .custom-datatable .p-paginator .p-paginator-first:hover,
        .custom-datatable .p-paginator .p-paginator-prev:hover,
        .custom-datatable .p-paginator .p-paginator-next:hover,
        .custom-datatable .p-paginator .p-paginator-last:hover {
            background: rgb(20, 25, 35) !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .custom-datatable .p-paginator .p-paginator-pages .p-paginator-page {
            background: rgb(15, 18, 25) !important;
            color: rgba(255, 255, 255, 0.9) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 6px !important;
            padding: 0.6rem 0.8rem !important;
            margin: 0 0.2rem !important;
            font-size: 0.9rem !important;
            min-width: 36px !important;
            min-height: 36px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
        }

        .custom-datatable .p-paginator .p-paginator-pages .p-paginator-page:hover {
            background: rgb(20, 25, 35) !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
        }

        .custom-datatable .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(33, 150, 243, 0.6) 100%) !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
            transform: translateY(-1px);
        }

        /* Pagination info text */
        .custom-datatable .p-paginator .p-paginator-current {
            color: rgba(255, 255, 255, 0.7) !important;
            font-size: 0.85rem !important;
            margin: 0 1rem !important;
        }

            
        /* Responsive enhancements */
        @media (max-width: 768px) {
            .custom-datatable .p-datatable-thead > tr > th {
                padding: 1rem 0.5rem !important;
                font-size: 0.95rem !important;
            }

            .custom-datatable .p-datatable-tbody > tr > td {
                padding: 0.75rem 0.5rem !important;
            }
        }
`;