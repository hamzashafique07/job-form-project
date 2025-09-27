// client/src/components/form/HelloForm.tsx
import TextInput from "../ui/TextInput";

type Props = {
  register: any;
  errors: Record<string, any>;
  
};

export default function HelloForm({ register, errors }: Props) {
  return (
    <TextInput
      label="First name"
      placeholder="Enter first name"
      {...register("firstName")}
      error={errors.firstName?.message}
    />
  );
}
