// src/pages/SellerFormModal.tsx
import Modal from "@/components/ui/Modal";
import React from "react";

interface SellerFormModalProps {
    lead: any;
    onClose: () => void;
}

const SellerFormModal: React.FC<SellerFormModalProps> = ({ lead, onClose }) => {
    console.log("🔴 SellerFormModal Lead Data:", lead);

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="p-4">
                <h1 className="text-xl font-bold">Seller Form</h1>
                <p>Welcome to the Seller dashboard!</p>

                <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Name:</strong> {lead?.name}</p>
                    <p><strong>Phone:</strong> {lead?.phone}</p>
                    <p><strong>Email:</strong> {lead?.email}</p>
                </div>
            </div>
        </Modal>
    );
};

export default SellerFormModal;
