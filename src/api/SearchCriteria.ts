import { ID } from './ID';
import { FileDTO } from './File';

// Trick for converting array to type https://stackoverflow.com/a/49529930/2350481

export const NumberOperators = [
  'equals',
  'notEqual',
  'smallerThan',
  'smallerThanOrEquals',
  'greaterThan',
  'greaterThanOrEquals',
] as const;
export type NumberOperatorType = typeof NumberOperators[number];

export const NumberOperatorSymbols: Record<NumberOperatorType, string> = {
  equals: '=',
  notEqual: '≠',
  smallerThan: '<',
  smallerThanOrEquals: '≤',
  greaterThan: '>',
  greaterThanOrEquals: '≥',
};

export const StringOperators = [
  'equalsIgnoreCase',
  'equals',
  'notEqual',
  'startsWithIgnoreCase',
  'startsWith',
  'notStartsWith',
  'contains',
  'notContains',
] as const;
export type StringOperatorType = typeof StringOperators[number];

export const StringOperatorLabels: Record<StringOperatorType, string> = {
  equalsIgnoreCase: 'Equals',
  equals: 'Equals',
  notEqual: 'Not Equal',
  startsWithIgnoreCase: 'Starts With',
  startsWith: 'Starts With',
  notStartsWith: 'Not Starts With',
  contains: 'Contains',
  notContains: 'Not Contains',
};

export const BinaryOperators = ['equals', 'notEqual'] as const;
export type BinaryOperatorType = typeof BinaryOperators[number];

export const TagOperators = [
  'contains',
  'notContains',
  'containsRecursively',
  'containsNotRecursively',
] as const;
export type TagOperatorType = typeof TagOperators[number];

export type OperatorType =
  | TagOperatorType
  | NumberOperatorType
  | StringOperatorType
  | BinaryOperatorType;

// FFR: Boolean keys are not supported in IndexedDB/Dexie - must store booleans as 0/1
export interface IBaseSearchCriteria {
  key: keyof FileDTO;
  valueType: 'number' | 'date' | 'string' | 'array';
  readonly operator: OperatorType;
}

export interface ITagSearchCriteria extends IBaseSearchCriteria {
  value: ID[];
  operator: TagOperatorType;
}

export interface IStringSearchCriteria extends IBaseSearchCriteria {
  value: string;
  operator: StringOperatorType;
}

export interface INumberSearchCriteria extends IBaseSearchCriteria {
  value: number;
  operator: NumberOperatorType;
}

export interface IDateSearchCriteria extends IBaseSearchCriteria {
  value: Date;
  /** TODO: Would be cool to have relative time: e.g. modified today/last month */
  operator: NumberOperatorType;
}
// General search criteria for a database entity

export type SearchCriteria =
  | ITagSearchCriteria
  | IStringSearchCriteria
  | INumberSearchCriteria
  | IDateSearchCriteria;
