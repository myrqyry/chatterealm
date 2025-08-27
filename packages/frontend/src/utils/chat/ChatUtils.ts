export const getCurrentTimestamp = (): number => {
  return Date.now();
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};