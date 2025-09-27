//client/src/components/form/AddressLookupForm.tsx
import TextInput from "../ui/TextInput";

type Props = {
  register: any;
  errors: Record<string, any>;
};

export default function AddressLookupForm({
  register,
  errors
}: Props) {
  return (
    <TextInput
      label="Postcode"
      placeholder="Enter postcode"
      {...register("postcode")}
      error={errors.postcode?.message}
    />
  );
}
