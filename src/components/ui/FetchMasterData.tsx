import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Upload, Plus } from 'lucide-react';

import { masterDataAPI } from '@/lib/mastersAPI';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Trash2 } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import BudgetInput from '@/pages/dashboard/components/BudgetInput';

interface Property {
    seller: string;
    propertyType: string;
    propertySubtype: string;
    unitType: string;
    wing: string;
    unitNo: string;
    furnishing: string;
    parkingType: string;
    parkingQty: string;
    city: string;
    location: string;
    society: string;
    floor: string;
    totalFloors: string;
    carpetArea: string;
    builtupArea: string;
    budget: string;
    address: string;
    status: string;
    leadSource: string;
    possessionMonth: string;
    possessionYear: string;
    sellingRights: string;
    ownershipDoc: File | null;
    photos: File[];
    purchaseMonth: string;
    purchaseYear: string;
    amenities: string[];
    furnishingItems: string[];
    description: string;
    nearbyPlaces: Array<{
        name: string;
        distance: string;
        unit: string;
        type: string;
    }>;
}

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (property: Property) => void;
}

const PossessionDropdown: React.FC<{
    possessionMonth: string;
    possessionYear: string;
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
    title: string;
}> = ({ possessionMonth, possessionYear, onMonthChange, onYearChange, title }) => {
    const now = new Date();
    const CURRENT_YEAR = now.getFullYear();
    const CURRENT_MONTH = now.getMonth() + 1;

    const monthNames = useMemo(
        () => [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        []
    );

    const currentYear = parseInt(possessionYear) || CURRENT_YEAR;
    const currentMonth = parseInt(possessionMonth) || CURRENT_MONTH;

    useEffect(() => {
        if (currentYear === CURRENT_YEAR && currentMonth > CURRENT_MONTH) {
            onMonthChange(CURRENT_MONTH.toString());
        }
    }, [currentYear, currentMonth, CURRENT_MONTH, CURRENT_YEAR, onMonthChange]);

    const yearOptions = Array.from({ length: 40 }, (_, i) => ({
        value: (CURRENT_YEAR - i).toString(),
        label: (CURRENT_YEAR - i).toString()
    }));

    const monthOptions = monthNames.map((name, idx) => {
        const m = idx + 1;
        const disabled = currentYear === CURRENT_YEAR && m > CURRENT_MONTH;
        return {
            value: m.toString(),
            label: name,
            disabled
        };
    });

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {title}
            </label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Dropdown
                        placeholder="Year"
                        options={yearOptions}
                        value={possessionYear}
                        onChange={onYearChange}
                        className="w-full"
                    />
                </div>
                <div className="flex-1">
                    <Dropdown
                        placeholder="Month"
                        options={monthOptions.filter(opt => !opt.disabled)}
                        value={possessionMonth}
                        onChange={onMonthChange}
                        className="w-full"
                    />
                </div>
            </div>
            {possessionMonth && possessionYear && (
                <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Selected: {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
                </div>
            )}
        </div>
    );
};

const MultiSelectDropdown: React.FC<{
    options: { value: string; label: string }[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    label: string;
    placeholder?: string;
}> = ({ options, selectedValues, onToggle, label, placeholder = "Select options..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [masterLoading, setMasterLoading] = useState(true);
    const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});


    useEffect(() => {
        const fetchMasters = async () => {
          try {
            setMasterLoading(true);
            const data = await getMasterDropdownOptions([
              'common','lead','property'
            ]);
            setMasters(data);
            console.log("Fetched master data:", data);
          } catch (err) {
            console.error('Error fetching master options:', err);
            // toast.error('Failed to load dropdown options');
          } finally {
            setMasterLoading(false);
          }
        };

        fetchMasters();
      }, []);
    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const displayText = useMemo(() => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            const option = options.find(opt => opt.value === selectedValues[0]);
            return option?.label || selectedValues[0];
        }
        return `${selectedValues.length} items selected`;
    }, [selectedValues, options, placeholder]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
            </label>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-300 p-2 rounded text-left bg-white flex justify-between items-center text-xs min-h-[38px]"
            >
                <span className={selectedValues.length === 0 ? "text-gray-500" : "text-gray-900"}>
                    {displayText}
                </span>
                <span className="text-gray-500">▼</span>
            </button>

            {isOpen && buttonRef.current && (
                <div
                    ref={dropdownRef}
                    className="bg-white border rounded shadow-lg max-h-64 overflow-hidden"
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        top: buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                        left: buttonRef.current.getBoundingClientRect().left + window.scrollX,
                        width: buttonRef.current.getBoundingClientRect().width
                    }}
                >
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <p className="text-xs text-gray-500 p-2">No options found</p>
                        ) : (
                            filteredOptions.map(option => (
                                <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={() => onToggle(option.value)}
                                        className="mr-2 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-700">{option.label}</span>
                                </label>
                            ))
                        )}
                    </div>

                    {selectedValues.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t text-xs text-blue-600">
                            Selected: {selectedValues.length} item(s)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const now = new Date();
    const CURRENT_YEAR = now.getFullYear();
    const CURRENT_MONTH = now.getMonth() + 1;

    const [formData, setFormData] = useState<Property>({
        seller: '',
        propertyType: '',
        propertySubtype: '',
        unitType: '',
        wing: '',
        unitNo: '',
        furnishing: '',
        parkingType: '',
        parkingQty: '',
        city: '',
        location: '',
        society: '',
        floor: '',
        totalFloors: '',
        carpetArea: '',
        builtupArea: '',
        budget: '',
        address: '',
        status: '',
        leadSource: '',
        possessionMonth: CURRENT_MONTH.toString(),
        possessionYear: CURRENT_YEAR.toString(),
        sellingRights: 'Standard',
        ownershipDoc: null,
        photos: [],
        purchaseMonth: CURRENT_MONTH.toString(),
        purchaseYear: CURRENT_YEAR.toString(),
        amenities: [],
        furnishingItems: [],
        description: '',
        nearbyPlaces: []
    });

    // Nearby places form state
    const [nearbyPlaceForm, setNearbyPlaceForm] = useState({
        name: '',
        distance: '',
        unit: '',
        type: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [masterOptions, setMasterOptions] = useState({
        propertyType: [] as { value: string; label: string }[],
        propertySubtype: [] as { value: string; label: string }[],
        unitType: [] as { value: string; label: string }[],
        furnishing: [] as { value: string; label: string }[],
        parkingType: [] as { value: string; label: string }[],
        parkingQty: [] as { value: string; label: string }[],
        city: [] as { value: string; label: string }[],
        location: [] as { value: string; label: string }[],
        society: [] as { value: string; label: string }[],
        floor: [] as { value: string; label: string }[],
        totalFloors: [] as { value: string; label: string }[],
        status: [] as { value: string; label: string }[],
        leadSource: [] as { value: string; label: string }[],
        sellingRights: [] as { value: string; label: string }[],
        sellers: [] as { value: string; label: string }[],
        amenities: [] as { value: string; label: string }[],
        furnishingItems: [] as { value: string; label: string }[],
        placeName: [] as { value: string; label: string }[],
        placeType: [] as { value: string; label: string }[]
    });

    // Function to get label from value for dropdowns
    const getLabelFromValue = (options: { value: string; label: string }[], value: string) => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : '';
    };

    // Function to auto-fill address
    const generateAddress = () => {
        const addressParts = [];

        if (formData.wing.trim()) {
            addressParts.push(`Wing ${formData.wing.trim()}`);
        }

        if (formData.unitNo.trim()) {
            addressParts.push(`Unit No ${formData.unitNo.trim()}`);
        }

        if (formData.society) {
            const societyLabel = getLabelFromValue(masterOptions.society, formData.society);
            if (societyLabel) {
                addressParts.push(societyLabel);
            }
        }

        if (formData.floor) {
            const floorLabel = getLabelFromValue(masterOptions.floor, formData.floor);
            if (floorLabel) {
                // Remove "Floor" if it already exists in the label to avoid duplication
                const cleanFloorLabel = floorLabel.toLowerCase().includes('floor')
                    ? floorLabel
                    : `${floorLabel} Floor`;
                addressParts.push(cleanFloorLabel);
            }
        }

        if (formData.location) {
            const locationLabel = getLabelFromValue(masterOptions.location, formData.location);
            if (locationLabel) {
                addressParts.push(locationLabel);
            }
        }

        if (formData.city) {
            const cityLabel = getLabelFromValue(masterOptions.city, formData.city);
            if (cityLabel) {
                addressParts.push(cityLabel);
            }
        }

        return addressParts.join(', ');
    };

    // Effect to auto-fill address when relevant fields change
    useEffect(() => {
        if (masterOptions.society.length > 0 || masterOptions.location.length > 0 || masterOptions.city.length > 0 || masterOptions.floor.length > 0) {
            const autoAddress = generateAddress();
            if (autoAddress) {
                setFormData(prev => ({
                    ...prev,
                    address: autoAddress
                }));
            }
        }
    }, [
        formData.wing,
        formData.unitNo,
        formData.society,
        formData.floor,
        formData.location,
        formData.city,
        masterOptions.society,
        masterOptions.location,
        masterOptions.city,
        masterOptions.floor
    ]);

    const fetchMasterData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [leadMasterTypes, commonMasterTypes, propertyMasterTypes] = await Promise.all([
                masterDataAPI.getAllMasterTypes('lead'),
                masterDataAPI.getAllMasterTypes('common'),
                masterDataAPI.getAllMasterTypes('property')
            ]);

            const allMasterTypes = [
                ...leadMasterTypes.map(type => ({ ...type, source: 'lead' })),
                ...commonMasterTypes.map(type => ({ ...type, source: 'common' })),
                ...propertyMasterTypes.map(type => ({ ...type, source: 'property' }))
            ];

            const masterValues = await Promise.all(
                allMasterTypes.map(masterType =>
                    masterDataAPI.getMasterValues(masterType.id)
                )
            );

            const organizedData: {
                lead: Record<string, { value: string; label: string }[]>;
                common: Record<string, { value: string; label: string }[]>;
                property: Record<string, { value: string; label: string }[]>;
            } = {
                lead: {},
                common: {},
                property: {}
            };

            allMasterTypes.forEach((masterType, index) => {
                const values = masterValues[index] || [];
                const data = values.map(item => ({
                    value: item.id,
                    label: item.value || item.name || 'Unknown'
                }));

                if (organizedData[masterType.source as keyof typeof organizedData]) {
                    organizedData[masterType.source as keyof typeof organizedData][masterType.name.toLowerCase()] = data;
                }
            });

            setMasterOptions(prev => ({
                ...prev,
                propertyType: organizedData.property['property type'] || [],
                propertySubtype: organizedData.property['property subtype'] || [],
                unitType: organizedData.property['unit type'] || [],
                furnishing: organizedData.property.furnishing || [],
                parkingType: organizedData.property['parking type'] || [],
                parkingQty: organizedData.property['parking qty'] || [],
                society: organizedData.property.society || [],
                floor: organizedData.property.floor || [],
                totalFloors: organizedData.property['total floors'] || [],
                status: organizedData.property['property status'] || [],
                sellingRights: organizedData.property['selling rights'] || [],
                city: organizedData.common.city || [],
                location: organizedData.common.location || [],
                leadSource: organizedData.lead['lead source'] || [],
                sellers: organizedData.property.sellers || [],
                amenities: organizedData.property.amenities || [],
                furnishingItems: organizedData.property['furnishing items'] || [],
                placeName: organizedData.property['place name'] || [],
                placeType: organizedData.property['place type'] || []
            }));

        } catch (err) {
            console.error('Failed to load master data:', err);
            setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMasterData();
        } else {
            setFormData({
                seller: '',
                propertyType: '',
                propertySubtype: '',
                unitType: '',
                wing: '',
                unitNo: '',
                furnishing: '',
                parkingType: '',
                parkingQty: '',
                city: '',
                location: '',
                society: '',
                floor: '',
                totalFloors: '',
                carpetArea: '',
                builtupArea: '',
                budget: '',
                address: '',
                status: '',
                leadSource: '',
                possessionMonth: CURRENT_MONTH.toString(),
                possessionYear: CURRENT_YEAR.toString(),
                sellingRights: 'Standard',
                ownershipDoc: null,
                photos: [],
                purchaseMonth: CURRENT_MONTH.toString(),
                purchaseYear: CURRENT_YEAR.toString(),
                amenities: [],
                furnishingItems: [],
                description: '',
                nearbyPlaces: []
            });
            setNearbyPlaceForm({
                name: '',
                distance: '',
                unit: '',
                type: ''
            });
            setError(null);
            setErrors({});
        }
    }, [isOpen, CURRENT_MONTH, CURRENT_YEAR]);

    const handleDropdownChange = (field: keyof Property) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Handler for amenities toggle
    const handleAmenitiesToggle = (value: string) => {
        const updated = formData.amenities.includes(value)
            ? formData.amenities.filter(item => item !== value)
            : [...formData.amenities, value];

        setFormData(prev => ({
            ...prev,
            amenities: updated
        }));
    };

    // Handler for furnishing items toggle
    const handleFurnishingItemsToggle = (value: string) => {
        const updated = formData.furnishingItems.includes(value)
            ? formData.furnishingItems.filter(item => item !== value)
            : [...formData.furnishingItems, value];

        setFormData(prev => ({
            ...prev,
            furnishingItems: updated
        }));
    };

    // Handler to remove amenity chip
    const removeAmenity = (value: string) => {
        const updated = formData.amenities.filter(item => item !== value);
        setFormData(prev => ({
            ...prev,
            amenities: updated
        }));
    };

    // Handler to remove furnishing item chip
    const removeFurnishingItem = (value: string) => {
        const updated = formData.furnishingItems.filter(item => item !== value);
        setFormData(prev => ({
            ...prev,
            furnishingItems: updated
        }));
    };

    const handleInputChange = (field: keyof Property, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleFileUpload = (field: keyof Property, files: File | File[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: files
        }));
    };

    const handlePossessionMonthChange = (month: string) => {
        setFormData(prev => ({
            ...prev,
            possessionMonth: month
        }));
    };

    const handlePossessionYearChange = (year: string) => {
        setFormData(prev => ({
            ...prev,
            possessionYear: year
        }));
    };

    const handlePurchaseMonthChange = (month: string) => {
        setFormData(prev => ({
            ...prev,
            purchaseMonth: month
        }));
    };

    const handlePurchaseYearChange = (year: string) => {
        setFormData(prev => ({
            ...prev,
            purchaseYear: year
        }));
    };

    // Nearby places handlers
    const handleNearbyPlaceInputChange = (field: string, value: string) => {
        setNearbyPlaceForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addNearbyPlace = () => {
        if (nearbyPlaceForm.name && nearbyPlaceForm.distance && nearbyPlaceForm.unit && nearbyPlaceForm.type) {
            const placeName = getLabelFromValue(masterOptions.placeName, nearbyPlaceForm.name) || nearbyPlaceForm.name;
            const placeType = getLabelFromValue(masterOptions.placeType, nearbyPlaceForm.type) || nearbyPlaceForm.type;

            const newPlace = {
                name: placeName,
                distance: nearbyPlaceForm.distance,
                unit: nearbyPlaceForm.unit,
                type: placeType
            };

            setFormData(prev => ({
                ...prev,
                nearbyPlaces: [...prev.nearbyPlaces, newPlace]
            }));

            // Reset form
            setNearbyPlaceForm({
                name: '',
                distance: '',
                unit: '',
                type: ''
            });
        }
    };

    const removeNearbyPlace = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nearbyPlaces: prev.nearbyPlaces.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.propertySubtype) newErrors.propertySubtype = 'Property subtype is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.society) newErrors.society = 'Society is required';
        if (!formData.carpetArea) newErrors.carpetArea = 'Carpet area is required';
        if (!formData.budget) newErrors.budget = 'Budget is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Property" width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl">
            <div className="space-y-4 relative" style={{ minHeight: '320px' }}>
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading options...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                        <p>{error}</p>
                        <button
                            onClick={fetchMasterData}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Retry Loading Data
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Seller (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Seller"
                            value={formData.seller || ""}
                            onChange={(e) => handleInputChange('seller', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Property Type*
                        </label>
                        <Dropdown
                            placeholder="Select Property Type"
                            options={masterOptions.propertyType}
                            value={formData.propertyType}
                            onChange={handleDropdownChange('propertyType')}
                            className="w-full"
                        />
                        {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Property Subtype*
                        </label>
                        <Dropdown
                            placeholder="Select Property Subtype"
                            options={masterOptions.propertySubtype}
                            value={formData.propertySubtype}
                            onChange={handleDropdownChange('propertySubtype')}
                            className="w-full"
                        />
                        {errors.propertySubtype && <p className="text-red-500 text-xs mt-1">{errors.propertySubtype}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit Type
                        </label>
                        <Dropdown
                            placeholder="Select Unit Type"
                            options={masterOptions.unitType}
                            value={formData.unitType}
                            onChange={handleDropdownChange('unitType')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Wing
                        </label>
                        <input
                            type="text"
                            placeholder="Wing name/number"
                            value={formData.wing}
                            onChange={(e) => handleInputChange('wing', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit No
                        </label>
                        <input
                            type="text"
                            placeholder="Unit/Flat no"
                            value={formData.unitNo}
                            onChange={(e) => handleInputChange('unitNo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Furnishing
                        </label>
                        <Dropdown
                            placeholder="Select Furnishing"
                            options={masterOptions.furnishing}
                            value={formData.furnishing}
                            onChange={handleDropdownChange('furnishing')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Parking Type
                        </label>
                        <Dropdown
                            placeholder="Select Parking Type"
                            options={masterOptions.parkingType}
                            value={formData.parkingType}
                            onChange={handleDropdownChange('parkingType')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Parking Qty
                        </label>
                        <Dropdown
                            placeholder="Select Parking Quantity"
                            options={masterOptions.parkingQty}
                            value={formData.parkingQty}
                            onChange={handleDropdownChange('parkingQty')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            City*
                        </label>
                        <Dropdown
                            placeholder="Select City"
                            options={masterOptions.city}
                            value={formData.city}
                            onChange={handleDropdownChange('city')}
                            className="w-full"
                            searchable={true}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Location*
                        </label>
                        <Dropdown
                            placeholder="Select Location"
                            options={masterOptions.location}
                            value={formData.location}
                            onChange={handleDropdownChange('location')}
                            className="w-full"
                            searchable={true}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Society*
                        </label>
                        <Dropdown
                            placeholder="Select Society"
                            options={masterOptions.society}
                            value={formData.society}
                            onChange={handleDropdownChange('society')}
                            className="w-full"
                            searchable={true}
                        />
                        {errors.society && <p className="text-red-500 text-xs mt-1">{errors.society}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Floor
                        </label>
                        <Dropdown
                            placeholder="Select Floor"
                            options={masterOptions.floor}
                            value={formData.floor}
                            onChange={handleDropdownChange('floor')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Total Floors
                        </label>
                        <Dropdown
                            placeholder="Select Total Floors"
                            options={masterOptions.totalFloors}
                            value={formData.totalFloors}
                            onChange={handleDropdownChange('totalFloors')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Carpet Area (sq.ft)*
                        </label>
                        <input
                            type="number"
                            placeholder="Enter carpet area"
                            value={formData.carpetArea}
                            onChange={(e) => handleInputChange('carpetArea', e.target.value)}
                            className={`w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${errors.carpetArea ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.carpetArea && <p className="text-red-500 text-xs mt-1">{errors.carpetArea}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Builtup Area (sq.ft) (optional)
                        </label>
                        <input
                            type="number"
                            placeholder="Enter builtup area"
                            value={formData.builtupArea}
                            onChange={(e) => handleInputChange('builtupArea', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Property Status
                        </label>
                        <Dropdown
                            placeholder="Select Status"
                            options={masterOptions.status}
                            value={formData.status}
                            onChange={handleDropdownChange('status')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Lead Source
                        </label>
                        <Dropdown
                            placeholder="Select Lead Source"
                            options={masterOptions.leadSource}
                            value={formData.leadSource}
                            onChange={handleDropdownChange('leadSource')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <PossessionDropdown
                            title="Purchase Month & Year"
                            possessionMonth={formData.purchaseMonth}
                            possessionYear={formData.purchaseYear}
                            onMonthChange={handlePurchaseMonthChange}
                            onYearChange={handlePurchaseYearChange}
                        />
                    </div>

                    <div>
                        <PossessionDropdown
                            title="Possession Month & Year"
                            possessionMonth={formData.possessionMonth}
                            possessionYear={formData.possessionYear}
                            onMonthChange={handlePossessionMonthChange}
                            onYearChange={handlePossessionYearChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Selling Rights
                        </label>
                        <Dropdown
                            placeholder="Select Selling Rights"
                            options={masterOptions.sellingRights}
                            value={formData.sellingRights}
                            onChange={handleDropdownChange('sellingRights')}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <BudgetInput
                            value={formData.budget}
                            onChange={(val) => handleInputChange("budget", val)}
                            error={errors.budget}
                        />
                    </div>

                    {/* Amenities - Multi-Select with Chips */}
                    <div>
                        <MultiSelectDropdown
                            label="Amenities"
                            options={masterOptions.amenities}
                            selectedValues={formData.amenities}
                            onToggle={handleAmenitiesToggle}
                            placeholder="Select amenities..."
                        />

                        {/* Selected amenities chips */}
                        {formData.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.amenities.map((amenityValue) => {
                                    const option = masterOptions.amenities.find(opt => opt.value === amenityValue);
                                    return (
                                        <span
                                            key={amenityValue}
                                            className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]"
                                        >
                                            {option?.label || amenityValue}
                                            <button
                                                type="button"
                                                onClick={() => removeAmenity(amenityValue)}
                                                className="ml-1 text-purple-500 hover:text-purple-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Furnishing Items - Multi-Select with Chips */}
                    <div>
                        <MultiSelectDropdown
                            label="Furnishing Items"
                            options={masterOptions.furnishingItems}
                            selectedValues={formData.furnishingItems}
                            onToggle={handleFurnishingItemsToggle}
                            placeholder="Select furnishing items..."
                        />

                        {/* Selected furnishing items chips */}
                        {formData.furnishingItems.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.furnishingItems.map((itemValue) => {
                                    const option = masterOptions.furnishingItems.find(opt => opt.value === itemValue);
                                    return (
                                        <span
                                            key={itemValue}
                                            className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]"
                                        >
                                            {option?.label || itemValue}
                                            <button
                                                type="button"
                                                onClick={() => removeFurnishingItem(itemValue)}
                                                className="ml-1 text-purple-500 hover:text-purple-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Address (Auto-filled)
                        </label>
                        <textarea
                            placeholder="Address will be auto-filled based on Wing, Unit No, Society, Floor, Location, and City"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This field is automatically filled based on your selections above. You can modify it if needed.
                        </p>
                    </div>

                    {/* Nearby Places */}
                    <div className="md:col-span-2">
                        <h3 className="block text-xs font-medium text-gray-700 mb-1">Nearby Places</h3>

                        <div className="space-y-4">
                            {/* Inputs row */}
                            <div className="grid grid-cols-12 gap-3">
                                {/* Place Name */}
                                <div className="col-span-12 md:col-span-4">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Place Name</label>
                                    <Dropdown
                                        placeholder="Select Place"
                                        options={masterOptions.placeName}
                                        value={nearbyPlaceForm.name}
                                        onChange={(value) => handleNearbyPlaceInputChange('name', value)}
                                        className="w-full"
                                        searchable={true}
                                    />
                                </div>

                                {/* Distance */}
                                <div className="col-span-6 md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Distance</label>
                                    <input
                                        type="number"
                                        className="w-full h-9 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                        placeholder="Enter distance"
                                        value={nearbyPlaceForm.distance}
                                        onChange={(e) => handleNearbyPlaceInputChange('distance', e.target.value)}
                                    />
                                </div>

                                {/* Unit */}
                                <div className="col-span-6 md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        className="w-full h-9 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                        value={nearbyPlaceForm.unit}
                                        onChange={(e) => handleNearbyPlaceInputChange('unit', e.target.value)}
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="km">km</option>
                                        <option value="m">m</option>
                                        <option value="min">min</option>
                                    </select>
                                </div>

                                {/* Type + Add */}
                                <div className="col-span-12 md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Place Type</label>
                                    <div className="flex gap-2">
                                        <Dropdown
                                            placeholder="Select"
                                            options={masterOptions.placeType}
                                            value={nearbyPlaceForm.type}
                                            onChange={(value) => handleNearbyPlaceInputChange('type', value)}
                                            className="flex-1"
                                            searchable={true}
                                        />

                                        {/* Add button */}
                                        <button
                                            type="button"
                                            onClick={addNearbyPlace}
                                            className="h-9 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List of added nearby places */}
                            <div className="space-y-2">
                                {formData.nearbyPlaces.length === 0 ? (
                                    <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
                                        No nearby places added yet. Fill the form above and click + to add places.
                                    </div>
                                ) : (
                                    formData.nearbyPlaces.map((place, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="text-xs text-gray-700">
                                                <span className="font-medium text-blue-600">{place.name}</span>
                                                <span className="text-gray-500 ml-2">({place.distance} {place.unit})</span>
                                                <span className="text-green-600 ml-2 capitalize">{place.type}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNearbyPlace(index)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Upload Sections */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ownership Doc (PDF/JPG/PNG)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload('ownershipDoc', e.target.files?.[0] || null)}
                                className="hidden"
                                id="ownership-doc"
                            />
                            <label htmlFor="ownership-doc" className="cursor-pointer">
                                <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-600 mb-1">
                                    {formData.ownershipDoc ? formData.ownershipDoc.name : 'Choose file'}
                                </p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Photos (JPG/PNG, Multi)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => handleFileUpload('photos', Array.from(e.target.files || []))}
                                className="hidden"
                                id="property-photos"
                            />
                            <label htmlFor="property-photos" className="cursor-pointer">
                                <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-600 mb-1">
                                    {formData.photos.length > 0 ? `${formData.photos.length} files selected` : 'Choose files'}
                                </p>
                                <p className="text-xs text-gray-500">JPG, PNG up to 5MB each</p>
                            </label>
                        </div>
                        {formData.photos.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                Selected files: {formData.photos.map(file => file.name).join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description/Notes</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Additional property details, special features, etc."
                    />
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddPropertyModal;





// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';

// where use useState by search
// const [masterLoading, setMasterLoading] = useState(true);
// const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
// uske niche
// useEffect(() => {
//     const fetchMasters = async () => {
//         try {
//             setMasterLoading(true);
//             const data = await getMasterDropdownOptions([
//                 'common', 'lead', 'property'
//             ]);
//             setMasters(data);
//             console.log("Fetched master data:", data);
//         } catch (err) {
//             console.error('Error fetching master options:', err);
//             // toast.error('Failed to load dropdown options');
//         } finally {
//             setMasterLoading(false);
//         }
//     };

//     fetchMasters();
// }, []);




// import { propertiesAPI } from '../../lib/propertiesAPI'
//   useEffect(() => {
//     const fetchBuyers = async () => {
//       try {
//         const properties = await propertiesAPI.getProperties(); // calling the API
//         console.log("Properties in component sdfg:", properties);
//       } catch (err) {
//         console.error("Error fetching buyers:", err);
//       }
//     };

//     fetchBuyers();
//   }, []);


//  for console
// const [formData, setFormData] = useState<Property>({
//         seller: '',
//         propertyType: '',
//         propertySubtype: '',
//         unitType: '',
//         wing: '',
//         unitNo: '',
//         furnishing: '',
//         parkingType: '',
//         parkingQty: '',
//         city: '',
//         location: '',
//         society: '',
//         floor: '',
//         totalFloors: '',
//         carpetArea: '',
//         builtupArea: '',
//         budget: '',
//         address: '',
//         status: '',
//         leadSource: '',
//         possessionMonth: CURRENT_MONTH.toString(),
//         possessionYear: CURRENT_YEAR.toString(),
//         sellingRights: 'Standard',
//         ownershipDoc: null,
//         photos: [],
//         purchaseMonth: CURRENT_MONTH.toString(),
//         purchaseYear: CURRENT_YEAR.toString(),
//         amenities: [],
//         furnishingItems: [],
//         description: '',
//         nearbyPlaces: []
//     });
//     console.log("my pro:",formData)