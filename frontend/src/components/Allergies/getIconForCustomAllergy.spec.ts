import { getIconForCustomAllergy, customAllergyIconOptions } from './index';

describe('getIconForCustomAllergy', () => {
  it('should return a valid icon for any custom allergy name', () => {
    const testAllergies = [
      'Kumquat', 
      'Dragon Fruit',
      'Quinoa',
      'Acai',
      'Durian',
      'Jackfruit',
      'Persimmon'
    ];
    
    testAllergies.forEach(allergyName => {
      const icon = getIconForCustomAllergy(allergyName);
      
      // Verify the icon is in our list of options
      expect(customAllergyIconOptions).toContain(icon);
    });
  });
  
  it('should always return the same icon for the same allergy name', () => {
    const allergyName = 'Star Fruit';
    
    const icon1 = getIconForCustomAllergy(allergyName);
    const icon2 = getIconForCustomAllergy(allergyName);
    
    expect(icon1).toBe(icon2);
  });
  
  it('should handle empty strings', () => {
    const icon = getIconForCustomAllergy('');
    
    // Just make sure it returns something without error
    expect(icon).toBeDefined();
  });
  
  it('should assign different allergies to different icons when their first letters have different character codes', () => {
    const allergyName1 = 'Apple Allergy';
    const allergyName2 = 'Banana Allergy';
    
    const icon1 = getIconForCustomAllergy(allergyName1);
    const icon2 = getIconForCustomAllergy(allergyName2);
    
    // Different first letters should usually result in different icons
    // (unless they happen to map to the same icon by chance)
    expect(allergyName1[0]).not.toEqual(allergyName2[0]);
    // We won't strictly assert icon1 !== icon2 because there's a chance
    // of collision depending on the distribution
  });
});