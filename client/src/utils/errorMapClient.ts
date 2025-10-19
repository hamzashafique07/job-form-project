// client/src/utils/errorMapClient.ts
export function mapErrorKeyToMessage(key: string): string | undefined {
  const map: Record<string, string> = {
    "iva.required": "Please tell us whether you've had an IVA or bankruptcy.",
    "title.required": "Please choose a title (Mr / Mrs / Miss / Ms).",
    "firstName.required": "Please enter your first name.",
    "firstName.minLength": "First name must be at least 2 letters.",
    "firstName.invalidChars": "First name may only contain letters and spaces.",
    "firstName.tooLong": "First name is too long.",
    "lastName.required": "Please enter your last name.",
    "lastName.minLength": "Last name must be at least 2 letters.",
    "lastName.invalidChars": "Last name may only contain letters and spaces.",
    "lastName.tooLong": "Last name is too long.",
    "dob.required": "Please enter your date of birth.",
    "dob.invalid": "Please enter a valid date.",
    "dob.underage": "You must be 18 or older to continue.",
    "email.required": "Please enter your email address.",
    "email.invalidFormat":
      "Please enter a valid email address (example@domain.com).",
    "email.undeliverable":
      "This email looks undeliverable. Please use a different email.",
    "email.serverCheckFailed":
      "We couldn't verify that email right now — please try again.",
    "phone.required": "Please enter your mobile number.",
    "phone.format":
      "Enter a UK mobile number starting with 07 and 11 digits (e.g. 07123 456789).",
    "phone.undeliverable":
      "This number appears invalid or unreachable. Try a different number.",
    "phone.serverCheckFailed":
      "We couldn't validate your number right now — please try again.",
    "consent.required": "You must accept to continue.",
    "signature.required": "Please sign in the box to continue.",
    "signature.uploadFailed":
      "We couldn't save your signature. Please try again.",
    "currentPostcode.required": "Please enter your postcode.",
    "currentPostcode.format":
      "Postcode must be digits only and 5–7 characters.",
    "currentPostcode.lookupNoResults":
      "No addresses found for that postcode. Enter your address manually.",
    "currentPostcode.lookupFailed": "Address lookup failed. Please try again.",
    "currentAddress.manualRequired": "Please enter your address.",
    "previousPostcode.format":
      "Postcode must be digits only and 5–7 characters.",
    "previousAddress.manualRequired":
      "Please enter the previous address or remove the previous address field.",
    "address.field.required": "Please complete the highlighted address fields.",
    "field.required": "This field is required.",
    "field.tooLong": "Too long. Please shorten this field.",
    "field.invalid": "Invalid value. Please check and try again.",
  };

  return map[key];
}
