-- Run this in Supabase → SQL Editor
CREATE TABLE expenses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount         numeric(12,2) NOT NULL CHECK (amount > 0),
  currency       text NOT NULL CHECK (currency IN ('RSD','RUB','USD','EUR','GEL')),
  category       text NOT NULL CHECK (category IN (
                   'Food Home','Food Cafe','Dog','Health','Apartment',
                   'Entertainment','Trips','Taxi','Gifts','Coffee',
                   'Household','Subscriptions','Clothing','Bukvalno','Fees','Other'
                 )),
  entry_date     date NOT NULL DEFAULT CURRENT_DATE,
  created_at_ts  timestamptz NOT NULL DEFAULT now(),
  amount_rsd     numeric(12,2) NOT NULL CHECK (amount_rsd >= 0),
  fx_rate_to_rsd numeric(10,4) NOT NULL CHECK (fx_rate_to_rsd > 0)
);
