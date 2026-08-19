import React from "react";
import OwnerViewPage from "./OwnerViewPage";

interface OwnerAccountPageProps {
  owner: any;
  onBack: () => void;
  onUpdateOwner?: (updated: any) => Promise<void>;
}

export const OwnerAccountPage: React.FC<OwnerAccountPageProps> = ({
  owner,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <OwnerViewPage ownerId={owner.id} onBack={onBack} />
    </div>
  );
};

export default OwnerAccountPage;
