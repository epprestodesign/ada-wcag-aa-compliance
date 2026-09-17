// Index of every issue in the Linear project "ADA / WCAG 2.1 AA Compliance"
// (https://linear.app/eventpipe/project/ada-wcag-21-aa-compliance-8122fef6668b).
// Pulled read-only on 2026-09-17. Status/priority are a snapshot — Linear is
// the source of truth. The full, verbatim issue description lives next to each
// story file as <ENG-id>.linear.md.

export const LINEAR_PROJECT_URL =
  'https://linear.app/eventpipe/project/ada-wcag-21-aa-compliance-8122fef6668b'
export const SNAPSHOT_DATE = '2026-09-17'

export const EPICS = [
  { key: 'epic-1', title: 'Epic 1 – fuse', codebase: 'fuse', stack: 'Vue 3 / Quasar SPA ("Presto" booking engine — contracted & Live flows)' },
  { key: 'epic-2', title: 'Epic 2 – platform Reservation Flow', codebase: 'platform', stack: 'Go Buffalo monolith — booking landing, search results, hotel details, checkout funnel' },
  { key: 'epic-3', title: 'Epic 3 – platform Group Block Flow', codebase: 'platform', stack: 'Go Buffalo monolith — group block wizard, contact/policy intake, confirmation, organizer dashboard' },
  { key: 'epic-4', title: 'Epic 4 – platform Guest Self-Service', codebase: 'platform', stack: 'Go Buffalo monolith — Manage Booking / Reservation Lookup portal' },
  { key: 'epic-5', title: 'Epic 5 – platform Order Management', codebase: 'platform', stack: 'Go Buffalo monolith — reservation dashboard, details, modification forms, cancellation modal' },
  { key: 'epic-6', title: 'Epic 6 – blitz Live Inventory', codebase: 'blitz', stack: 'Vue 3 / Quasar app — guest lookup, reservations dashboard, live-inventory modification/cancellation' },
]

const I = (id, key, epic, priority, title, wcag, slug) => ({
  id,
  key,
  epic,
  priority,
  status: 'Backlog',
  label: 'Accessibility',
  title,
  wcag,
  url: `https://linear.app/eventpipe/issue/${id}/${slug}`,
})

