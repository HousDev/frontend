import React, { useState, useEffect, useMemo } from "react";

function PossessionDropdown() {
    const now = new Date();
    const CURRENT_YEAR = now.getFullYear();
    const CURRENT_MONTH = now.getMonth() + 1; // 1-12

    const monthNames = useMemo(
        () => [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        []
    );

    const [year, setYear] = useState(CURRENT_YEAR);
    const [month, setMonth] = useState(CURRENT_MONTH);

    // Enforce rule: in current year, month cannot be in the future
    useEffect(() => {
        if (year === CURRENT_YEAR && month > CURRENT_MONTH) {
            setMonth(CURRENT_MONTH);
        }
    }, [year, month, CURRENT_MONTH, CURRENT_YEAR]);

    // Combined value for backend
    const combined = `${year}-${String(month).padStart(2, "0")}`;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("Submitted: " + combined);
            }}
            style={{ maxWidth: "520px" }}
        >
            <h2 className="text-xs font-medium text-gray-700 mb-1">Purchase Month & Year</h2>
        
            <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>

                    <select
                        id="possessionYear"
                        name="possessionYear"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                   
                    <select
                        id="possessionMonth"
                        name="possessionMonth"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {monthNames.map((name, idx) => {
                            const m = idx + 1;
                            const disabled = year === CURRENT_YEAR && m > CURRENT_MONTH;
                            return (
                                <option key={m} value={m} disabled={disabled}>{name}</option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* Hidden combined field for backend */}
            <input type="hidden" name="possession_period" value={combined} />

            {/* <div style={{ marginTop: "12px", padding: "8px 12px", background: "#eef2ff", borderRadius: "999px", display: "inline-block" }}>
                Selected: <strong>{monthNames[month - 1]} {year}</strong> 
            </div> */}

        </form>
    );
}

export default PossessionDropdown;
