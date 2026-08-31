// src/lib/crmAutomationMaster.ts
// ResaleExpert CRM Master Automation Engine - Full Golden Rule Matrices for Lead, Buyer, and Seller

export type CRMEntity = 'lead' | 'buyer' | 'seller';
export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';
export type FollowupChannel = 'phone' | 'whatsapp' | 'email' | 'visit' | 'meeting' | 'other';

export interface AutomationRuleEntry {
  stage: string;
  status: string;
  outcome: string;
  nextAction: string;
  priority: PriorityLevel;
  slaHours: number;
}

export interface AutomationRuleResult {
  nextStage: string;
  nextStatus: string;
  nextAction: string;
  priority: PriorityLevel;
  slaHours: number;
  terminal: boolean;
  createNextFollowup: boolean;
  recommendedChannel: FollowupChannel;
}

// ----------------------------------------------------
// 1. PIPELINE STAGES
// ----------------------------------------------------

export class CRMStages {
  static readonly LEAD = [
    'New Lead',
    'Attempted',
    'Connected',
    'Requirement Qualified',
    'Property Shared',
    'Property Shortlisted',
    'Site Visit Scheduled',
    'Site Visit Completed',
    'Negotiation',
    'Booking Done',
    'Converted',
    'Lost'
  ];

  static readonly BUYER = [
    'Initial Contact',
    'Requirement Captured',
    'Requirement Qualified',
    'Property Matching',
    'Properties Shared',
    'Property Shortlisted',
    'Site Visit Scheduled',
    'Site Visit Completed',
    'Feedback Captured',
    'Negotiation',
    'Token Discussion',
    'Token Received',
    'Agreement',
    'Deal Closure',
    'Converted',
    'Dropped'
  ];

  static readonly SELLER = [
    'Initial Contact',
    'Requirement Discussion',
    'Property Details Collected',
    'Documents Collected',
    'Property Verification',
    'Property Evaluation',
    'Market Valuation',
    'Pricing Discussion',
    'Mandate Discussion',
    'Mandate Pending',
    'Mandate Signed',
    'Property Live',
    'Buyer Matching',
    'Site Visit',
    'Offer Received',
    'Negotiation',
    'Deal Closed',
    'Dropped'
  ];
}

// ----------------------------------------------------
// 2. MASTER MATRIX DEFINITIONS
// ----------------------------------------------------

export const LEAD_MASTER_MATRIX: AutomationRuleEntry[] = [
  { stage: 'New Lead', status: 'Fresh', outcome: 'Not Contacted', nextAction: 'Call Customer', priority: 'High', slaHours: 2 },
  { stage: 'New Lead', status: 'Fresh', outcome: 'Lead Assigned', nextAction: 'Call Customer', priority: 'High', slaHours: 2 },
  { stage: 'Attempted', status: 'Follow-up Required', outcome: 'No Answer', nextAction: 'Retry Call', priority: 'Medium', slaHours: 24 },
  { stage: 'Attempted', status: 'Follow-up Required', outcome: 'Busy', nextAction: 'Call Later', priority: 'Medium', slaHours: 24 },
  { stage: 'Attempted', status: 'Follow-up Required', outcome: 'Call Rejected', nextAction: 'Retry Call', priority: 'Medium', slaHours: 24 },
  { stage: 'Attempted', status: 'Follow-up Required', outcome: 'Call Back Requested', nextAction: 'Schedule Callback', priority: 'High', slaHours: 2 },
  { stage: 'Attempted', status: 'In Progress', outcome: 'Connected', nextAction: 'Capture Requirement', priority: 'High', slaHours: 2 },
  { stage: 'Connected', status: 'In Progress', outcome: 'Connected', nextAction: 'Capture Requirement', priority: 'High', slaHours: 2 },
  { stage: 'Connected', status: 'In Progress', outcome: 'Interested', nextAction: 'Capture Requirement', priority: 'High', slaHours: 2 },
  { stage: 'Connected', status: 'In Progress', outcome: 'Not Interested', nextAction: 'Re-engage / Close', priority: 'Low', slaHours: 72 },
  { stage: 'Connected', status: 'In Progress', outcome: 'Need More Time', nextAction: 'Schedule Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Connected', status: 'In Progress', outcome: 'Requirement Captured', nextAction: 'Qualify Requirement', priority: 'High', slaHours: 24 },
  { stage: 'Requirement Qualified', status: 'Qualified', outcome: 'Requirement Qualified', nextAction: 'Match Properties', priority: 'High', slaHours: 24 },
  { stage: 'Requirement Qualified', status: 'Qualified', outcome: 'Requirement Incomplete', nextAction: 'Collect Requirement', priority: 'Medium', slaHours: 24 },
  { stage: 'Requirement Qualified', status: 'On Hold', outcome: 'Need More Time', nextAction: 'Follow-up', priority: 'Low', slaHours: 72 },
  { stage: 'Property Shared', status: 'In Progress', outcome: 'Interested', nextAction: 'Follow-up Property', priority: 'High', slaHours: 24 },
  { stage: 'Property Shared', status: 'In Progress', outcome: 'Not Interested', nextAction: 'Share Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Property Shared', status: 'In Progress', outcome: 'Need More Options', nextAction: 'Share More Properties', priority: 'Medium', slaHours: 48 },
  { stage: 'Property Shared', status: 'Qualified', outcome: 'Property Shortlisted', nextAction: 'Schedule Visit', priority: 'High', slaHours: 24 },
  { stage: 'Property Shortlisted', status: 'Hot', outcome: 'Visit Requested', nextAction: 'Schedule Site Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'Active', outcome: 'Visit Confirmed', nextAction: 'Confirm Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'Active', outcome: 'Visit Rescheduled', nextAction: 'Reschedule Visit', priority: 'Medium', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'On Hold', outcome: 'Visit Cancelled', nextAction: 'Reschedule Visit', priority: 'Medium', slaHours: 48 },
  { stage: 'Site Visit Completed', status: 'In Progress', outcome: 'Positive Feedback', nextAction: 'Start Negotiation', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit Completed', status: 'In Progress', outcome: 'Negative Feedback', nextAction: 'Share Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Site Visit Completed', status: 'Warm', outcome: 'Need More Time', nextAction: 'Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Negotiation', status: 'Hot', outcome: 'Price Accepted', nextAction: 'Confirm Booking', priority: 'Urgent', slaHours: 2 },
  { stage: 'Negotiation', status: 'Hot', outcome: 'Price Negotiation', nextAction: 'Discuss Price', priority: 'High', slaHours: 24 },
  { stage: 'Negotiation', status: 'Warm', outcome: 'Need More Time', nextAction: 'Negotiation Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Booking Done', status: 'Won', outcome: 'Booking Confirmed', nextAction: 'Complete Booking', priority: 'Urgent', slaHours: 2 },
  { stage: 'Booking Done', status: 'On Hold', outcome: 'Booking Pending', nextAction: 'Booking Follow-up', priority: 'High', slaHours: 24 },
  { stage: 'Converted', status: 'Won', outcome: 'Converted', nextAction: 'Converted', priority: 'Low', slaHours: 0 },
  { stage: 'Lost', status: 'Lost', outcome: 'Not Interested', nextAction: 'Close Lead', priority: 'Low', slaHours: 0 }
];

export const BUYER_MASTER_MATRIX: AutomationRuleEntry[] = [
  { stage: 'Initial Contact', status: 'Fresh', outcome: 'Connected', nextAction: 'Capture Requirement', priority: 'High', slaHours: 2 },
  { stage: 'Initial Contact', status: 'Follow-up Required', outcome: 'No Answer', nextAction: 'Retry Call', priority: 'Medium', slaHours: 24 },
  { stage: 'Initial Contact', status: 'Follow-up Required', outcome: 'Busy', nextAction: 'Call Later', priority: 'Medium', slaHours: 24 },
  { stage: 'Requirement Captured', status: 'Requirement Pending', outcome: 'Requirement Incomplete', nextAction: 'Collect Requirement', priority: 'Medium', slaHours: 24 },
  { stage: 'Requirement Captured', status: 'Active', outcome: 'Requirement Complete', nextAction: 'Qualify Requirement', priority: 'High', slaHours: 24 },
  { stage: 'Requirement Qualified', status: 'Qualified', outcome: 'Requirement Qualified', nextAction: 'Start Property Matching', priority: 'High', slaHours: 24 },
  { stage: 'Requirement Qualified', status: 'On Hold', outcome: 'Need More Time', nextAction: 'Follow-up Buyer', priority: 'Low', slaHours: 72 },
  { stage: 'Property Matching', status: 'Property Search', outcome: 'Matching In Progress', nextAction: 'Match Properties', priority: 'High', slaHours: 24 },
  { stage: 'Property Matching', status: 'Property Search', outcome: 'Properties Found', nextAction: 'Share Properties', priority: 'High', slaHours: 24 },
  { stage: 'Property Matching', status: 'On Hold', outcome: 'No Suitable Property', nextAction: 'Find Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Properties Shared', status: 'Active', outcome: 'Interested', nextAction: 'Follow-up Property', priority: 'High', slaHours: 24 },
  { stage: 'Properties Shared', status: 'Active', outcome: 'Need More Options', nextAction: 'Share More Properties', priority: 'Medium', slaHours: 48 },
  { stage: 'Properties Shared', status: 'Active', outcome: 'Not Interested', nextAction: 'Find Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Properties Shared', status: 'Active', outcome: 'Property Shortlisted', nextAction: 'Schedule Visit', priority: 'High', slaHours: 24 },
  { stage: 'Property Shortlisted', status: 'Hot', outcome: 'Visit Requested', nextAction: 'Schedule Site Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'Active', outcome: 'Visit Confirmed', nextAction: 'Confirm Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'Active', outcome: 'Visit Rescheduled', nextAction: 'Reschedule Visit', priority: 'Medium', slaHours: 24 },
  { stage: 'Site Visit Scheduled', status: 'On Hold', outcome: 'Visit Cancelled', nextAction: 'Reschedule Visit', priority: 'Medium', slaHours: 48 },
  { stage: 'Site Visit Completed', status: 'Active', outcome: 'Visit Completed', nextAction: 'Capture Feedback', priority: 'High', slaHours: 2 },
  { stage: 'Site Visit Completed', status: 'Hot', outcome: 'Positive Feedback', nextAction: 'Capture Feedback', priority: 'High', slaHours: 2 },
  { stage: 'Site Visit Completed', status: 'Warm', outcome: 'Negative Feedback', nextAction: 'Share Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Feedback Captured', status: 'Hot', outcome: 'Positive', nextAction: 'Start Negotiation', priority: 'High', slaHours: 24 },
  { stage: 'Feedback Captured', status: 'Warm', outcome: 'Need More Time', nextAction: 'Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Feedback Captured', status: 'Active', outcome: 'Price Issue', nextAction: 'Discuss Price', priority: 'High', slaHours: 24 },
  { stage: 'Feedback Captured', status: 'Active', outcome: 'Location Issue', nextAction: 'Show Alternatives', priority: 'Medium', slaHours: 48 },
  { stage: 'Negotiation', status: 'Hot', outcome: 'Price Accepted', nextAction: 'Token Discussion', priority: 'Urgent', slaHours: 2 },
  { stage: 'Negotiation', status: 'Hot', outcome: 'Price Negotiation', nextAction: 'Discuss Price', priority: 'High', slaHours: 24 },
  { stage: 'Negotiation', status: 'Warm', outcome: 'Need More Time', nextAction: 'Negotiation Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Token Discussion', status: 'Booking Pending', outcome: 'Token Ready', nextAction: 'Collect Token', priority: 'Urgent', slaHours: 2 },
  { stage: 'Token Discussion', status: 'Booking Pending', outcome: 'Need Time', nextAction: 'Token Follow-up', priority: 'High', slaHours: 24 },
  { stage: 'Token Received', status: 'Won', outcome: 'Token Received', nextAction: 'Start Agreement', priority: 'Urgent', slaHours: 2 },
  { stage: 'Agreement', status: 'Documentation Pending', outcome: 'Documents Pending', nextAction: 'Collect Documents', priority: 'High', slaHours: 24 },
  { stage: 'Agreement', status: 'Active', outcome: 'Agreement Completed', nextAction: 'Deal Closure', priority: 'High', slaHours: 24 },
  { stage: 'Deal Closure', status: 'Deal Pending', outcome: 'Closure Pending', nextAction: 'Coordinate Closure', priority: 'Urgent', slaHours: 24 },
  { stage: 'Deal Closure', status: 'Won', outcome: 'Deal Closed', nextAction: 'Mark Converted', priority: 'Urgent', slaHours: 2 },
  { stage: 'Converted', status: 'Won', outcome: 'Converted', nextAction: 'Converted', priority: 'Low', slaHours: 0 },
  { stage: 'Dropped', status: 'Dropped', outcome: 'Not Interested', nextAction: 'Close Buyer', priority: 'Low', slaHours: 0 }
];

export const SELLER_MASTER_MATRIX: AutomationRuleEntry[] = [
  { stage: 'Initial Contact', status: 'New', outcome: 'Connected', nextAction: 'Discuss Requirement', priority: 'High', slaHours: 2 },
  { stage: 'Initial Contact', status: 'Follow-up Required', outcome: 'No Answer', nextAction: 'Retry Call', priority: 'Medium', slaHours: 24 },
  { stage: 'Initial Contact', status: 'Follow-up Required', outcome: 'Busy', nextAction: 'Call Later', priority: 'Medium', slaHours: 24 },
  { stage: 'Requirement Discussion', status: 'Contacted', outcome: 'Interested in Selling', nextAction: 'Collect Property Details', priority: 'High', slaHours: 24 },
  { stage: 'Requirement Discussion', status: 'Follow-up Required', outcome: 'Need More Time', nextAction: 'Seller Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Requirement Discussion', status: 'Lost', outcome: 'Not Interested', nextAction: 'Close Seller', priority: 'Low', slaHours: 72 },
  { stage: 'Property Details Collected', status: 'Qualified', outcome: 'Details Received', nextAction: 'Collect Documents', priority: 'High', slaHours: 24 },
  { stage: 'Property Details Collected', status: 'Requirement Pending', outcome: 'Details Incomplete', nextAction: 'Collect Missing Details', priority: 'Medium', slaHours: 24 },
  { stage: 'Documents Collected', status: 'Document Pending', outcome: 'Documents Pending', nextAction: 'Follow-up Documents', priority: 'High', slaHours: 24 },
  { stage: 'Documents Collected', status: 'Qualified', outcome: 'Documents Received', nextAction: 'Verify Property', priority: 'High', slaHours: 24 },
  { stage: 'Property Verification', status: 'Verification Pending', outcome: 'Verification Pending', nextAction: 'Verify Property', priority: 'High', slaHours: 24 },
  { stage: 'Property Verification', status: 'Qualified', outcome: 'Property Verified', nextAction: 'Evaluate Property', priority: 'High', slaHours: 24 },
  { stage: 'Property Verification', status: 'Lost', outcome: 'Property Not Verified', nextAction: 'Close / Review', priority: 'Low', slaHours: 72 },
  { stage: 'Property Evaluation', status: 'Valuation Pending', outcome: 'Evaluation Completed', nextAction: 'Schedule Valuation', priority: 'High', slaHours: 24 },
  { stage: 'Market Valuation', status: 'Valuation Pending', outcome: 'Valuation Completed', nextAction: 'Discuss Pricing', priority: 'High', slaHours: 24 },
  { stage: 'Market Valuation', status: 'Active', outcome: 'Price Suggested', nextAction: 'Discuss Pricing', priority: 'High', slaHours: 24 },
  { stage: 'Pricing Discussion', status: 'Pricing Pending', outcome: 'Price Accepted', nextAction: 'Discuss Mandate', priority: 'High', slaHours: 24 },
  { stage: 'Pricing Discussion', status: 'Negotiating', outcome: 'Price Negotiation', nextAction: 'Negotiate Price', priority: 'High', slaHours: 24 },
  { stage: 'Pricing Discussion', status: 'On Hold', outcome: 'Need More Time', nextAction: 'Seller Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Mandate Discussion', status: 'Mandate Pending', outcome: 'Mandate Interested', nextAction: 'Send Mandate', priority: 'High', slaHours: 24 },
  { stage: 'Mandate Discussion', status: 'On Hold', outcome: 'Need More Time', nextAction: 'Follow-up Mandate', priority: 'Medium', slaHours: 48 },
  { stage: 'Mandate Discussion', status: 'Lost', outcome: 'Mandate Rejected', nextAction: 'Close / Re-engage', priority: 'Low', slaHours: 72 },
  { stage: 'Mandate Pending', status: 'Mandate Pending', outcome: 'Mandate Sent', nextAction: 'Follow-up Mandate', priority: 'High', slaHours: 24 },
  { stage: 'Mandate Pending', status: 'Active', outcome: 'Mandate Signed', nextAction: 'Activate Property', priority: 'Urgent', slaHours: 2 },
  { stage: 'Mandate Signed', status: 'Active', outcome: 'Property Ready', nextAction: 'Publish Property', priority: 'Urgent', slaHours: 2 },
  { stage: 'Property Live', status: 'Active', outcome: 'Property Published', nextAction: 'Start Buyer Matching', priority: 'High', slaHours: 24 },
  { stage: 'Buyer Matching', status: 'Buyer Search', outcome: 'Buyer Matching', nextAction: 'Match Buyers', priority: 'High', slaHours: 24 },
  { stage: 'Buyer Matching', status: 'Active', outcome: 'Buyer Interested', nextAction: 'Schedule Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit', status: 'Active', outcome: 'Visit Scheduled', nextAction: 'Confirm Visit', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit', status: 'Active', outcome: 'Visit Completed', nextAction: 'Collect Feedback / Offer', priority: 'High', slaHours: 24 },
  { stage: 'Site Visit', status: 'On Hold', outcome: 'Visit Cancelled', nextAction: 'Reschedule Visit', priority: 'Medium', slaHours: 48 },
  { stage: 'Offer Received', status: 'Offer Pending', outcome: 'Offer Received', nextAction: 'Discuss Offer', priority: 'Urgent', slaHours: 2 },
  { stage: 'Offer Received', status: 'Negotiating', outcome: 'Offer Accepted', nextAction: 'Start Closure', priority: 'Urgent', slaHours: 2 },
  { stage: 'Offer Received', status: 'Active', outcome: 'Offer Rejected', nextAction: 'Continue Buyer Matching', priority: 'Medium', slaHours: 48 },
  { stage: 'Negotiation', status: 'Negotiating', outcome: 'Price Accepted', nextAction: 'Coordinate Closure', priority: 'Urgent', slaHours: 2 },
  { stage: 'Negotiation', status: 'Negotiating', outcome: 'Price Negotiation', nextAction: 'Negotiate Deal', priority: 'High', slaHours: 24 },
  { stage: 'Negotiation', status: 'Warm', outcome: 'Need More Time', nextAction: 'Negotiation Follow-up', priority: 'Medium', slaHours: 48 },
  { stage: 'Deal Closed', status: 'Won', outcome: 'Deal Closed', nextAction: 'Complete Closure', priority: 'Urgent', slaHours: 2 },
  { stage: 'Dropped', status: 'Lost', outcome: 'Seller Dropped', nextAction: 'Close Seller', priority: 'Low', slaHours: 0 }
];

// Helper to get Matrix by Entity
export function getEntityMasterMatrix(entity: CRMEntity): AutomationRuleEntry[] {
  if (entity === 'lead') return LEAD_MASTER_MATRIX;
  if (entity === 'buyer') return BUYER_MASTER_MATRIX;
  return SELLER_MASTER_MATRIX;
}

// Helper to get Available Outcomes for current Stage & Entity
export function getOutcomesForStage(entity: CRMEntity, stage: string): string[] {
  const matrix = getEntityMasterMatrix(entity);
  const matched = matrix.filter(m => m.stage.toLowerCase() === (stage || '').toLowerCase());
  if (matched.length > 0) {
    return Array.from(new Set(matched.map(m => m.outcome)));
  }
  // Fallback to all outcomes in matrix for entity
  return Array.from(new Set(matrix.map(m => m.outcome)));
}

// Master Automation Rule Evaluator
export function evaluateAutomationRule(
  entity: CRMEntity,
  currentStage: string,
  outcome: string,
  reason?: string | null
): AutomationRuleResult {
  const matrix = getEntityMasterMatrix(entity);
  const normStage = (currentStage || '').trim().toLowerCase();
  const normOutcome = (outcome || '').trim().toLowerCase();

  // Find exact stage + outcome match
  let matched = matrix.find(
    m => m.stage.toLowerCase() === normStage && m.outcome.toLowerCase() === normOutcome
  );

  // If no exact stage match, find outcome match across matrix
  if (!matched) {
    matched = matrix.find(m => m.outcome.toLowerCase() === normOutcome);
  }

  // Check terminal condition
  const isTerminal = ['converted', 'lost', 'dropped', 'deal closed'].some(t => normOutcome.includes(t) || normStage.includes(t));

  if (matched) {
    return {
      nextStage: matched.stage,
      nextStatus: matched.status,
      nextAction: matched.nextAction,
      priority: matched.priority,
      slaHours: matched.slaHours,
      terminal: isTerminal,
      createNextFollowup: !isTerminal,
      recommendedChannel: normOutcome.includes('visit') ? 'visit' : normOutcome.includes('property') ? 'whatsapp' : 'phone'
    };
  }

  // Fallback default rule
  return {
    nextStage: currentStage || (entity === 'lead' ? 'Attempted' : 'Initial Contact'),
    nextStatus: 'Follow-up Required',
    nextAction: 'Follow-up Customer',
    priority: 'Medium',
    slaHours: 48,
    terminal: isTerminal,
    createNextFollowup: !isTerminal,
    recommendedChannel: 'phone'
  };
}

// Calculate SLA Target Date string
export function calculateSLADate(slaHours: number, now = new Date()): string {
  if (slaHours <= 0) return new Date().toISOString().slice(0, 10);
  const date = new Date(now);
  date.setHours(date.getHours() + slaHours);

  // If Sunday, shift to Monday 9:30 AM
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
    date.setHours(9, 30, 0, 0);
  }

  // Outside 9 AM - 7 PM, shift to 9:30 AM next working day
  if (date.getHours() >= 19 || date.getHours() < 9) {
    if (date.getHours() >= 19) date.setDate(date.getDate() + 1);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    date.setHours(9, 30, 0, 0);
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