export const ISSUES = [
  // Epic 1 – fuse
  I('ENG-2922', 'ADA-FUSE-00', 'epic-1', 'Urgent', 'Global Foundations: Focus Outlines, Viewport Zoom, Skip Link, Theme Contrast, Nested Anchors', ['2.4.7', '1.4.4', '2.4.1', '1.4.3', '4.1.2'], 'ada-fuse-00-global-foundations-focus-outlines-viewport-zoom-skip-link'),
  I('ENG-2923', 'ADA-FUSE-01', 'epic-1', 'Urgent', 'Event Landing & Search Bar Accessibility', ['1.3.1', '2.4.6', '3.3.1', '3.3.3', '4.1.3', '4.1.2'], 'ada-fuse-01-event-landing-and-search-bar-accessibility'),
  I('ENG-2924', 'ADA-FUSE-02', 'epic-1', 'High', 'Hotel Search Results, Filtering & Google Map Accessibility', ['1.3.1', '2.1.1', '4.1.2', '4.1.3', '1.4.3'], 'ada-fuse-02-hotel-search-results-filtering-and-google-map'),
  I('ENG-2925', 'ADA-FUSE-03', 'epic-1', 'Urgent', 'Contracted Hotel Details & Room Rates Page', ['1.3.1', '2.4.6', '4.1.2', '1.4.3'], 'ada-fuse-03-contracted-hotel-details-and-room-rates-page'),
  I('ENG-2926', 'ADA-FUSE-04', 'epic-1', 'High', 'Live Hotel Details & Rates Page', ['1.3.1', '1.4.3', '4.1.2'], 'ada-fuse-04-live-hotel-details-and-rates-page'),
  I('ENG-2927', 'ADA-FUSE-05', 'epic-1', 'Urgent', 'Contracted Checkout Funnel & Guest Intake', ['1.3.1', '3.3.2', '2.4.3', '3.3.1', '4.1.2'], 'ada-fuse-05-contracted-checkout-funnel-and-guest-intake'),
  I('ENG-2928', 'ADA-FUSE-06', 'epic-1', 'Urgent', 'Live Checkout & Supplier Verification', ['1.3.1', '1.3.2', '3.3.2', '2.4.3', '4.1.2', '4.1.3'], 'ada-fuse-06-live-checkout-and-supplier-verification'),
  I('ENG-2929', 'ADA-FUSE-07', 'epic-1', 'High', 'Reservation Confirmation Page', ['1.3.1', '2.4.6', '4.1.3'], 'ada-fuse-07-reservation-confirmation-page'),

  // Epic 2 – platform Reservation Flow
  I('ENG-2930', 'ADA-PLAT-RES-00', 'epic-2', 'Urgent', 'Global Layout, Master Navigation & CSS Palette Overhaul', ['3.1.1', '2.4.1', '1.4.3', '2.4.7', '4.1.2'], 'ada-plat-res-00-global-layout-master-navigation-and-css-palette'),
  I('ENG-2931', 'ADA-PLAT-RES-01', 'epic-2', 'High', 'Event Landing Page & Availability Banners', ['1.1.1', '1.3.1', '2.4.6'], 'ada-plat-res-01-event-landing-page-and-availability-banners'),
  I('ENG-2932', 'ADA-PLAT-RES-02', 'epic-2', 'High', 'Hotel Search Results & Filter Form', ['1.3.1', '2.4.6', '4.1.2'], 'ada-plat-res-02-hotel-search-results-and-filter-form'),
  I('ENG-2933', 'ADA-PLAT-RES-03', 'epic-2', 'Urgent', 'Hotel Details & Inventory Selection Matrix', ['1.1.1', '1.3.1', '2.1.1', '4.1.2'], 'ada-plat-res-03-hotel-details-and-inventory-selection-matrix'),
  I('ENG-2934', 'ADA-PLAT-RES-04', 'epic-2', 'Urgent', 'Checkout Step 1: Guest Information', ['1.3.1', '2.1.1', '3.3.2', '4.1.2'], 'ada-plat-res-04-checkout-step-1-guest-information'),
  I('ENG-2935', 'ADA-PLAT-RES-05', 'epic-2', 'Urgent', 'Checkout Step 2: Payment & Credit Card Intake', ['1.1.1', '1.3.1', '2.1.1', '4.1.2'], 'ada-plat-res-05-checkout-step-2-payment-and-credit-card-intake'),
  I('ENG-2936', 'ADA-PLAT-RES-06', 'epic-2', 'Urgent', 'Checkout Step 3: Reservation Policies & Order Placement', ['1.3.1', '2.2.1', '3.3.1', '4.1.2', '4.1.1'], 'ada-plat-res-06-checkout-step-3-reservation-policies-and-order'),
  I('ENG-2937', 'ADA-PLAT-RES-07', 'epic-2', 'High', 'Order Confirmation View & Printable Summary', ['1.3.1', '2.4.6', '4.1.3'], 'ada-plat-res-07-order-confirmation-view-and-printable-summary'),

  // Epic 3 – platform Group Block Flow
  I('ENG-2938', 'ADA-PLAT-GRP-01', 'epic-3', 'High', 'Group Block Checkout Wizard Container & Step Navigation', ['1.3.1', '2.4.6', '4.1.2'], 'ada-plat-grp-01-group-block-checkout-wizard-container-and-step'),
  I('ENG-2939', 'ADA-PLAT-GRP-02', 'epic-3', 'Urgent', 'Group Block Step 1: Organization & Primary Contact Intake', ['1.3.1', '3.3.2', '4.1.2'], 'ada-plat-grp-02-group-block-step-1-organization-and-primary-contact'),
  I('ENG-2940', 'ADA-PLAT-GRP-03', 'epic-3', 'Urgent', 'Group Block Step 2: Group Agreement & Hotel Policies', ['1.3.1', '4.1.2'], 'ada-plat-grp-03-group-block-step-2-group-agreement-and-hotel-policies'),
  I('ENG-2941', 'ADA-PLAT-GRP-04', 'epic-3', 'High', 'Group Block Held Confirmation & Submittal', ['1.3.1', '2.4.6', '4.1.2'], 'ada-plat-grp-04-group-block-held-confirmation-and-submittal'),
  I('ENG-2942', 'ADA-PLAT-GRP-05', 'epic-3', 'High', 'Group Management Organizer Dashboard', ['1.3.1', '1.4.3', '2.4.6'], 'ada-plat-grp-05-group-management-organizer-dashboard'),

  // Epic 4 – platform Guest Self-Service / Lookup
  I('ENG-2943', 'ADA-PLAT-AUTH-01', 'epic-4', 'Urgent', 'Manage Booking / Reservation Lookup Portal', ['1.3.1', '2.4.6', '3.3.1', '3.3.2'], 'ada-plat-auth-01-manage-booking-reservation-lookup-portal'),

  // Epic 5 – platform Order Management
  I('ENG-2944', 'ADA-PLAT-MGMT-00', 'epic-5', 'Urgent', 'Order Management Master Layout & Document Standards', ['3.1.1', '2.4.1', '4.1.2'], 'ada-plat-mgmt-00-order-management-master-layout-and-document-standards'),
  I('ENG-2945', 'ADA-PLAT-MGMT-01', 'epic-5', 'High', 'End-User Reservations Dashboard / List', ['1.3.1', '2.4.4', '2.4.6'], 'ada-plat-mgmt-01-end-user-reservations-dashboard-list'),
  I('ENG-2946', 'ADA-PLAT-MGMT-02', 'epic-5', 'Urgent', 'Reservation Details, Status & Printable Receipt View', ['1.1.1', '1.3.1', '1.4.3', '2.4.6', '4.1.3'], 'ada-plat-mgmt-02-reservation-details-status-and-printable-receipt-view'),
  I('ENG-2947', 'ADA-PLAT-MGMT-03', 'epic-5', 'Urgent', 'Reservation Modification Intake Forms', ['1.3.1', '2.1.1', '2.4.3', '3.3.1', '3.3.2', '4.1.2'], 'ada-plat-mgmt-03-reservation-modification-intake-forms'),
  I('ENG-2948', 'ADA-PLAT-MGMT-04', 'epic-5', 'Urgent', 'Reservation Cancellation Dialog & Waive Fee Modal', ['2.1.1', '2.4.3', '4.1.2', '4.1.1'], 'ada-plat-mgmt-04-reservation-cancellation-dialog-and-waive-fee-modal'),

  // Epic 6 – blitz Live Inventory Reservation Mgmt
  I('ENG-2949', 'ADA-BLITZ-RES-00', 'epic-6', 'Urgent', 'Global Blitz Foundation, Focus Visibility & Color Palette Overhaul', ['1.4.3', '1.4.4', '2.4.1', '2.4.7'], 'ada-blitz-res-00-global-blitz-foundation-focus-visibility-and-color'),
  I('ENG-2950', 'ADA-BLITZ-RES-01', 'epic-6', 'Urgent', 'Guest Reservation Lookup Portal & Forgot Confirmation Number Modal', ['1.3.1', '2.1.1', '2.4.6', '3.3.1', '3.3.2', '4.1.2', '4.1.3'], 'ada-blitz-res-01-guest-reservation-lookup-portal-and-forgot'),
  I('ENG-2951', 'ADA-BLITZ-RES-02', 'epic-6', 'High', 'End-User Reservations Dashboard & Search Controls', ['1.3.1', '2.4.6', '3.3.2', '4.1.3'], 'ada-blitz-res-02-end-user-reservations-dashboard-and-search-controls'),
  I('ENG-2952', 'ADA-BLITZ-RES-03', 'epic-6', 'Urgent', 'End-User Reservation Card & Accessible Status Badges', ['1.3.1', '1.4.3', '2.1.1', '2.4.4', '3.2.5', '4.1.2'], 'ada-blitz-res-03-end-user-reservation-card-and-accessible-status'),
  I('ENG-2953', 'ADA-BLITZ-RES-04', 'epic-6', 'Urgent', 'Live Inventory Reservation Modification & Cancellation Modal', ['1.3.1', '1.4.3', '2.1.1', '2.4.3', '2.4.6', '4.1.2', '4.1.3'], 'ada-blitz-res-04-live-inventory-reservation-modification-and'),
  I('ENG-2954', 'ADA-BLITZ-RES-05', 'epic-6', 'High', 'Live Inventory Price Breakdown, Policies & Footer', ['1.1.1', '1.3.1', '1.4.3', '1.4.13', '2.1.1', '2.4.4', '2.4.6'], 'ada-blitz-res-05-live-inventory-price-breakdown-policies-and-footer'),
]

