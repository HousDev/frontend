import { MasterOption } from './useMasterData';

/**
 * Extracts the first continuous numeric sequence from a string (e.g., "2 BHK" -> "2", "3.5 BHK" -> "3.5", "Studio" -> "1")
 */
export const extractNumber = (str: string): string | null => {
  if (!str) return null;
  const s = String(str).trim();
  const lower = s.toLowerCase();
  
  if (lower.includes('studio') || lower === '1rk' || lower === '1 rk') {
    return '1';
  }

  const match = s.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
};

/**
 * Finds the exact or closest matching option value in a master options array for a target number
 */
export const findMatchingOptionValue = (options: MasterOption[] = [], targetNumber: string): string => {
  if (!targetNumber || !Array.isArray(options) || options.length === 0) return targetNumber || '';
  const numStr = String(targetNumber).trim();

  // 1. Exact value or label match
  const exact = options.find((o) => String(o.value).trim() === numStr || String(o.label).trim() === numStr);
  if (exact) return String(exact.value);

  // 2. Option starts with number (e.g. "2 Bedrooms", "2 BHK", "2 Baths")
  const starts = options.find((o) => {
    const v = String(o.value).trim();
    const l = String(o.label).trim();
    return v.startsWith(numStr) || l.startsWith(numStr);
  });
  if (starts) return String(starts.value);

  // 3. Option contains number digits
  const digitMatch = options.find((o) => {
    const vNum = (String(o.value).match(/\d+/) || [])[0];
    const lNum = (String(o.label).match(/\d+/) || [])[0];
    return vNum === numStr || lNum === numStr;
  });
  if (digitMatch) return String(digitMatch.value);

  return numStr;
};

/**
 * Sorts master options numerically (e.g., 1, 2, 3, 4, 5, 10...)
 */
