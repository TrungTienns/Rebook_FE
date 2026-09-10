export const isNewProduct = (createdAtString, days = 7) => {
  if (!createdAtString) return false;
  const createdAt = new Date(createdAtString);
  if (isNaN(createdAt.getTime())) return false; // Invalid date
  
  const now = new Date();
  const differenceInTime = now.getTime() - createdAt.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  
  // Return true if created within the last 'days' (and not in the future, just in case)
  return differenceInDays >= 0 && differenceInDays <= days;
};