export const issue = (id) => {
  const found = ISSUES.find((i) => i.id === id || i.key === id)
  if (!found) throw new Error(`Unknown ADA issue: ${id}`)
  return { ...found, epicInfo: EPICS.find((e) => e.key === found.epic) }
}

// WCAG success criteria referenced across the project — name + level.
export const WCAG = {
  '1.1.1': ['Non-text Content', 'A'],
  '1.3.1': ['Info and Relationships', 'A'],
  '1.3.2': ['Meaningful Sequence', 'A'],
  '1.4.3': ['Contrast (Minimum)', 'AA'],
  '1.4.4': ['Resize Text', 'AA'],
  '1.4.13': ['Content on Hover or Focus', 'AA'],
  '2.1.1': ['Keyboard', 'A'],
  '2.2.1': ['Timing Adjustable', 'A'],
  '2.4.1': ['Bypass Blocks', 'A'],
  '2.4.3': ['Focus Order', 'A'],
  '2.4.4': ['Link Purpose (In Context)', 'A'],
  '2.4.6': ['Headings and Labels', 'AA'],
  '2.4.7': ['Focus Visible', 'AA'],
  '3.1.1': ['Language of Page', 'A'],
  '3.2.5': ['Change on Request', 'AAA'],
  '3.3.1': ['Error Identification', 'A'],
  '3.3.2': ['Labels or Instructions', 'A'],
  '3.3.3': ['Error Suggestion', 'AA'],
  '4.1.1': ['Parsing (obsolete in 2.2)', 'A'],
  '4.1.2': ['Name, Role, Value', 'A'],
  '4.1.3': ['Status Messages', 'AA'],
}

