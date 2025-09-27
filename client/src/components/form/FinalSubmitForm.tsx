//client/src/components/form/AddressLookupForm.tsx
import TextInput from "../ui/TextInput";

type Props = {
  register: any;
  errors: Record<string, any>;
  
};

export default function FinalSubmitForm({
  register,
  errors,

}: Props) {
  return (
    <TextInput
      label="Signature (Base64)"
      placeholder="Paste signature"
      {...register("signatureBase64")}
      error={errors.signatureBase64?.message}
    />
  );
}
