import { masterDataAPI } from "./mastersAPI";

export interface MasterOption {
  value: string;
  label: string;
}

export const getMasterDropdownOptions = async (tabIds: string[] = []) => {
  try {
    // Fetch all master types for the provided tab IDs
    const masterTypesArray = await Promise.all(
      tabIds.map(tabId => masterDataAPI.getAllMasterTypes(tabId))
    );

    // Flatten all master types into a single array
    const allMasterTypes = masterTypesArray.flat();

    // Fetch master values for each type
    const masterValuesArray = await Promise.all(
      allMasterTypes.map(masterType =>
        masterDataAPI.getMasterValues(masterType.id)
      )
    );

    // Organize into a key-value object
    const organizedData: Record<string, MasterOption[]> = {};

    allMasterTypes.forEach((masterType, index) => {
      const values = masterValuesArray[index] || [];
      organizedData[masterType.name.toLowerCase()] = values.map(item => ({
        value: item.value || item.name || 'Unknown', // ✅ use value instead of id
        label: item.value || item.name || 'Unknown'
      }));

    });

    return organizedData;
  } catch (error) {
    console.error('Error fetching master dropdown options', error);
    throw error;
  }
};