export const wcagUrl = (sc) => {
  const slugs = {
    '1.1.1': 'non-text-content', '1.3.1': 'info-and-relationships', '1.3.2': 'meaningful-sequence',
    '1.4.3': 'contrast-minimum', '1.4.4': 'resize-text', '1.4.13': 'content-on-hover-or-focus',
    '2.1.1': 'keyboard', '2.2.1': 'timing-adjustable', '2.4.1': 'bypass-blocks', '2.4.3': 'focus-order',
    '2.4.4': 'link-purpose-in-context', '2.4.6': 'headings-and-labels', '2.4.7': 'focus-visible',
    '3.1.1': 'language-of-page', '3.2.5': 'change-on-request', '3.3.1': 'error-identification',
    '3.3.2': 'labels-or-instructions', '3.3.3': 'error-suggestion', '4.1.1': 'parsing',
    '4.1.2': 'name-role-value', '4.1.3': 'status-messages',
  }
  return `https://www.w3.org/WAI/WCAG22/Understanding/${slugs[sc] ?? ''}`
}

// Presto-2026 live references used as "Before" sources.
export const PRESTO = {
  storybook: 'https://epprestodesign.github.io/presto-2026/',
  prototype: 'https://epprestodesign.github.io/presto-2026/prototype/',
  prototypeMobile: 'https://epprestodesign.github.io/presto-2026/prototype-mobile/',
  story: (id) => `https://epprestodesign.github.io/presto-2026/?path=/story/${id}`,
}
