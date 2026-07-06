export const customDataTableStyles = `
  .custom-datatable,
  .custom-datatable.p-datatable {
    --table-bg: rgba(248, 250, 255, 0.92);
    --table-row-bg: rgba(255, 255, 255, 0.96);
    --table-row-border: rgba(108, 137, 194, 0.22);
    --table-head-bg: transparent;
    --table-border: rgba(20, 38, 63, 0.12);
    --table-text: #162033;
    --table-muted: #5c6c83;
    --table-accent: rgba(66, 126, 255, 0.16);
    --table-selected: rgba(66, 126, 255, 0.2);
    background: var(--table-bg) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    border: 1px solid var(--table-border) !important;
    box-shadow: 0 20px 60px rgba(18, 30, 52, 0.12);
    display: flex !important;
    flex-direction: column !important;
  }

  html[data-pp-mode="dark"] .custom-datatable,
  html[data-pp-mode="dark"] .custom-datatable.p-datatable,
  :host([data-mpp-theme="dark"]) .custom-datatable,
  :host([data-mpp-theme="dark"]) .custom-datatable.p-datatable {
    --table-bg: linear-gradient(180deg, rgba(13, 20, 34, 0.96), rgba(10, 16, 28, 0.98));
    --table-row-bg: rgba(19, 28, 45, 0.92);
    --table-row-border: rgba(95, 128, 201, 0.18);
    --table-head-bg: transparent;
    --table-border: rgba(88, 116, 178, 0.2);
    --table-text: #edf3ff;
    --table-muted: rgba(200, 214, 245, 0.82);
    --table-accent: rgba(69, 134, 255, 0.14);
    --table-selected: rgba(69, 134, 255, 0.2);
    box-shadow: inset 0 1px 0 rgba(108, 140, 201, 0.08),
      0 18px 50px rgba(0, 0, 0, 0.42);
  }

  .custom-datatable .p-datatable-thead > tr > th {
    background: var(--table-head-bg) !important;
    color: var(--table-text) !important;
    border: none !important;
    border-bottom: none !important;
    padding: 0.35rem 0.75rem 0.75rem !important;
    font-size: 0.72rem !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    text-align: left !important;
  }
  .custom-datatable .p-datatable-table > thead > tr > th,
  .custom-datatable table > thead > tr > th {
    background: var(--table-head-bg) !important;
    color: var(--table-text) !important;
    border-bottom: none !important;
    text-align: left !important;
  }

  .custom-datatable .p-datatable-tbody > tr:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-datatable-tbody > tr.pp-selected-row {
    background: linear-gradient(
      90deg,
      rgba(70, 144, 255, 0.22),
      rgba(70, 144, 255, 0.08)
    ) !important;
  }

  .custom-datatable .p-datatable-tbody > tr.pp-selected-row > td {
    box-shadow: inset 0 1px 0 rgba(70, 144, 255, 0.18),
      inset 0 -1px 0 rgba(70, 144, 255, 0.18);
  }

  .custom-datatable .p-datatable-tbody > tr > td {
    color: var(--table-text) !important;
    border-top: 1px solid var(--table-row-border) !important;
    border-bottom: 1px solid var(--table-row-border) !important;
    padding: 0.95rem 0.8rem !important;
    font-size: 0.85rem !important;
    text-align: left !important;
    vertical-align: middle !important;
    background: var(--table-row-bg) !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr > td,
  .custom-datatable table > tbody > tr > td {
    color: var(--table-text) !important;
    border-top: 1px solid var(--table-row-border) !important;
    border-bottom: 1px solid var(--table-row-border) !important;
    background: var(--table-row-bg) !important;
    text-align: left !important;
    vertical-align: middle !important;
  }
  .custom-datatable .p-datatable-tbody > tr > td:first-child,
  .custom-datatable .p-datatable-table > tbody > tr > td:first-child,
  .custom-datatable table > tbody > tr > td:first-child {
    border-left: 1px solid var(--table-row-border) !important;
    border-radius: 14px 0 0 14px !important;
  }
  .custom-datatable .p-datatable-tbody > tr > td:last-child,
  .custom-datatable .p-datatable-table > tbody > tr > td:last-child,
  .custom-datatable table > tbody > tr > td:last-child {
    border-right: 1px solid var(--table-row-border) !important;
    border-radius: 0 14px 14px 0 !important;
  }
  .custom-datatable .p-datatable-wrapper,
  .custom-datatable .p-datatable-table,
  .custom-datatable table {
    background: transparent !important;
    color: var(--table-text) !important;
  }
  .custom-datatable .p-datatable-table {
    border-collapse: separate !important;
    border-spacing: 0 10px !important;
    margin-top: -10px !important;
  }
  .custom-datatable .p-datatable-table > tbody > tr:hover,
  .custom-datatable table > tbody > tr:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-datatable-table > tbody > tr.pp-selected-row,
  .custom-datatable table > tbody > tr.pp-selected-row {
    background: var(--table-selected) !important;
  }

  .custom-datatable .p-row-toggler {
    color: var(--table-muted) !important;
    border-radius: 999px !important;
    transition: background-color 0.15s ease !important;
  }

  .custom-datatable .p-row-toggler:hover {
    background: var(--table-accent) !important;
  }

  .custom-datatable .p-datatable-wrapper {
    border-radius: 20px 20px 0 0 !important;
    padding: 0 0.25rem 0.35rem !important;
  }

  .custom-datatable .p-paginator {
    background: transparent !important;
    border: none !important;
    border-top: 1px solid var(--table-border) !important;
    color: var(--table-muted) !important;
    padding: 0.7rem !important;
  }

  .custom-datatable .p-paginator .p-paginator-page.p-highlight {
    background: #3d7cff !important;
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
    background: rgba(255, 255, 255, 0.04) !important;
  }

  .custom-datatable .p-paginator .p-paginator-page:hover,
  .custom-datatable .p-paginator .p-paginator-next:hover,
  .custom-datatable .p-paginator .p-paginator-prev:hover,
  .custom-datatable .p-paginator .p-paginator-first:hover,
  .custom-datatable .p-paginator .p-paginator-last:hover {
    background: var(--table-accent) !important;
  }
`;
