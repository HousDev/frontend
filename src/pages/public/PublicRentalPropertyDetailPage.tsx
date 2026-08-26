import React from 'react';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';

const PublicRentalPropertyDetailPage = ({ property, onBack }: any) => {
  return <PublicPropertyDetailPage property={property} onBack={onBack} isRentalProp={true} />;
};

export default PublicRentalPropertyDetailPage;