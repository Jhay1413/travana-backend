import { or } from 'drizzle-orm';

export const nestedBuilder = (conditions: any[]) => {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  let result = or(conditions[0], conditions[1]);

  for (let i = 2; i < conditions.length; i++) {
    result = or(result, conditions[i]); // Wrap in OR pair by pair
  }

  return result;
};
