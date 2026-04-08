import { db } from '../index';

// Collection path helpers
export const usersCol = () => db.collection('users');
export const userDoc = (userId: string) => usersCol().doc(userId);

export const taxYearsCol = (userId: string) =>
  userDoc(userId).collection('taxYears');
export const taxYearDoc = (userId: string, taxYearId: string) =>
  taxYearsCol(userId).doc(taxYearId);

export const incomeEntriesCol = (userId: string, taxYearId: string) =>
  taxYearDoc(userId, taxYearId).collection('incomeEntries');
export const incomeEntryDoc = (userId: string, taxYearId: string, entryId: string) =>
  incomeEntriesCol(userId, taxYearId).doc(entryId);

export const expenseEntriesCol = (userId: string, taxYearId: string) =>
  taxYearDoc(userId, taxYearId).collection('expenseEntries');
export const expenseEntryDoc = (userId: string, taxYearId: string, entryId: string) =>
  expenseEntriesCol(userId, taxYearId).doc(entryId);

export const rentalPropertiesCol = (userId: string, taxYearId: string) =>
  taxYearDoc(userId, taxYearId).collection('rentalProperties');
export const rentalPropertyDoc = (userId: string, taxYearId: string, propId: string) =>
  rentalPropertiesCol(userId, taxYearId).doc(propId);

export const rentalIncomesCol = (userId: string, taxYearId: string, propId: string) =>
  rentalPropertyDoc(userId, taxYearId, propId).collection('rentalIncomes');
export const rentalIncomeDoc = (userId: string, taxYearId: string, propId: string, incomeId: string) =>
  rentalIncomesCol(userId, taxYearId, propId).doc(incomeId);

export const rentalExpensesCol = (userId: string, taxYearId: string, propId: string) =>
  rentalPropertyDoc(userId, taxYearId, propId).collection('rentalExpenses');
export const rentalExpenseDoc = (userId: string, taxYearId: string, propId: string, expenseId: string) =>
  rentalExpensesCol(userId, taxYearId, propId).doc(expenseId);

export const investmentsCol = (userId: string, taxYearId: string) =>
  taxYearDoc(userId, taxYearId).collection('investments');
export const investmentDoc = (userId: string, taxYearId: string, investmentId: string) =>
  investmentsCol(userId, taxYearId).doc(investmentId);

export const receiptsCol = (userId: string, taxYearId: string) =>
  taxYearDoc(userId, taxYearId).collection('receipts');
export const receiptDoc = (userId: string, taxYearId: string, receiptId: string) =>
  receiptsCol(userId, taxYearId).doc(receiptId);
