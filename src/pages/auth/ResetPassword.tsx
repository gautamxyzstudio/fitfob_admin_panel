/* eslint-disable react-hooks/incompatible-library */
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import TextInput from "../../components/modules/textInput/TextInput";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CustomButton from "../../components/atoms/customButton/CustomButton";

interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}
const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordPayload>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: ResetPasswordPayload) => {
    console.log("Reset password", data);
    navigate("/login");
  };

  const onError = () => {
    console.log("Form Error", errors);
  };
  return (
    <AuthLayout customClasses="items-start">
      <p className="text-[64px] leading-18 font-extrabold mb-3">
        Create a new password
      </p>
      <span className="text-base text-secondary-text">
        Enter a new password
      </span>
      <form
        className="flex flex-col justify-center w-full mx-auto overflow-auto"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        {/* Password */}
        <TextInput
          label="Set New Password"
          id="password"
          customClassesOuter="mt-5"
          placeholder="Enter your new password"
          type={showPassword ? "text" : "password"}
          rules={{
            required: "Please enter your password.",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long.",
            },
            pattern: {
              value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
            },
          }}
          control={control}
          name="newPassword"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Confirm Password */}
        <TextInput
          label="Confirm Password"
          id="confirmPassword"
          customClassesOuter="mt-3"
          placeholder="Enter your confirm password"
          type={showConfirmPassword ? "text" : "password"}
          rules={{
            required: "Please confirm your password",
          }}
          control={control}
          {...register("confirmPassword", {
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          })}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <CustomButton
          label="Save Password"
          type="submit"
          buttonStyle="primary"
          customStyles="w-full rounded! mt-5 py-4!"
        />
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
