import { useForm } from "react-hook-form";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import AuthLayout from "../../components/layouts/AuthLayout";
import TextInput from "../../components/modules/textInput/TextInput";

interface ForgotPasswordPayload {
  email: string;
}

const ForgotPassword = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordPayload>({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });
  const onSubmit = (data: ForgotPasswordPayload) => {
    console.log("Form data:", data);
  };
  const onError = () => {
    console.log("Form Error", errors);
  };
  return (
    <AuthLayout customClasses="items-start">
      <p className="text-[64px] leading-18 capitalize font-extrabold mb-3">
        Forgot Password
      </p>
      <span className="text-base text-secondary-text">
        Please enter your email to reset the password
      </span>
      <form className="w-full mt-5" onSubmit={handleSubmit(onSubmit, onError)}>
        <TextInput
          label={"Email"}
          placeholder="Enter your email"
          fullWidth
          type="email"
          id="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
          autoComplete="none"
          control={control}
          name="email"
        />
        <CustomButton
          label="Send Code"
          type="submit"
          buttonStyle="primary"
          customStyles="w-full rounded! mt-5 py-4!"
        />
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