export const sortNumericOptions = (options: MasterOption[] = []): MasterOption[] => {
  return [...options].sort((a, b) => {
    const textA = (a.label || a.value || '').trim();
    const textB = (b.label || b.value || '').trim();
    const matchA = textA.match(/^(\d+(?:\.\d+)?)/);
    const matchB = textB.match(/^(\d+(?:\.\d+)?)/);
    const numA = matchA ? parseFloat(matchA[1]) : NaN;
    const numB = matchB ? parseFloat(matchB[1]) : NaN;
    const isNumA = !isNaN(numA);
    const isNumB = !isNaN(numB);

    if (isNumA && isNumB) {
      if (numA !== numB) return numA - numB;
      return textA.localeCompare(textB, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (isNumA) return -1;
    if (isNumB) return 1;
    return textA.localeCompare(textB, undefined, { numeric: true, sensitivity: 'base' });
  });
};

/**
 * Filters property subtypes based on property type (Residential vs Commercial vs Plot/Land)
 */
export const getSubtypeOptions = (
  allSubtypes: MasterOption[] = [],
  propertyType: string = '',
  typeLabel: string = ''
): MasterOption[] => {
  if (!propertyType && !typeLabel) return allSubtypes;
  const typeLower = String(typeLabel || propertyType).toLowerCase();

  const filtered = allSubtypes.filter((opt) => {
    const label = String(opt.label || opt.value || '').toLowerCase();
    const parent = String((opt as any).parent || (opt as any).property_type || '').toLowerCase();

    if (parent) return parent.includes(typeLower) || typeLower.includes(parent);

    if (typeLower.includes('residen') || typeLower.includes('flat') || typeLower.includes('apart') || typeLower.includes('home') || typeLower.includes('villa') || typeLower.includes('house')) {
      return !label.includes('commercial') && !label.includes('office') && !label.includes('shop') && !label.includes('warehouse') && !label.includes('industrial') && !label.includes('showroom') && !label.includes('co-working') && !label.includes('godown') && !label.includes('plot') && !label.includes('land') && !label.includes('agri');
    }
    if (typeLower.includes('comm') || typeLower.includes('office') || typeLower.includes('retail') || typeLower.includes('business') || typeLower.includes('shop') || typeLower.includes('industr')) {
      return label.includes('office') || label.includes('shop') || label.includes('showroom') || label.includes('commercial') || label.includes('warehouse') || label.includes('retail') || label.includes('co-working') || label.includes('industrial') || label.includes('building') || label.includes('godown') || label.includes('shed') || label.includes('plaza') || label.includes('mall');
    }
    if (typeLower.includes('plot') || typeLower.includes('land') || typeLower.includes('agri') || typeLower.includes('farm')) {
      return label.includes('plot') || label.includes('land') || label.includes('na') || label.includes('farm') || label.includes('agri') || label.includes('open');
    }
    return true;
  });

  return filtered.length > 0 ? filtered : allSubtypes;
};

/**
 * Filters unit types based on property type & property subtype
 */
export const getUnitTypeOptions = (
  allUnits: MasterOption[] = [],
  propertyType: string = '',
  propertySubtype: string = '',
  typeLabel: string = '',
  subtypeLabel: string = ''
): MasterOption[] => {
  const typeLower = String(typeLabel || propertyType).toLowerCase();
  const subtypeLower = String(subtypeLabel || propertySubtype).toLowerCase();

  const isCommercial =
    typeLower.includes('comm') ||
    typeLower.includes('office') ||
    typeLower.includes('retail') ||
    typeLower.includes('shop') ||
    typeLower.includes('industr') ||
    subtypeLower.includes('office') ||
    subtypeLower.includes('shop') ||
    subtypeLower.includes('showroom') ||
    subtypeLower.includes('warehouse') ||
    subtypeLower.includes('retail') ||
    subtypeLower.includes('commercial') ||
    subtypeLower.includes('industrial') ||
    subtypeLower.includes('godown');

  const isPlot =
    typeLower.includes('plot') ||
    typeLower.includes('land') ||
    typeLower.includes('agri') ||
    subtypeLower.includes('plot') ||
    subtypeLower.includes('land') ||
    subtypeLower.includes('farm') ||
    subtypeLower.includes('agri');

  if (isCommercial) {
    const commUnits = allUnits.filter((u) => {
      const l = String(u.label || u.value || '').toLowerCase();
      return (
        l.includes('office') ||
        l.includes('shop') ||
        l.includes('showroom') ||
        l.includes('space') ||
        l.includes('sqft') ||
        l.includes('sq.ft') ||
        l.includes('hall') ||
        l.includes('floor') ||
        l.includes('shell') ||
        l.includes('ready') ||
        l.includes('furnished') ||
        l.includes('retail') ||
        l.includes('cabin') ||
        l.includes('desk') ||
        l.includes('godown') ||
        l.includes('unit') ||
        l.includes('commercial')
      );
    });
    if (commUnits.length > 0) return sortNumericOptions(commUnits);
  }

  if (isPlot) {
    const plotUnits = allUnits.filter((u) => {
      const l = String(u.label || u.value || '').toLowerCase();
      return (
        l.includes('plot') ||
        l.includes('land') ||
        l.includes('sq') ||
        l.includes('acre') ||
        l.includes('guntha') ||
        l.includes('gaj') ||
        l.includes('bigha') ||
        l.includes('yard') ||
        l.includes('farm')
      );
    });
    if (plotUnits.length > 0) return sortNumericOptions(plotUnits);
  }

  // If Residential, optionally filter out purely commercial/plot items if BHK options exist
  if (typeLower.includes('residen') || typeLower.includes('flat') || typeLower.includes('apart') || typeLower.includes('home') || subtypeLower.includes('flat') || subtypeLower.includes('apart') || subtypeLower.includes('villa') || subtypeLower.includes('row')) {
    const resUnits = allUnits.filter((u) => {
      const l = String(u.label || u.value || '').toLowerCase();
      return (
        l.includes('bhk') ||
        l.includes('rk') ||
        l.includes('bed') ||
        l.includes('room') ||
        l.includes('studio') ||
        l.includes('penthouse') ||
        l.includes('duplex') ||
        l.includes('villa') ||
        l.includes('simplex') ||
        l.includes('flat') ||
        l.includes('apartment') ||
        l.includes('house') ||
        /\d+/.test(l)
      );
    });
    if (resUnits.length > 0) return sortNumericOptions(resUnits);
  }

  return sortNumericOptions(allUnits);
};

/**
 * Returns sorted bedroom options
 */
export const getBedroomOptions = (allBedrooms: MasterOption[] = []): MasterOption[] => {
  return sortNumericOptions(allBedrooms);
};

/**
 * Returns sorted bathroom options
 */
export const getBathroomOptions = (allBathrooms: MasterOption[] = []): MasterOption[] => {
  return sortNumericOptions(allBathrooms);
};

/**
 * Filters floor options based on total floors (e.g. if Total Floors is 5, only show Ground/Basement and floors up to 5)
 */
export const getFloorOptions = (
  allFloors: MasterOption[] = [],
  totalFloors: string = '',
  totalFloorsLabel: string = ''
): MasterOption[] => {
  const countStr = extractNumber(totalFloorsLabel) || extractNumber(totalFloors);
  if (!countStr) return sortNumericOptions(allFloors);

  const maxFloor = parseInt(countStr, 10);
  if (isNaN(maxFloor) || maxFloor <= 0) return sortNumericOptions(allFloors);

  const filtered = allFloors.filter((opt) => {
    const text = String(opt.label || opt.value || '').trim();
    const lower = text.toLowerCase();

    // Always keep Ground / Basement / Lower / Upper / Podium / Stilt
    if (
      lower.includes('ground') ||
      lower.includes('basement') ||
      lower.includes('lower') ||
      lower.includes('upper') ||
      lower.includes('podium') ||
      lower.includes('stilt') ||
      lower === 'g' ||
      lower === '0' ||
      lower === 'ug' ||
      lower === 'lg'
    ) {
      return true;
    }

    const floorNum = extractNumber(text);
    if (floorNum) {
      const n = parseInt(floorNum, 10);
      if (!isNaN(n)) {
        return n <= maxFloor;
      }
    }

    return true;
  });

  return sortNumericOptions(filtered);
};

/**
 * Helper to calculate cascading field updates (Property Type -> Subtype -> Unit Type -> Bedrooms -> Bathrooms)
 */
export const calculateCascadingUpdates = (
  field: string,
  value: string,
  masterOptions: Record<string, MasterOption[]> = {}
): Record<string, string> => {
  const updates: Record<string, string> = { [field]: value };

  const getOptionsList = (key: string): MasterOption[] => {
    const k = key.toLowerCase().trim();
    if (masterOptions[key]) return masterOptions[key];
    if (masterOptions[k]) return masterOptions[k];
    for (const mk in masterOptions) {
      if (mk.toLowerCase().trim() === k) return masterOptions[mk];
    }
    for (const mk in masterOptions) {
      if (mk.toLowerCase().includes(k)) return masterOptions[mk];
    }
    return [];
  };

  // 1. Changing Property Type resets child fields
  if (field === 'propertyType' || field === 'property_type') {
    updates.propertySubtype = '';
    updates.property_subtype = '';
    updates.unitType = '';
    updates.unit_type = '';
    updates.bedrooms = '';
    updates.bathrooms = '';
  }

  // 2. Changing Property Subtype to commercial/plot resets bedrooms and bathrooms
  if (field === 'propertySubtype' || field === 'property_subtype') {
    const subOpts = getOptionsList('property subtype');
    const matched = subOpts.find((o) => String(o.value) === String(value) || String(o.label) === String(value));
    const subLower = String(matched?.label || value).toLowerCase();

    if (
      subLower.includes('commercial') ||
      subLower.includes('office') ||
      subLower.includes('shop') ||
      subLower.includes('warehouse') ||
      subLower.includes('industrial') ||
      subLower.includes('godown') ||
      subLower.includes('plot') ||
      subLower.includes('land') ||
      subLower.includes('agri')
    ) {
      updates.bedrooms = '';
      updates.bathrooms = '';
    }
  }

  // 3. Changing Unit Type auto-sets Property Type, Subtype, Bedrooms & Bathrooms
  if (field === 'unitType' || field === 'unit_type') {
    const unitOpts = getOptionsList('unit type');
    const matched = unitOpts.find((o) => String(o.value) === String(value) || String(o.label) === String(value));
    const unitLabel = matched?.label || value;
    const unitLower = String(unitLabel).toLowerCase();
    const count = extractNumber(unitLabel) || extractNumber(value);

    const typeOpts = getOptionsList('property type');
    const subtypeOpts = getOptionsList('property subtype');

    // 1) Residential (BHK, RK, Studio, Penthouse, Duplex, Villa, etc.)
    if (
      unitLower.includes('bhk') ||
      unitLower.includes('rk') ||
      unitLower.includes('studio') ||
      unitLower.includes('bed') ||
      unitLower.includes('room') ||
      unitLower.includes('penthouse') ||
      unitLower.includes('duplex') ||
      unitLower.includes('villa') ||
      count
    ) {
      const resType = typeOpts.find((t) => {
        const l = (t.label || t.value || '').toLowerCase();
        return l.includes('residen') || l.includes('flat') || l.includes('apart') || l.includes('home') || l.includes('house');
      });
      if (resType) {
        updates.propertyType = String(resType.value);
        updates.property_type = String(resType.value);
      }

      const resSubtype = subtypeOpts.find((s) => {
        const l = (s.label || s.value || '').toLowerCase();
        if (unitLower.includes('penthouse') && l.includes('penthouse')) return true;
        if (unitLower.includes('duplex') && l.includes('duplex')) return true;
        if (unitLower.includes('villa') && l.includes('villa')) return true;
        if (unitLower.includes('studio') && (l.includes('studio') || l.includes('1 rk') || l.includes('apartment') || l.includes('flat'))) return true;
        return l.includes('flat') || l.includes('apart') || l.includes('residen');
      });
      if (resSubtype) {
        updates.propertySubtype = String(resSubtype.value);
        updates.property_subtype = String(resSubtype.value);
      }
    }
    // 2) Commercial (Office, Shop, Showroom, Desk, Cabin, Bare Shell, Godown, Retail, etc.)
    else if (
      unitLower.includes('office') ||
      unitLower.includes('shop') ||
      unitLower.includes('showroom') ||
      unitLower.includes('desk') ||
      unitLower.includes('cabin') ||
      unitLower.includes('shell') ||
      unitLower.includes('godown') ||
      unitLower.includes('commercial') ||
      unitLower.includes('retail') ||
      unitLower.includes('hall') ||
      unitLower.includes('floor')
    ) {
      const commType = typeOpts.find((t) => {
        const l = (t.label || t.value || '').toLowerCase();
        return l.includes('comm') || l.includes('business') || l.includes('office') || l.includes('retail');
      });
      if (commType) {
        updates.propertyType = String(commType.value);
        updates.property_type = String(commType.value);
      }

      const commSubtype = subtypeOpts.find((s) => {
        const l = (s.label || s.value || '').toLowerCase();
        if (unitLower.includes('office') && l.includes('office')) return true;
        if (unitLower.includes('shop') && l.includes('shop')) return true;
        if (unitLower.includes('showroom') && l.includes('showroom')) return true;
        if (unitLower.includes('warehouse') || unitLower.includes('godown')) return l.includes('warehouse') || l.includes('godown') || l.includes('industrial');
        return l.includes('comm') || l.includes('office') || l.includes('shop');
      });
      if (commSubtype) {
        updates.propertySubtype = String(commSubtype.value);
        updates.property_subtype = String(commSubtype.value);
      }

      updates.bedrooms = '';
      updates.bathrooms = '';
    }
    // 3) Plot / Land (Plot, Land, Acre, Guntha, Gaj, Farm, etc.)
    else if (
      unitLower.includes('plot') ||
      unitLower.includes('land') ||
      unitLower.includes('acre') ||
      unitLower.includes('guntha') ||
      unitLower.includes('gaj') ||
      unitLower.includes('bigha') ||
      unitLower.includes('farm') ||
      unitLower.includes('yard')
    ) {
      const plotType = typeOpts.find((t) => {
        const l = (t.label || t.value || '').toLowerCase();
        return l.includes('plot') || l.includes('land') || l.includes('agri') || l.includes('farm');
      });
      if (plotType) {
        updates.propertyType = String(plotType.value);
        updates.property_type = String(plotType.value);
      }

      const plotSubtype = subtypeOpts.find((s) => {
        const l = (s.label || s.value || '').toLowerCase();
        if (unitLower.includes('farm') && l.includes('farm')) return true;
        if (unitLower.includes('agri') && l.includes('agri')) return true;
        return l.includes('plot') || l.includes('land');
      });
      if (plotSubtype) {
        updates.propertySubtype = String(plotSubtype.value);
        updates.property_subtype = String(plotSubtype.value);
      }

      updates.bedrooms = '';
      updates.bathrooms = '';
    }

    if (count) {
      const bedOpts = getOptionsList('bedrooms');
      const bathOpts = getOptionsList('bathrooms');
      const matchedBed = findMatchingOptionValue(bedOpts, count);
      const matchedBath = findMatchingOptionValue(bathOpts, count);

      if (matchedBed) {
        updates.bedrooms = matchedBed;
      }
      if (matchedBath) {
        updates.bathrooms = matchedBath;
      }
    }
  }

  // 4. Changing Bedrooms auto-suggests matching Bathrooms
  if (field === 'bedrooms') {
    const bedOpts = getOptionsList('bedrooms');
    const matched = bedOpts.find((o) => String(o.value) === String(value) || String(o.label) === String(value));
    const bedLabel = matched?.label || value;
    const count = extractNumber(bedLabel) || extractNumber(value);
    if (count) {
      const bathOpts = getOptionsList('bathrooms');
      const matchedBath = findMatchingOptionValue(bathOpts, count);
      if (matchedBath) {
        updates.bathrooms = matchedBath;
      }
    }
  }

  return updates;
};
