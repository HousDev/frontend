import { masterDataAPI } from "./mastersAPI";
import type { MasterOption } from "./useMasterData";

export type MasterEntry = {
  id: string;
  name: string;
  options: MasterOption[];
};

export type VendorMasterCatalog = Record<string, MasterEntry>;

export const VENDOR_MASTER_TYPES = {
  salutation: "Salutation",
  status: "Vendor Status",
  category: "Vendor Category",
  countryCode: "Country Code",
  responseTime: "Vendor Response Time",
  serviceUnit: "Service Unit Type",
  tags: "Vendor Tags",
  services: "Vendor Services",
  languages: "Vendor Languages",
  certifications: "Vendor Certifications",
  weekDays: "Week Days",
} as const;

const ALIASES: Record<string, string[]> = {
  [VENDOR_MASTER_TYPES.salutation]: ["salutation"],
  [VENDOR_MASTER_TYPES.status]: ["vendor status", "status"],
  [VENDOR_MASTER_TYPES.category]: ["vendor category", "category"],
  [VENDOR_MASTER_TYPES.countryCode]: ["country code", "country codes"],
  [VENDOR_MASTER_TYPES.responseTime]: ["vendor response time", "response time"],
  [VENDOR_MASTER_TYPES.serviceUnit]: ["service unit type", "service unit", "service units"],
  [VENDOR_MASTER_TYPES.tags]: ["vendor tags"],
  [VENDOR_MASTER_TYPES.services]: ["vendor services"],
  [VENDOR_MASTER_TYPES.languages]: ["vendor languages"],
  [VENDOR_MASTER_TYPES.certifications]: ["vendor certifications"],
  [VENDOR_MASTER_TYPES.weekDays]: ["week days", "weekdays", "days of week"],
};

const normalizeKey = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

const isActiveValue = (item: any) => {
  const status = String(item?.status || "Active").toLowerCase();
  return status !== "inactive" && status !== "disabled";
};

export const getVendorMasterCatalog = async (): Promise<VendorMasterCatalog> => {
  const types = await masterDataAPI.getAllMasterTypes("common");
  const values = await Promise.all(
    (types || []).map((type: any) => masterDataAPI.getMasterValues(type.id).catch(() => []))
  );

  const catalog: VendorMasterCatalog = {};
  (types || []).forEach((type: any, index: number) => {
    const options = (values[index] || [])
      .filter(isActiveValue)
      .map((item: any) => ({
        value: item.value || item.name || "",
        label: item.value || item.name || "",
      }))
      .filter((option: MasterOption) => option.value);

    catalog[normalizeKey(type.name)] = {
      id: type.id,
      name: type.name,
      options,
    };
  });

  return catalog;
};

export const findMasterEntry = (
  catalog: VendorMasterCatalog,
  canonicalName: string
): MasterEntry | undefined => {
  const aliases = ALIASES[canonicalName] || [normalizeKey(canonicalName)];
  for (const alias of aliases) {
    if (catalog[alias]) return catalog[alias];
  }
  return undefined;
};

export const getMasterOptions = (
  catalog: VendorMasterCatalog,
  canonicalName: string
): MasterOption[] => findMasterEntry(catalog, canonicalName)?.options || [];

export const persistMasterOption = async (
  catalog: VendorMasterCatalog,
  canonicalName: string,
  rawValue: string
): Promise<{ catalog: VendorMasterCatalog; value: string }> => {
  const value = rawValue.trim();
  if (!value) return { catalog, value };

  let entry = findMasterEntry(catalog, canonicalName);
  if (!entry) {
    const created = await masterDataAPI.createMasterType({
      tabId: "common",
      name: canonicalName,
      status: "Active",
    });
    entry = {
      id: created.id,
      name: canonicalName,
      options: [],
    };
  }

  const exists = entry.options.some(
    (option) => option.value.toLowerCase() === value.toLowerCase()
  );
  if (!exists) {
    try {
      await masterDataAPI.createMasterValue(entry.id, { value, status: "Active" });
    } catch (error: any) {
      if (error?.response?.status !== 409) throw error;
    }
  }

  const nextCatalog = await getVendorMasterCatalog();
  return { catalog: nextCatalog, value };
};
