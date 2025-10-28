/**
 * Property filter configuration
 * Defines which properties can be filtered and how
 */

export const FILTER_CONFIG = {
  // Properties available for filtering
  filterableProperties: [
    {
      propertyName: 'state',
      displayName: 'State',
      enabled: true,
      // Predefined values create a multi-select dropdown (OR logic within property)
      values: [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
    },
    {
      propertyName: 'formCode',
      displayName: 'Form Code',
      enabled: true,
      values: ['HO3', 'HO4', 'HO6', 'HF9']
    },
    // Example of text input filter (contains logic)
    // Uncomment to enable:
    // {
    //   propertyName: 'county',
    //   displayName: 'County',
    //   enabled: true,
    //   // No values array = text input with "contains" logic
    // }
  ]
};
