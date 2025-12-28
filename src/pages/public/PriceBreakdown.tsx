// import React from "react";

// type PriceBreakdownProps = {
//     price: number;
// };

// const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ price }) => {
//     const STAMP_DUTY_RATE = 0.07;     // 7%
//     const REGISTRATION_RATE = 0.01;  // 1%

//     const stampDuty = price * STAMP_DUTY_RATE;
//     const registration = price * REGISTRATION_RATE;
//     const maintenance = 0;

//     const totalCost =
//         price +
//         stampDuty +
//         registration +
//         maintenance;

//     const formatCurrency = (amount: number) =>
//         amount.toLocaleString("en-IN", {
//             style: "currency",
//             currency: "INR",
//             maximumFractionDigits: 0,
//         });

//     return (
//         <div className="bg-white rounded-xl shadow-sm p-4 ring-1 ring-gray-100">
//             <h3 className="font-bold text-gray-900 mb-3">Price Breakdown</h3>

//             <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                     <span>Base Price</span>
//                     <span>{formatCurrency(price)}</span>
//                 </div>

//                 <div className="flex justify-between">
//                     <span>Stamp Duty (7%)</span>
//                     <span>{formatCurrency(stampDuty)}</span>
//                 </div>

//                 <div className="flex justify-between">
//                     <span>Registration (1%)</span>
//                     <span>{formatCurrency(registration)}</span>
//                 </div>

//                 <div className="flex justify-between">
//                     <span>Maintenance</span>
//                     <span>₹0</span>
//                 </div>

//                 <div className="border-t pt-3 flex justify-between font-semibold text-blue-600">
//                     <span>Total Cost</span>
//                     <span>{formatCurrency(totalCost)}</span>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PriceBreakdown;

import React from "react";

type PriceBreakdownProps = {
    price: number;
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ price }) => {
    const STAMP_DUTY_RATE = 0.07; // 7%
    const REGISTRATION_RATE = 0.01; // 1%
    const REGISTRATION_CAP = 30000; // ₹30K max

    const stampDuty = price * STAMP_DUTY_RATE;

    // ✅ Registration slab logic
    const registration = Math.min(
        price * REGISTRATION_RATE,
        REGISTRATION_CAP
    );

    const maintenance = 0;

    const totalCost =
        price +
        stampDuty +
        registration +
        maintenance;

    const formatCurrency = (amount: number) =>
        amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 ring-1 ring-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Price Breakdown</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Base Price</span>
                    <span>{formatCurrency(price)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Stamp Duty (7%)</span>
                    <span>{formatCurrency(stampDuty)}</span>
                </div>

                <div className="flex justify-between">
                    <span>
                        Registration (1% • Max ₹30,000)
                    </span>
                    <span>{formatCurrency(registration)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Maintenance</span>
                    <span>₹0</span>
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold text-blue-600">
                    <span>Total Cost</span>
                    <span>{formatCurrency(totalCost)}</span>
                </div>
            </div>
        </div>
    );
};

export default PriceBreakdown;
