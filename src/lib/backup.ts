import * as XLSX from 'xlsx';
import { loadFollowUps, loadMasterData } from './engine';
import { followUpMasterAPI } from './followUpMasterAPI';
import type { MasterData, SequenceStep } from './types';

export const moduleTables = [
  'fu_entities',
  'fu_follow_up_types',
  'fu_stages',
  'fu_statuses',
  'fu_outcomes',
  'fu_reasons',
  'fu_next_actions',
  'fu_priorities',
  'fu_sequences',
  'fu_rules',
  'fu_follow_ups',
] as const;

export type ModuleTable = (typeof moduleTables)[number];
export type ModuleRows = Partial<Record<ModuleTable, Record<string, unknown>[]>>;

export type ModuleBackup = {
  format: 'follow-up-center-module';
  version: 1;
  exported_at: string;
  tables: ModuleRows;
};

export const tableToMasterKey: Record<string, keyof MasterData> = {
  fu_entities: 'entities',
  fu_follow_up_types: 'followUpTypes',
  fu_stages: 'stages',
  fu_statuses: 'statuses',
  fu_outcomes: 'outcomes',
  fu_reasons: 'reasons',
  fu_next_actions: 'nextActions',
  fu_priorities: 'priorities',
  fu_rules: 'rules',
  fu_sequences: 'sequences',
};

export const tabToTableMap: Record<string, ModuleTable> = {
  rules: 'fu_rules',
  sequences: 'fu_sequences',
  entities: 'fu_entities',
  types: 'fu_follow_up_types',
  stages: 'fu_stages',
  statuses: 'fu_statuses',
  outcomes: 'fu_outcomes',
  reasons: 'fu_reasons',
  actions: 'fu_next_actions',
  priorities: 'fu_priorities',
  fu_rules: 'fu_rules',
  fu_sequences: 'fu_sequences',
  fu_entities: 'fu_entities',
  fu_follow_up_types: 'fu_follow_up_types',
  fu_stages: 'fu_stages',
  fu_statuses: 'fu_statuses',
  fu_outcomes: 'fu_outcomes',
  fu_reasons: 'fu_reasons',
  fu_next_actions: 'fu_next_actions',
  fu_priorities: 'fu_priorities',
  fu_follow_ups: 'fu_follow_ups',
};

const importOrder: ModuleTable[] = [
  'fu_entities',
  'fu_follow_up_types',
  'fu_stages',
  'fu_statuses',
  'fu_outcomes',
  'fu_reasons',
  'fu_next_actions',
  'fu_priorities',
  'fu_sequences',
  'fu_rules',
  'fu_follow_ups',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanRow(table: ModuleTable, row: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...row };
  delete cleaned.created_at;
  delete cleaned.updated_at;
  return cleaned;
}

