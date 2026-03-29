export const customDataTableStyles = `
  .custom-datatable,
  .custom-datatable.p-datatable {
    --table-bg: #ffffff;
    --table-bg-alt: #f4f7fc;
    --table-head-bg: #e9f0fb;
    --table-border: rgba(20, 38, 63, 0.18);
    --table-text: #172335;
    --table-muted: #4f5f75;
    --table-accent: rgba(37, 108, 219, 0.18);
    background: var(--table-bg) !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    border: 1px solid var(--table-border) !important;
    box-shadow: 0 6px 18px rgba(20, 35, 58, 0.12);
    display: flex !important;
    flex-direction: column !important;
  }

  html[data-pp-mode="dark"] .custom-datatable,
  html[data-pp-mode="dark"] .custom-datatable.p-datatable {
    --table-bg: #141d29;
    --table-bg-alt: #101826;
    --table-head-bg: #0b1321;
    --table-border: rgba(255, 255, 255, 0.1);
    --table-text: #ecf2fb;
    --table-muted: rgba(236, 242, 251, 0.76);
    --table-accent: rgba(70, 144, 255, 0.22);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.36);
  }

  .custom-datatable .p-datatable-thead > tr > th {
    background: var(--table-head-bg) !important;
    color: var(--table-text) !important;
    border: none !important;
    border-bottom: 1px solid var(--table-border) !important;
    padding: 0.8rem 0.75rem !important;
    font-size: 0.82rem !important;
    letter-spacing: 0.02em !important;
    text-transform: uppercase !important;
    font-weight: 700 !important;
    text-align: center !important;
  }
  .custom-datatable .p-datatable-table > thead > tr > th,
  .custom-datatable table > thead > tr > th {
    background: var(--table-head-bg) !important;
    color: var(--table-text) !important;
    border-bottom: 1px solid var(--table-border) !important;
    text-align: center !important;
  }

  .custom-datatable .p-datatable-tbody > tr:nth-child(even) {
    background: var(--table-bg) !important;
  }

  .custom-datatable .p-datatable-tbody > tr:nth-child(odd) {
    background: var(--table-bg-alt) !important;
  }

  .custom-datatable .p-datatable-tbody > tr:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-datatable-tbody > tr > td {
    color: var(--table-text) !important;
    border: none !important;
    border-bottom: 1px solid var(--table-border) !important;
    padding: 0.8rem 0.75rem !important;
    font-size: 0.88rem !important;
    text-align: left !important;
    vertical-align: middle !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr > td,
  .custom-datatable table > tbody > tr > td {
    color: var(--table-text) !important;
    border-bottom: 1px solid var(--table-border) !important;
    background: transparent !important;
    text-align: left !important;
    vertical-align: middle !important;
  }
  .custom-datatable .p-datatable-wrapper,
  .custom-datatable .p-datatable-table,
  .custom-datatable table {
    background: var(--table-bg) !important;
    color: var(--table-text) !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr:nth-child(odd),
  .custom-datatable table > tbody > tr:nth-child(odd) {
    background: var(--table-bg-alt) !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr:nth-child(even),
  .custom-datatable table > tbody > tr:nth-child(even) {
    background: var(--table-bg) !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr:hover,
  .custom-datatable table > tbody > tr:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-row-toggler {
    color: var(--table-muted) !important;
    border-radius: 6px !important;
    transition: background-color 0.15s ease !important;
  }

  .custom-datatable .p-row-toggler:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-paginator {
    background: var(--table-bg) !important;
    border: none !important;
    border-top: 1px solid var(--table-border) !important;
    color: var(--table-muted) !important;
    padding: 0.7rem !important;
  }

  .custom-datatable .p-paginator .p-paginator-page.p-highlight {
    background: #2a78e4 !important;
    color: #ffffff !important;
    border-color: transparent !important;
  }

  .custom-datatable .p-paginator .p-paginator-page,
  .custom-datatable .p-paginator .p-paginator-next,
  .custom-datatable .p-paginator .p-paginator-prev,
  .custom-datatable .p-paginator .p-paginator-first,
  .custom-datatable .p-paginator .p-paginator-last {
    color: var(--table-text) !important;
    border-color: var(--table-border) !important;
    background: var(--table-bg-alt) !important;
  }

  .custom-datatable .p-paginator .p-paginator-page:hover,
  .custom-datatable .p-paginator .p-paginator-next:hover,
  .custom-datatable .p-paginator .p-paginator-prev:hover,
  .custom-datatable .p-paginator .p-paginator-first:hover,
  .custom-datatable .p-paginator .p-paginator-last:hover {
    background: var(--table-accent) !important;
  }
`;
