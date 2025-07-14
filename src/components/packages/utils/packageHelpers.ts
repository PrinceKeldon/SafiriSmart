export const getBudgetTierColor = (tier: string) => {
  switch (tier) {
    case 'budget':
      return 'bg-green-100 text-green-800';
    case 'mid-range':
      return 'bg-blue-100 text-blue-800';
    case 'luxury':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};