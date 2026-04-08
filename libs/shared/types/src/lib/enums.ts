export enum Currency {
  CAD = 'CAD',
  USD = 'USD',
}

export enum IncomeSourceType {
  RENTAL = 'RENTAL',
  INTERNET_BUSINESS = 'INTERNET_BUSINESS',
  STRIPE = 'STRIPE',
}

export enum ExpenseCategoryType {
  EMAIL = 'EMAIL',
  GCP = 'GCP',
  NAMECHEAP = 'NAMECHEAP',
  PHONE = 'PHONE',
  INTERNET = 'INTERNET',
  ADS = 'ADS',
  HOSTING = 'HOSTING',
  OTHER = 'OTHER',
}

export enum RentalExpenseCategory {
  WATER = 'WATER',
  PROPERTY_TAX = 'PROPERTY_TAX',
  INSURANCE = 'INSURANCE',
  MORTGAGE = 'MORTGAGE',
  LAWYER = 'LAWYER',
  RENOVATION = 'RENOVATION',
  HYDRO = 'HYDRO',
  OTHER = 'OTHER',
}

export enum InvestmentAccountType {
  RRSP = 'RRSP',
  TFSA = 'TFSA',
}

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  EXTRACTED = 'EXTRACTED',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum LinkedType {
  INCOME = 'income',
  EXPENSE = 'expense',
  RENTAL_EXPENSE = 'rentalExpense',
}
