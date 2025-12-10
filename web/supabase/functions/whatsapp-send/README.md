# WhatsApp Send Edge Function

Sends WhatsApp messages via external API.

## Setup

1. Configure environment variables in Supabase Dashboard:
   - `WHATSAPP_API_KEY` - Your WhatsApp API key
   - `WHATSAPP_API_URL` - Your WhatsApp API endpoint URL

2. Deploy the function:
   ```bash
   supabase functions deploy whatsapp-send
   ```

## Usage

Send a POST request to the function endpoint:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/whatsapp-send \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+4799999999",
    "message": "Hello! Your booking is confirmed.",
    "salon_id": "optional-salon-id"
  }'
```

## Request Body

- `to` (required): Phone number in E.164 format (e.g., +4799999999)
- `message` (required): Message text to send
- `salon_id` (optional): Salon ID for logging/auditing

## Response

Success:
```json
{
  "success": true,
  "messageId": "msg_123",
  "to": "+4799999999"
}
```

Error:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Integration

This function is a template. You need to:
1. Replace the generic HTTP API call with your actual WhatsApp provider (Twilio, WhatsApp Business API, etc.)
2. Update the request/response format to match your provider's API
3. Add error handling specific to your provider

