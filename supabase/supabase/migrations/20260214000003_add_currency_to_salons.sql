-- Add currency column to salons table
-- Stores ISO 4217 currency code (e.g. "NOK", "USD", "EUR")
-- Default NOK for backward compatibility with existing salons

ALTER TABLE salons ADD COLUMN currency text NOT NULL DEFAULT 'NOK';

-- Ensure only valid 3-letter uppercase ISO codes are stored
ALTER TABLE salons ADD CONSTRAINT salons_currency_iso CHECK (currency ~ '^[A-Z]{3}$');
