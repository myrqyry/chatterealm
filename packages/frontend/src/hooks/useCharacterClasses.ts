import { CHARACTER_CLASSES, ResourceType } from "shared";

export const useCharacterClasses = () => {
  return {
    characterClasses: CHARACTER_CLASSES,
    getClassById: (id: string) => CHARACTER_CLASSES.find(c => c.id === id),
    getClassesByResource: (resource: ResourceType) =>
      CHARACTER_CLASSES.filter(c => c.primaryResource === resource)
  };
};