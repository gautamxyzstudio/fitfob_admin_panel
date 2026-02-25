// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog } from "@mui/material";
import { ICONS } from "../../assets/exports";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import OTPInput from "react-otp-input";
import CustomButton from "../../components/atoms/customButton/CustomButton";
// import useSnackBarStore from "../../store/snackBar.store";

interface AuthenticateOtpPayload {
  otp: string;
}

const AuthenticateOTP = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AuthenticateOtpPayload) => void;
  loading: boolean;
}) => {
  const [timer, setTimer] = useState(0);
  // const { setSnackBar } = useSnackBarStore();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuthenticateOtpPayload>({
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const updateTimer = () => {
      const seconds = new Date().getSeconds();
      const remaining = 30 - (seconds % 30);
      setTimer(remaining);
    };

    updateTimer(); // initial sync

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const onError = () => {
    console.log("Form Error", errors);
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      sx={{
        "& .MuiPaper-root": {
          padding: "50px 24px",
          width: 624,
          boxShadow: "0 0 52px 0 rgba(0, 0, 0, 0.12)",
          borderRadius: 5,
          alignItems: "center",
        },
      }}
      onClose={onClose}
    >
      <img src={ICONS.AUTHENTICATE} className="w-25 h-25 mb-4" />

      <h2 className="text-5xl font-bold mb-3 text-center">
        Authenticate Your Account
      </h2>
      <p className="text-base text-center">
        For your security, enter the verification code from your authenticator
        app to continue.
      </p>
      <form
        className="flex flex-col items-center justify-center mt-5 w-full mx-auto overflow-auto"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <Controller
          control={control}
          name="otp"
          rules={{
            required: "Please enter the OTP.",
            minLength: {
              value: 6,
              message: "OTP must be 6 digits.",
            },
            maxLength: {
              value: 6,
              message: "OTP must be 6 digits.",
            },
            pattern: {
              value: /^[0-9]+$/,
              message: "OTP must contain only numbers.",
            },
          }}
          render={({ field, fieldState }) => (
            <React.Fragment>
              <OTPInput
                value={field.value}
                onChange={field.onChange}
                numInputs={6}
                shouldAutoFocus
                inputType="tel" // removes arrows, allows numbers only
                containerStyle={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                }}
                renderInput={(inputProps, index) => (
                  <input
                    {...inputProps}
                    key={index}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={{
                      width: "100%",
                      height: "clamp(2.5rem, 6.3vw, 3.5rem)",
                      fontSize: "clamp(0.9rem, 3vw, 1rem)",
                      borderRadius: "8px",
                      textAlign: "center",
                      outline: "none",
                      transition: "all 0.2s ease",
                      border: "1px solid #E5E7EB",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid #E23744";
                      e.target.style.boxShadow =
                        "0 0 5px rgba(226, 55, 68, 0.5)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid #E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                )}
              />
              {fieldState.error && (
                <span className="text-red text-sm mt-2">
                  {fieldState.error.message}
                </span>
              )}
            </React.Fragment>
          )}
        />
        <div className="flex flex-row justify-between w-full mt-6.5">
          <p className="text-base text-secondary-text w-84.75">
            Enter the 6-digit code from your authenticator app.
            {timer > 0 ? (
              <span className="text-gray-400 ml-1">
                A new code will generate in {timer}s
              </span>
            ) : (
              <span className="text-gray-400 ml-1">
                A new code has been generated in your authenticator app.
              </span>
            )}
          </p>
          <CustomButton
            label="Submit"
            type="submit"
            buttonStyle="primary"
            disabled={loading}
            customStyles="rounded! py-4! px-15.25!"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AuthenticateOTP;
