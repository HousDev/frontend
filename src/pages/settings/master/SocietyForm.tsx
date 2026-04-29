// SocietyForm.tsx
import React, { useState, useEffect } from 'react';

interface SocietyFormData {
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
}

interface SocietyFormProps {
    initialData?: SocietyFormData | null;
    onSubmit: (data: SocietyFormData) => void;
    onClose: () => void;
    isEditing?: boolean;
}

const SocietyForm: React.FC<SocietyFormProps> = ({
    initialData,
    onSubmit,
    onClose,
    isEditing = false,
}) => {
    const [formData, setFormData] = useState<SocietyFormData>({
        societyName: '',
        locality: '',
        city: '',
        pincode: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with data for editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                societyName: initialData.societyName || '',
                locality: initialData.locality || '',
                city: initialData.city || '',
                pincode: initialData.pincode || '',
            });
        }
    }, [initialData]);

    const validateField = (name: keyof SocietyFormData, value: string): string => {
        switch (name) {
            case 'societyName':
                if (!value.trim()) return 'Society name is required';
                if (value.length < 2) return 'Society name must be at least 2 characters';
                if (value.length > 100) return 'Society name must be less than 100 characters';
                return '';
            case 'locality':
                if (!value.trim()) return 'Locality is required';
                if (value.length < 2) return 'Locality must be at least 2 characters';
                if (value.length > 100) return 'Locality must be less than 100 characters';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                if (value.length < 2) return 'City must be at least 2 characters';
                if (value.length > 50) return 'City must be less than 50 characters';
                return '';
            case 'pincode':
                if (!value.trim()) return 'Pincode is required';
                const pincodeRegex = /^[1-9][0-9]{5}$/;
                if (!pincodeRegex.test(value)) return 'Enter a valid 6-digit pincode';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof SocietyFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof SocietyFormData, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
        let isValid = true;

        (Object.keys(formData) as Array<keyof SocietyFormData>).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Common input className with error styling
    const getInputClassName = (fieldName: keyof SocietyFormData) => {
        const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
        return errors[fieldName]
            ? `${baseClass} border-red-500 bg-red-50`
            : `${baseClass} border-gray-300 focus:border-blue-500`;
    };

    return (
        <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {isEditing ? 'Edit Society' : 'Add New Society'}
                </h2>

                <div className="space-y-4">
                    {/* Society Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Society Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="societyName"
                            value={formData.societyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter society name"
                            className={getInputClassName('societyName')}
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                        {errors.societyName && (
                            <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>
                        )}
                    </div>

                    {/* Locality Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Locality <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="locality"
                            value={formData.locality}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter locality (e.g., Andheri East, Sector 15)"
                            className={getInputClassName('locality')}
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                        {errors.locality && (
                            <p className="mt-1 text-xs text-red-500">{errors.locality}</p>
                        )}
                    </div>

                    {/* City Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter city name"
                            className={getInputClassName('city')}
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                        {errors.city && (
                            <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                        )}
                    </div>

                    {/* Pincode Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                            className={getInputClassName('pincode')}
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                        {errors.pincode && (
                            <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocietyForm;