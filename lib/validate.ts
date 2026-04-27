export const CURRENCIES = ["RSD", "RUB", "USD", "EUR", "GEL"] as const;
export const CATEGORIES = [
  "Food Home", "Food Cafe", "Dog", "Health", "Apartment",
  "Entertainment", "Trips", "Taxi", "Gifts", "Coffee",
  "Household", "Subscriptions", "Clothing", "Bukvalno", "Fees", "Other",
] as const;

export type Currency = typeof CURRENCIES[number];
export type Category = typeof CATEGORIES[number];

export interface ExpenseInput {
  amount: number;
  currency: Currency;
  category: Category;
  entry_date: string; // ISO date string YYYY-MM-DD
  note?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateExpenseInput(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data || typeof data !== "object") return [{ field: "body", message: "Invalid payload" }];

  const d = data as Record<string, unknown>;

  const amount = Number(d.amount);
  if (!d.amount || isNaN(amount) || amount <= 0) {
    errors.push({ field: "amount", message: "Сумма должна быть > 0" });
  }

  if (!CURRENCIES.includes(d.currency as Currency)) {
    errors.push({ field: "currency", message: "Недопустимая валюта" });
  }

  if (!CATEGORIES.includes(d.category as Category)) {
    errors.push({ field: "category", message: "Недопустимая категория" });
  }

  if (!d.entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(d.entry_date as string)) {
    errors.push({ field: "entry_date", message: "Некорректная дата" });
  } else {
    const dt = new Date(d.entry_date as string);
    if (isNaN(dt.getTime())) errors.push({ field: "entry_date", message: "Некорректная дата" });
  }

  if (d.note !== undefined && d.note !== null) {
    if (typeof d.note !== "string") errors.push({ field: "note", message: "Комментарий должен быть строкой" });
    else if (d.note.length > 500) errors.push({ field: "note", message: "Комментарий не более 500 символов" });
  }

  return errors;
}
