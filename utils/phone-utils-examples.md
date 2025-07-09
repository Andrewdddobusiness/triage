# Phone Utils Examples

This file demonstrates how the phone utility functions handle different Australian phone number formats.

## Example Phone Number: +61412345678

### Input Formats That Should All Match:
- `+61412345678` (E.164 international format)
- `0412345678` (Local Australian format)  
- `412345678` (Raw mobile number)
- `04 1234 5678` (Spaced local format)
- `(04) 1234 5678` (Parentheses format)
- `+61 412 345 678` (Spaced international format)

### Generated Search Formats:
The `generatePhoneFormats()` function will create these variations for database searching:
- `+61412345678`
- `0412345678`
- `412345678`
- `0412 345 678`
- `(04) 1234 5678`
- `+61 412 345 678`

### Database Query:
```sql
SELECT * FROM customer_inquiries 
WHERE phone IN (
  '+61412345678',
  '0412345678', 
  '412345678',
  '0412 345 678',
  '(04) 1234 5678',
  '+61 412 345 678'
);
```

## Use Cases:

1. **Twilio Phone Numbers Table**: Stores numbers in E.164 format (`+61412345678`)
2. **Customer Inquiries Table**: May store numbers in various formats from VAPI
3. **Phone Matching**: Our utility ensures all formats are matched regardless of input format

## Functions:

- `generatePhoneFormats(phone)`: Returns all possible format variations
- `normalizeToE164(phone)`: Converts to international format
- `normalizeToLocal(phone)`: Converts to local Australian format  
- `arePhoneNumbersEquivalent(phone1, phone2)`: Checks if two numbers are the same
- `formatPhoneForDisplay(phone, format)`: Formats for UI display