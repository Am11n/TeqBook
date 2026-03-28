-- =====================================================
-- Clarify WHATSAPP feature copy: salon–customer contact,
-- not TeqBook platform "support" or automated WhatsApp sends
-- =====================================================

UPDATE public.features
SET
  name = 'WhatsApp communication',
  description = 'Salon and customers can use WhatsApp from the booking page when the salon adds a WhatsApp number. Not TeqBook platform support or automated WhatsApp booking notifications.'
WHERE key = 'WHATSAPP';
