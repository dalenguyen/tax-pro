export interface TaxYear {
  id: string;
  year: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaxYearDto {
  year: number;
  notes?: string;
}

export interface UpdateTaxYearDto {
  notes?: string;
}
