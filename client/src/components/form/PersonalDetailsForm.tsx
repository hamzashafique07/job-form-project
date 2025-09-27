// client/src/components/form/PersonalDetailsForm.tsx
import TextInput from "../ui/TextInput";

type Props = {
  register: any;
  errors: Record<string, any>;
  
};

export default function PersonalDetailsForm({
  register,
  errors
}: Props) {
  return (
    <>
      <TextInput
        label="First name"
        {...register("firstName")}
        error={errors.firstName?.message}
      />
      <TextInput
        label="Last name"
        {...register("lastName")}
        error={errors.lastName?.message}
      />
      <TextInput
        label="Email"
        {...register("email")}
        error={errors.email?.message}
      />
      <TextInput
        label="Phone"
        {...register("phone")}
        error={errors.phone?.message}
      />
    </>
  );
}
