import { ICONS } from "../../assets/exports";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import TextInput from "../../components/modules/textInput/TextInput";
import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { Link } from "react-router";
import AuthenticateOTP from "./AuthenticateOTP";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const renderPasswordVisibilityIcon = () => {
    return showPassword ? <Visibility /> : <VisibilityOff />;
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });
  const onSubmit = (data: LoginFormInputs) => {
    console.log("Form data:", data);
    setOpen(true);
  };
  const onError = () => {
    console.log("Form Error", errors);
  };
  return (
    <React.Fragment>
      <AuthLayout>
        <div className="flex items-center gap-x-1 mb-6">
          <img className="w-10.5 " alt="FitFob" src={ICONS.FITFOB} />
          <p className="text-[32px] leading-9 font-bold capitalize">Fitfob</p>
        </div>
        <div className="flex flex-col gap-y-3">
          <p className="text-[64px] leading-18 capitalize font-extrabold">
            welcome back
          </p>
          <p className="text-base font-normal">
            Login to access your Dashboard
          </p>
        </div>
        <form
          className="xl:mt-6 md:mt-5 mt-3 w-full h-auto"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <TextInput
            label="Email or Phone number"
            placeholder="Enter your email or phone number "
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
          <TextInput
            label="Password"
            id="password"
            rules={{
              required: "Password is required",
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
            customClassesOuter="md:mt-4 mt-3"
            placeholder="Enter your password"
            autoComplete="none"
            type={showPassword ? "text" : "password"}
            control={control}
            name="password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" className="m-0!">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {renderPasswordVisibilityIcon()}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <div className="w-full flex flex-row items-center justify-between mt-3">
            <FormControlLabel
              sx={{
                color: "#b3b3b3",
                "& .MuiFormControlLabel-label": {
                  fontSize: "16px",
                  lineHeight: "20px",
                },
                marginInline: 0,
              }}
              control={
                <Checkbox
                  {...register("rememberMe")}
                  size="small"
                  sx={{
                    padding: 0,
                    marginRight: "6px",
                    ".MuiSvgIcon-root": {
                      fill: "#6B7280",
                      width: "20px",
                      height: "20px",
                    },
                  }}
                />
              }
              label="Keep me logged in"
            />
            <Link
              to="/forgot-password"
              className="text-primary text-base font-medium"
            >
              Forgot password
            </Link>
          </div>
          <CustomButton
            label="Login"
            type="submit"
            buttonStyle="primary"
            customStyles="w-full rounded! mt-7 py-4!"
          />
        </form>
      </AuthLayout>

      <AuthenticateOTP open={open} onClose={() => setOpen(false)} />
    </React.Fragment>
  );
};

export default Login;
