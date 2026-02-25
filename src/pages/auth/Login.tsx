import { ICONS } from "../../assets/exports";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import TextInput from "../../components/modules/textInput/TextInput";
import React, { useState } from "react";
import {
  Checkbox,
  Dialog,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import { Link, useNavigate } from "react-router";
import AuthenticateOTP from "./AuthenticateOTP";
import {
  useLogin,
  useMfaActive,
  useMfaVerify,
} from "../../hooks/auth/useLogin";
import useSnackBarStore from "../../store/snackBar.store";
import { useAuthStore } from "../../store/auth.store";
import { useUIStore } from "../../store/ui.store";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [openQr, setOpenQr] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: login, isPending: loginPending } = useLogin();
  const { mutate: mfaActive, isPending: mfaActivePending } = useMfaActive();
  const { mutate: mfaVerify, isPending: mfaVerifyPending } = useMfaVerify();
  const { setSnackBar } = useSnackBarStore();
  const { setMfa, setMfaActive, setSession } = useAuthStore();
  const { setGlobalLoader } = useUIStore();
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
    getValues,
    reset,
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
    setGlobalLoader(true);
    login(
      {
        identifier: data.email,
        password: data.password,
      },
      {
        onSuccess: (data) => {
          setGlobalLoader(false);
          console.log(data, "Response");
          if (
            data &&
            (localStorage.getItem("mfa") === null ||
              localStorage.getItem("mfa") === undefined)
          ) {
            setMfa(data.mfaSetup);
            setOpenQr(true);
            setQrCode(data.qr);
          } else if (data && localStorage.getItem("mfa") === "true") {
            setOpen(true);
            setMfaActive(data.mfaRequired);
            setTempToken(data.tempToken);
          }
        },
        onError: (error) => {
          setGlobalLoader(false);
          setSnackBar(error.message, "error");
          console.log(error.message, "Error");
        },
      },
    );
  };

  console.log(tempToken, "token");
  const handleAuthenticateOtpSubmit = (data: { otp: string }) => {
    setGlobalLoader(true);
    if (sessionStorage.getItem("mfaActive") === "true") {
      mfaVerify(
        {
          tempToken: tempToken,
          password: getValues("password"),
          otp: data.otp,
        },
        {
          onSuccess: (data) => {
            setGlobalLoader(false);
            console.log(data, "User on MFA Verify");
            setOpen(false);
            setSnackBar(data.message || "Login successfully!", "success");
            if (data.message || data.mfaResetRequired) {
              setMfa(false);
              setMfaActive(false);
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("mfa");
              sessionStorage.removeItem("mfaActive");
              localStorage.removeItem("user");
              localStorage.removeItem("mfa");
              localStorage.removeItem("mfaActive");
            } else if (data.jwt) {
              sessionStorage.setItem("user", JSON.stringify(data));
              localStorage.setItem("user", JSON.stringify(data));
              console.log(data, "User");
              setSession(data.jwt, data.user.id);
              navigate("/");
            }

            reset();
          },
          onError: (error) => {
            setGlobalLoader(false);
            setSnackBar(error.message, "error");
            console.log(error.message, "Error");
          },
        },
      );
    } else {
      mfaActive(
        { identifier: getValues("email"), otp: data.otp },
        {
          onSuccess: (data) => {
            setGlobalLoader(false);
            console.log(data, "Response");
            setSnackBar("MFA successfully enabled!", "success");
            setMfaActive(true);
            setOpen(false);
            reset();
          },
          onError: (error) => {
            setGlobalLoader(false);
            setSnackBar(error.message, "error");
            console.log(error.message, "Error");
            setMfaActive(false);
          },
        },
      );
    }
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
            disabled={loginPending || mfaActivePending || mfaVerifyPending}
            customStyles="w-full rounded! mt-7 py-4!"
          />
        </form>
      </AuthLayout>
      <Dialog
        open={openQr}
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            padding: "34px",
            width: 500,
            boxShadow: "0 0 52px 0 rgba(0, 0, 0, 0.12)",
            borderRadius: 5,
            alignItems: "center",
          },
        }}
        onClose={() => {
          setOpenQr(false);
        }}
      >
        <div className="w-full flex flex-col gap-y-4">
          <div className="w-full flex flex-row items-center justify-center">
            <p className="text-2xl font-bold">
              Enable Two-Factor Authentication
            </p>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-y-3">
            <img src={qrCode} srcSet={qrCode} alt="QR Code" />
            <p className="text-base font-normal text-center">
              Scan the QR code to enable two-factor authentication
            </p>
            <p className="text-base font-normal text-center text-gray-500">
              If you are not able to scan the QR code, you can enter the code
              manually
            </p>
          </div>
          <CustomButton
            label="I've Scanned the QR Code"
            buttonStyle="primary"
            customStyles="w-full rounded! py-3! mt-2"
            onClick={() => {
              setOpenQr(false);
              setOpen(true);
            }}
          />
        </div>
      </Dialog>
      <AuthenticateOTP
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAuthenticateOtpSubmit}
        loading={mfaVerifyPending || mfaActivePending}
      />
    </React.Fragment>
  );
};

export default Login;