// Map database row to user-friendly Excel row
export function formatRowForExcel(table: ModuleTable, row: Record<string, any>): Record<string, any> {
  const cleaned = cleanRow(table, row);
  if (table === 'fu_rules') {
    return {
      'Rule ID': cleaned.rule_id || cleaned.name || cleaned.id || '',
      'Entity Code': cleaned.entity_code || '',
      'Follow-Up Type': cleaned.follow_up_type_code || '',
      'Current Stage': cleaned.current_stage_code || '',
      'Current Status': cleaned.current_status_code || '',
      'Outcome Code': cleaned.outcome_code || '',
      'Reason Code': cleaned.reason_code || '',
      'Next Stage': cleaned.next_stage_code || '',
      'Next Status': cleaned.next_status_code || '',
      'Next Action': cleaned.next_action_code || '',
      'Next Follow-Up Type': cleaned.next_follow_up_type_code || '',
      'Gap Days': cleaned.gap_days ?? cleaned.default_days ?? 0,
      'Gap Hours': cleaned.gap_hours ?? 0,
      'Priority': cleaned.priority_code || '',
      'Auto Remark': cleaned.auto_remark_template || cleaned.remark || '',
      'Sequence Name': cleaned.sequence_name || '',
      'Auto Send Channel': cleaned.auto_send_channel || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_sequences') {
    return {
      'Sequence Name': cleaned.sequence_name || '',
      'Step': cleaned.step ?? 1,
      'After Days': cleaned.after_days ?? 0,
      'After Hours': cleaned.after_hours ?? 0,
      'Action Code': cleaned.action_code || '',
      'Follow-Up Type': cleaned.follow_up_type_code || '',
      'Priority': cleaned.priority_code || '',
      'Terminal Step': cleaned.terminal_step ? 'YES' : 'NO',
      'Next Status': cleaned.next_status_code || '',
      'Reason Code': cleaned.reason_code || '',
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_entities') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_follow_up_types') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Entity Code': cleaned.entity_code || '',
      'Icon': cleaned.icon || cleaned.icon_name || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_stages' || table === 'fu_statuses') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Entity Code': cleaned.entity_code || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_outcomes') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Follow-Up Type': cleaned.follow_up_type_code || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_reasons') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Outcome Code': cleaned.outcome_code || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_next_actions') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Follow-Up Type': cleaned.follow_up_type_code || '',
      'Display Order': cleaned.display_order ?? 0,
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  if (table === 'fu_priorities') {
    return {
      'Code': cleaned.code || '',
      'Name': cleaned.name || '',
      'Level': cleaned.level ?? 1,
      'Color': cleaned.color || '',
      'Active': cleaned.is_active ? 'YES' : 'NO',
    };
  }
  return cleaned;
}

// Convert Excel row headers back to database column names
export function normalizeExcelRow(table: ModuleTable, raw: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  for (const [key, val] of Object.entries(raw)) {
    const k = key.trim().toLowerCase().replace(/[\s\-_]+/g, '');
    const v = typeof val === 'string' ? val.trim() : val;

    if (k === 'ruleid' || k === 'name' || k === 'rulename') {
      normalized.name = v;
      normalized.rule_id = v;
    } else if (k === 'entitycode' || k === 'entity') {
      normalized.entity_code = v;
    } else if (k === 'followuptype' || k === 'followuptypecode' || k === 'type') {
      normalized.follow_up_type_code = v;
    } else if (k === 'currentstage' || k === 'currentstagecode' || k === 'stage') {
      normalized.current_stage_code = v;
    } else if (k === 'currentstatus' || k === 'currentstatuscode' || k === 'status') {
      normalized.current_status_code = v;
    } else if (k === 'outcome' || k === 'outcomecode') {
      normalized.outcome_code = v;
    } else if (k === 'reason' || k === 'reasoncode') {
      normalized.reason_code = v ? v : null;
    } else if (k === 'nextstage' || k === 'nextstagecode') {
      normalized.next_stage_code = v;
    } else if (k === 'nextstatus' || k === 'nextstatuscode') {
      normalized.next_status_code = v;
    } else if (k === 'nextaction' || k === 'nextactioncode' || k === 'action') {
      normalized.next_action_code = v;
      normalized.action_code = v;
    } else if (k === 'nextfollowuptype' || k === 'nextfollowuptypecode') {
      normalized.next_follow_up_type_code = v ? v : null;
    } else if (k === 'gapdays' || k === 'defaultdays' || k === 'afterdays') {
      normalized.gap_days = Number(v) || 0;
      normalized.default_days = Number(v) || 0;
      normalized.after_days = Number(v) || 0;
    } else if (k === 'gaphours' || k === 'afterhours') {
      normalized.gap_hours = Number(v) || 0;
      normalized.after_hours = Number(v) || 0;
    } else if (k === 'priority' || k === 'prioritycode') {
      normalized.priority_code = String(v).toUpperCase();
    } else if (k === 'autoremark' || k === 'autoremarktemplate' || k === 'remark') {
      normalized.auto_remark_template = v;
      normalized.remark = v;
    } else if (k === 'sequence' || k === 'sequencename') {
      normalized.sequence_name = v ? v : null;
    } else if (k === 'step') {
      normalized.step = Number(v) || 1;
    } else if (k === 'terminalstep' || k === 'terminal') {
      normalized.terminal_step = String(v).toLowerCase() === 'yes' || String(v) === '1' || v === true ? 1 : 0;
      normalized.terminal = normalized.terminal_step === 1;
    } else if (k === 'code') {
      normalized.code = v;
    } else if (k === 'level') {
      normalized.level = Number(v) || 1;
    } else if (k === 'icon' || k === 'iconname') {
      normalized.icon = v;
      normalized.icon_name = v;
    } else if (k === 'displayorder' || k === 'order') {
      normalized.display_order = Number(v) || 0;
    } else if (k === 'active' || k === 'isactive') {
      normalized.is_active = String(v).toLowerCase() === 'no' || String(v) === '0' || v === false ? 0 : 1;
    } else {
      normalized[key] = v;
    }
  }

  if (raw.id) {
    normalized.id = raw.id;
  } else if (!normalized.id) {
    normalized.id =
      normalized.rule_id ||
      normalized.code ||
      normalized.name ||
      `${table.replace('fu_', '')}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  if (!normalized.name && (normalized.rule_id || normalized.code)) {
    normalized.name = normalized.rule_id || normalized.code;
  }

  return normalized;
}

// Export a single tab or table to JSON (.json)
export function exportTabToJSON(tabKey: string, master: MasterData, rowsOverride?: any[]): void {
  const table = tabToTableMap[tabKey] || 'fu_rules';
  const masterKey = tableToMasterKey[table];
  const list = rowsOverride ?? (masterKey && Array.isArray(master[masterKey]) ? (master[masterKey] as any[]) : []);

  const cleanList = list.map((r) => cleanRow(table, r));
  const jsonContent = JSON.stringify(cleanList, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  const sheetName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  const fileName = `${sheetName}_Rules_${new Date().toISOString().slice(0, 10)}.json`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export all modules into a comprehensive JSON file
export function exportAllModulesToJSON(master: MasterData): void {
  const tables: ModuleRows = {};
  for (const table of moduleTables) {
    const masterKey = tableToMasterKey[table];
    if (masterKey && Array.isArray(master[masterKey])) {
      tables[table] = (master[masterKey] as any[]).map((r) => cleanRow(table, r));
    }
  }

  const payload: ModuleBackup = {
    format: 'follow-up-center-module',
    version: 1,
    exported_at: new Date().toISOString(),
    tables,
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `follow-up-center-module-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export a single tab or table to Excel (.xlsx)
export function exportTabToExcel(tabKey: string, master: MasterData, rowsOverride?: any[]): void {
  const table = tabToTableMap[tabKey] || 'fu_rules';
  const masterKey = tableToMasterKey[table];
  const list = rowsOverride ?? (masterKey && Array.isArray(master[masterKey]) ? (master[masterKey] as any[]) : []);

  const formattedRows = list.map((r) => formatRowForExcel(table, r));
  const ws = XLSX.utils.json_to_sheet(formattedRows.length > 0 ? formattedRows : [{}]);
  const wb = XLSX.utils.book_new();

  const sheetName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const fileName = `${sheetName}_Master_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Export all modules into a multi-sheet Excel (.xlsx) workbook
export function exportAllModulesToExcel(master: MasterData): void {
  const wb = XLSX.utils.book_new();

  const sheetConfigs: { name: string; table: ModuleTable; key: keyof MasterData }[] = [
    { name: 'Rules', table: 'fu_rules', key: 'rules' },
    { name: 'Sequences', table: 'fu_sequences', key: 'sequences' },
    { name: 'Entities', table: 'fu_entities', key: 'entities' },
    { name: 'FollowUpTypes', table: 'fu_follow_up_types', key: 'followUpTypes' },
    { name: 'Stages', table: 'fu_stages', key: 'stages' },
    { name: 'Statuses', table: 'fu_statuses', key: 'statuses' },
    { name: 'Outcomes', table: 'fu_outcomes', key: 'outcomes' },
    { name: 'Reasons', table: 'fu_reasons', key: 'reasons' },
    { name: 'Actions', table: 'fu_next_actions', key: 'nextActions' },
    { name: 'Priorities', table: 'fu_priorities', key: 'priorities' },
  ];

  for (const cfg of sheetConfigs) {
    const list = Array.isArray(master[cfg.key]) ? (master[cfg.key] as any[]) : [];
    const formatted = list.map((r) => formatRowForExcel(cfg.table, r));
    const ws = XLSX.utils.json_to_sheet(formatted.length > 0 ? formatted : [{ 'Code': '', 'Name': '' }]);
    XLSX.utils.book_append_sheet(wb, ws, cfg.name);
  }

  const fileName = `FollowUp_Master_All_Modules_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Download a sample template JSON (.json) file with pre-filled sample rows
export function downloadSampleJSONTemplate(tabKey: string): void {
  const table = tabToTableMap[tabKey] || 'fu_rules';
  let sampleRows: Record<string, any>[] = [];

  if (table === 'fu_rules') {
    sampleRows = [
      {
        id: 'FUR-001',
        rule_id: 'FUR-001',
        name: 'FUR-001',
        entity_code: 'LEAD',
        follow_up_type_code: 'CALL',
        current_stage_code: 'INITIAL_CONTACT',
        current_status_code: 'IN_PROGRESS',
        outcome_code: 'NO_ANSWER',
        reason_code: null,
        next_stage_code: 'INITIAL_CONTACT',
        next_status_code: 'NOT_CONNECTED',
        next_action_code: 'CALL',
        next_follow_up_type_code: 'CALL',
        gap_days: 1,
        gap_hours: 0,
        priority_code: 'MEDIUM',
        auto_remark_template: 'Lead did not answer. Retry call next day.',
        sequence_name: 'NO_ANSWER_DRIP',
        auto_send_channel: 'WHATSAPP',
        display_order: 1,
        is_active: 1,
      },
      {
        id: 'FUR-002',
        rule_id: 'FUR-002',
        name: 'FUR-002',
        entity_code: 'LEAD',
        follow_up_type_code: 'CALL',
        current_stage_code: 'INITIAL_CONTACT',
        current_status_code: 'IN_PROGRESS',
        outcome_code: 'CONNECTED',
        reason_code: null,
        next_stage_code: 'REQUIREMENT_QUALIFIED',
        next_status_code: 'QUALIFIED',
        next_action_code: 'WHATSAPP',
        next_follow_up_type_code: 'WHATSAPP',
        gap_days: 0,
        gap_hours: 2,
        priority_code: 'HIGH',
        auto_remark_template: 'Lead connected and qualified. Send property options on WhatsApp.',
        sequence_name: null,
        auto_send_channel: 'WHATSAPP',
        display_order: 2,
        is_active: 1,
      },
    ];
  } else if (table === 'fu_sequences') {
    sampleRows = [
      {
        sequence_name: 'NO_ANSWER_DRIP',
        step: 1,
        after_days: 1,
        after_hours: 0,
        action_code: 'CALL',
        follow_up_type_code: 'CALL',
        priority_code: 'MEDIUM',
        terminal_step: 0,
        next_status_code: 'NOT_CONNECTED',
        reason_code: null,
        is_active: 1,
      },
      {
        sequence_name: 'NO_ANSWER_DRIP',
        step: 2,
        after_days: 2,
        after_hours: 0,
        action_code: 'WHATSAPP',
        follow_up_type_code: 'WHATSAPP',
        priority_code: 'LOW',
        terminal_step: 1,
        next_status_code: 'ON_HOLD',
        reason_code: null,
        is_active: 1,
      },
    ];
  } else {
    sampleRows = [
      { code: 'SAMPLE_01', name: 'Sample Item 1', is_active: 1, display_order: 1 },
      { code: 'SAMPLE_02', name: 'Sample Item 2', is_active: 1, display_order: 2 },
    ];
  }

  const jsonContent = JSON.stringify(sampleRows, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const sheetName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  link.download = `Sample_Template_${sheetName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download a sample template Excel (.xlsx) file with pre-filled sample rows
export function downloadSampleExcelTemplate(tabKey: string): void {
  const table = tabToTableMap[tabKey] || 'fu_rules';
  let sampleRows: Record<string, any>[] = [];

  if (table === 'fu_rules') {
    sampleRows = [
      {
        'Rule ID': 'FUR-001',
        'Entity Code': 'LEAD',
        'Follow-Up Type': 'CALL',
        'Current Stage': 'INITIAL_CONTACT',
        'Current Status': 'IN_PROGRESS',
        'Outcome Code': 'NO_ANSWER',
        'Reason Code': '',
        'Next Stage': 'INITIAL_CONTACT',
        'Next Status': 'NOT_CONNECTED',
        'Next Action': 'CALL',
        'Next Follow-Up Type': 'CALL',
        'Gap Days': 1,
        'Gap Hours': 0,
        'Priority': 'MEDIUM',
        'Auto Remark': 'Lead did not answer. Retry call next day.',
        'Sequence Name': 'NO_ANSWER_DRIP',
        'Auto Send Channel': 'WHATSAPP',
        'Display Order': 1,
        'Active': 'YES',
      },
      {
        'Rule ID': 'FUR-002',
        'Entity Code': 'LEAD',
        'Follow-Up Type': 'CALL',
        'Current Stage': 'INITIAL_CONTACT',
        'Current Status': 'IN_PROGRESS',
        'Outcome Code': 'CONNECTED',
        'Reason Code': '',
        'Next Stage': 'REQUIREMENT_QUALIFIED',
        'Next Status': 'QUALIFIED',
        'Next Action': 'WHATSAPP',
        'Next Follow-Up Type': 'WHATSAPP',
        'Gap Days': 0,
        'Gap Hours': 2,
        'Priority': 'HIGH',
        'Auto Remark': 'Lead connected and qualified. Send property options on WhatsApp.',
        'Sequence Name': '',
        'Auto Send Channel': 'WHATSAPP',
        'Display Order': 2,
        'Active': 'YES',
      },
    ];
  } else if (table === 'fu_sequences') {
    sampleRows = [
      {
        'Sequence Name': 'NO_ANSWER_DRIP',
        'Step': 1,
        'After Days': 1,
        'After Hours': 0,
        'Action Code': 'CALL',
        'Follow-Up Type': 'CALL',
        'Priority': 'MEDIUM',
        'Terminal Step': 'NO',
        'Next Status': 'NOT_CONNECTED',
        'Reason Code': '',
        'Active': 'YES',
      },
      {
        'Sequence Name': 'NO_ANSWER_DRIP',
        'Step': 2,
        'After Days': 2,
        'After Hours': 0,
        'Action Code': 'WHATSAPP',
        'Follow-Up Type': 'WHATSAPP',
        'Priority': 'LOW',
        'Terminal Step': 'YES',
        'Next Status': 'ON_HOLD',
        'Reason Code': '',
        'Active': 'YES',
      },
    ];
  } else if (table === 'fu_entities') {
    sampleRows = [
      { 'Code': 'LEAD', 'Name': 'Lead', 'Display Order': 1, 'Active': 'YES' },
      { 'Code': 'BUYER', 'Name': 'Buyer', 'Display Order': 2, 'Active': 'YES' },
      { 'Code': 'SELLER', 'Name': 'Seller', 'Display Order': 3, 'Active': 'YES' },
    ];
  } else if (table === 'fu_follow_up_types') {
    sampleRows = [
      { 'Code': 'CALL', 'Name': 'Phone Call', 'Entity Code': 'LEAD', 'Icon': 'Phone', 'Display Order': 1, 'Active': 'YES' },
      { 'Code': 'WHATSAPP', 'Name': 'WhatsApp', 'Entity Code': 'LEAD', 'Icon': 'MessageCircle', 'Display Order': 2, 'Active': 'YES' },
      { 'Code': 'SITE_VISIT', 'Name': 'Site Visit', 'Entity Code': 'LEAD', 'Icon': 'MapPin', 'Display Order': 3, 'Active': 'YES' },
    ];
  } else if (table === 'fu_stages' || table === 'fu_statuses') {
    sampleRows = [
      { 'Code': 'NEW', 'Name': 'New', 'Entity Code': 'LEAD', 'Display Order': 1, 'Active': 'YES' },
      { 'Code': 'IN_PROGRESS', 'Name': 'In Progress', 'Entity Code': 'LEAD', 'Display Order': 2, 'Active': 'YES' },
    ];
  } else if (table === 'fu_outcomes') {
    sampleRows = [
      { 'Code': 'CONNECTED', 'Name': 'Connected', 'Follow-Up Type': 'CALL', 'Display Order': 1, 'Active': 'YES' },
      { 'Code': 'NO_ANSWER', 'Name': 'No Answer', 'Follow-Up Type': 'CALL', 'Display Order': 2, 'Active': 'YES' },
    ];
  } else if (table === 'fu_reasons') {
    sampleRows = [
      { 'Code': 'WRONG_NUMBER', 'Name': 'Invalid / Wrong Number', 'Outcome Code': 'NO_ANSWER', 'Display Order': 1, 'Active': 'YES' },
    ];
  } else if (table === 'fu_next_actions') {
    sampleRows = [
      { 'Code': 'CALL', 'Name': 'Phone Call', 'Follow-Up Type': 'CALL', 'Display Order': 1, 'Active': 'YES' },
      { 'Code': 'WHATSAPP', 'Name': 'Send WhatsApp Message', 'Follow-Up Type': 'WHATSAPP', 'Display Order': 2, 'Active': 'YES' },
    ];
  } else if (table === 'fu_priorities') {
    sampleRows = [
      { 'Code': 'URGENT', 'Name': 'Urgent', 'Level': 1, 'Color': '#ef4444', 'Active': 'YES' },
      { 'Code': 'HIGH', 'Name': 'High', 'Level': 2, 'Color': '#f97316', 'Active': 'YES' },
      { 'Code': 'MEDIUM', 'Name': 'Medium', 'Level': 3, 'Color': '#eab308', 'Active': 'YES' },
      { 'Code': 'LOW', 'Name': 'Low', 'Level': 4, 'Color': '#3b82f6', 'Active': 'YES' },
    ];
  }

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  const sheetName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `Sample_Template_${sheetName}.xlsx`);
}

export function parseJsonFileToBackup(parsed: unknown, activeTab: string): ModuleBackup {
  const activeTable = tabToTableMap[activeTab] || 'fu_rules';
  const tables: ModuleRows = {};

  // Case 1: Plain Array of objects (e.g. [ { name: 'FUR-001', ... } ])
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error('The JSON file contains an empty array.');
    tables[activeTable] = parsed.map((item) => normalizeExcelRow(activeTable, item));
    return {
      format: 'follow-up-center-module',
      version: 1,
      exported_at: new Date().toISOString(),
      tables,
    };
  }

  // Case 2: Object with table keys or standard backup
  if (isRecord(parsed)) {
    // If standard backup with parsed.tables
    if (isRecord(parsed.tables)) {
      for (const table of moduleTables) {
        const rows = (parsed.tables as Record<string, unknown>)[table];
        if (Array.isArray(rows) && rows.length > 0) {
          tables[table] = rows.map((r) => normalizeExcelRow(table, r));
        }
      }
    }

    // Check direct keys like rules, fu_rules, sequences, etc.
    const keyMap: Record<string, ModuleTable> = {
      rules: 'fu_rules',
      fu_rules: 'fu_rules',
      sequences: 'fu_sequences',
      fu_sequences: 'fu_sequences',
      entities: 'fu_entities',
      fu_entities: 'fu_entities',
      followUpTypes: 'fu_follow_up_types',
      fu_follow_up_types: 'fu_follow_up_types',
      stages: 'fu_stages',
      fu_stages: 'fu_stages',
      statuses: 'fu_statuses',
      fu_statuses: 'fu_statuses',
      outcomes: 'fu_outcomes',
      fu_outcomes: 'fu_outcomes',
      reasons: 'fu_reasons',
      fu_reasons: 'fu_reasons',
      nextActions: 'fu_next_actions',
      fu_next_actions: 'fu_next_actions',
      priorities: 'fu_priorities',
      fu_priorities: 'fu_priorities',
    };

    for (const [k, tbl] of Object.entries(keyMap)) {
      const rows = parsed[k];
      if (Array.isArray(rows) && rows.length > 0) {
        tables[tbl] = rows.map((r) => normalizeExcelRow(tbl, r));
      }
    }

    // If single record object (not containing array keys)
    if (Object.keys(tables).length === 0 && (parsed.name || parsed.code || parsed.entity_code)) {
      tables[activeTable] = [normalizeExcelRow(activeTable, parsed)];
    }

    if (Object.keys(tables).length > 0) {
      return {
        format: 'follow-up-center-module',
        version: 1,
        exported_at: new Date().toISOString(),
        tables,
      };
    }
  }

  throw new Error('Could not parse valid Follow-up rules or master data from the uploaded JSON file.');
}

// Import Excel (.xlsx, .xls, .csv) or JSON Backup File
export async function importExcelOrFile(
  file: File,
  activeTab: string,
  _master: MasterData
): Promise<{ tables: number; rows: number; duplicatesSkipped: number }> {
  const isJson = file.name.endsWith('.json');

  if (isJson) {
    const text = await file.text();
    const rawParsed = JSON.parse(text) as unknown;
    const backup = parseJsonFileToBackup(rawParsed, activeTab);
    return await importModuleBackup(backup);
  }

  // Parse Excel / CSV using XLSX
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const backupTables: ModuleRows = {};
  const activeTable = tabToTableMap[activeTab] || 'fu_rules';

  // Check if workbook has multiple named sheets
  const sheetNameToTable: Record<string, ModuleTable> = {
    rules: 'fu_rules',
    fu_rules: 'fu_rules',
    sequences: 'fu_sequences',
    fu_sequences: 'fu_sequences',
    entities: 'fu_entities',
    fu_entities: 'fu_entities',
    types: 'fu_follow_up_types',
    followuptypes: 'fu_follow_up_types',
    fu_follow_up_types: 'fu_follow_up_types',
    stages: 'fu_stages',
    fu_stages: 'fu_stages',
    statuses: 'fu_statuses',
    fu_statuses: 'fu_statuses',
    outcomes: 'fu_outcomes',
    fu_outcomes: 'fu_outcomes',
    reasons: 'fu_reasons',
    fu_reasons: 'fu_reasons',
    actions: 'fu_next_actions',
    nextactions: 'fu_next_actions',
    fu_next_actions: 'fu_next_actions',
    priorities: 'fu_priorities',
    fu_priorities: 'fu_priorities',
  };

  let recognizedSheets = 0;
  for (const sheetName of wb.SheetNames) {
    const normalizedSheet = sheetName.trim().toLowerCase().replace(/[\s\-_]+/g, '');
    const table = sheetNameToTable[normalizedSheet];
    if (table) {
      recognizedSheets++;
      const ws = wb.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      if (rawRows.length > 0) {
        backupTables[table] = rawRows.map((r) => normalizeExcelRow(table, r));
      }
    }
  }

  // If only a single generic sheet was uploaded, import into currently active tab
  if (recognizedSheets === 0 && wb.SheetNames.length > 0) {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    if (rawRows.length > 0) {
      backupTables[activeTable] = rawRows.map((r) => normalizeExcelRow(activeTable, r));
    }
  }

  if (Object.keys(backupTables).length === 0) {
    throw new Error('No valid data rows found in the uploaded Excel file.');
  }

  return await importModuleBackup({
    format: 'follow-up-center-module',
    version: 1,
    exported_at: new Date().toISOString(),
    tables: backupTables,
  });
}

export function validateModuleBackup(value: unknown): ModuleBackup {
  if (!isRecord(value) || value.format !== 'follow-up-center-module' || value.version !== 1 || !isRecord(value.tables)) {
    throw new Error('This file is not a valid Follow-up Center module export.');
  }

  const tables: ModuleRows = {};
  for (const table of moduleTables) {
    const rows = value.tables[table];
    if (rows === undefined) continue;
    if (!Array.isArray(rows) || rows.some((row) => !isRecord(row))) {
      throw new Error(`The ${table.replace('fu_', '').replace(/_/g, ' ')} data is not a valid list.`);
    }
    tables[table] = rows as Record<string, unknown>[];
  }

  if (Object.keys(tables).length === 0) {
    throw new Error('The module file does not contain any importable data.');
  }

  return {
    format: 'follow-up-center-module',
    version: 1,
    exported_at: typeof value.exported_at === 'string' ? value.exported_at : new Date().toISOString(),
    tables,
  };
}

export async function importModuleBackup(backup: ModuleBackup): Promise<{ tables: number; rows: number; duplicatesSkipped: number }> {
  let tableCount = 0;
  let rowCount = 0;
  let duplicatesSkipped = 0;

  // Try importing on backend first
  try {
    const backendResult = await followUpMasterAPI.importModule(backup.tables as Record<string, any[]>);
    if (backendResult && backendResult.result) {
      tableCount = backendResult.result.importedTables || 0;
      rowCount = backendResult.result.importedRows || 0;
      duplicatesSkipped = backendResult.result.duplicatesSkipped || 0;
    }
  } catch (err) {
    console.warn('Backend module import failed, storing locally:', err);
  }

  const master = await loadMasterData();

  for (const table of importOrder) {
    const rows = backup.tables[table];
    if (!rows || rows.length === 0) continue;

    if (table === 'fu_follow_ups') {
      try {
        const raw = localStorage.getItem('fu_follow_ups_data');
        const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
        const merged = [...rows.map((r, i) => ({ ...r, id: (r.id as string) || `fu_imp_${Date.now()}_${i}` })), ...existing];
        localStorage.setItem('fu_follow_ups_data', JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to import follow ups', err);
      }
    } else {
      const key = tableToMasterKey[table];
        const newRecords = rows.map((r, i) => {
          let id = r.id as string;
          if (!id) {
            if (table === 'fu_rules') id = (r.rule_id as string) || (r.name as string) || `rule_${i}`;
            else if (table === 'fu_sequences') id = `${r.sequence_name}_STEP_${r.step}`;
            else if (table === 'fu_stages' || table === 'fu_statuses') id = `${r.entity_code || 'GEN'}_${r.code || r.name}`;
            else if (table === 'fu_outcomes') id = `${r.follow_up_type_code || 'ALL'}_${r.code || r.name}`;
            else if (table === 'fu_reasons') id = `${r.outcome_code ? r.outcome_code + '_' : ''}${r.code || r.name}`;
            else id = (r.code as string) || (r.name as string) || `imp_${table}_${i}`;
          }
          return {
            ...r,
            id,
            is_active: r.is_active !== undefined ? r.is_active : 1,
          };
        });
        (master as unknown as Record<string, unknown>)[key] = newRecords;
    }

    if (tableCount === 0 && rows.length > 0) tableCount += 1;
    if (rowCount === 0) rowCount += rows.length;
  }

  localStorage.setItem('fu_master_data_v3', JSON.stringify(master));
  return { tables: tableCount || Object.keys(backup.tables).length, rows: rowCount, duplicatesSkipped };
}

export function downloadModuleBackup(backup: ModuleBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `follow-up-center-module-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportSequenceBackup(sequenceName: string): Promise<ModuleBackup> {
  const master = await loadMasterData();
  const matched = (master.sequences ?? []).filter((s) => s.sequence_name === sequenceName);
  if (matched.length === 0) throw new Error('Could not export this sequence.');
  const rows = matched.map((row) => cleanRow('fu_sequences', row as unknown as Record<string, unknown>));
  return {
    format: 'follow-up-center-module',
    version: 1,
    exported_at: new Date().toISOString(),
    tables: { fu_sequences: rows },
  };
}

export function downloadSequenceBackup(backup: ModuleBackup, sequenceName: string): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sequence-${sequenceName.toLowerCase().replace(/_/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function deleteSequenceByName(sequenceName: string): Promise<boolean> {
  try {
    await followUpMasterAPI.deleteSequence(sequenceName);
    const master = await loadMasterData();
    master.sequences = (master.sequences ?? []).filter((s: SequenceStep) => s.sequence_name !== sequenceName);
    localStorage.setItem('fu_master_data_v3', JSON.stringify(master));
    return true;
  } catch (err) {
    console.error('Failed to delete sequence', err);
    return false;
  }
}
