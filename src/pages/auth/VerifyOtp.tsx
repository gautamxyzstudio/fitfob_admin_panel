/* eslint-disable @typescript-eslint/no-explicit-any */
import AuthLayout from "../../components/layouts/AuthLayout";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import OtpInput from "react-otp-input";
import React, { useEffect, useState } from "react";
import useSnackBarStore from "../../store/snackBar.store";
import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";

interface VerifyOtpPayload {
  identifier: string;
  otp: string;
}

const VerifyOtp = () => {
  const [timer, setTimer] = useState(0);
  const { setSnackBar } = useSnackBarStore();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<VerifyOtpPayload>({
    defaultValues: {
      identifier: "",
      otp: "",
    },
    mode: "onChange",
  });

  const formDataSessionStr = sessionStorage.getItem("forgotPassword");
  if (formDataSessionStr) {
    const formData = JSON.parse(formDataSessionStr);
    setValue("identifier", formData.email);
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    try {
      setSnackBar("OTP resent to your email", "success");
      setTimer(60);
    } catch (err: any) {
      setSnackBar(err?.message || "Failed to resend OTP", "error");
    }
  };

  const onSubmit = (data: VerifyOtpPayload) => {
    console.log("Verified Otp Payload", {
      Email: data.identifier,
      Otp: Number(data.otp),
    });
    navigate("/reset-password");
  };

  const onError = () => {
    console.log("Form Error", errors);
  };
  return (
    <AuthLayout customClasses="items-start">
      <p className="text-[64px] leading-18 capitalize font-extrabold mb-3">
        Verify OTP
      </p>
      <span className="text-base text-secondary-text">
        Enter the OTP sent to your registered email address
      </span>
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
              <OtpInput
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
        <CustomButton
          label="Verify OTP"
          type="submit"
          buttonStyle="primary"
          customStyles="w-full rounded! mt-6 py-4!"
        />
      </form>

      <p className="mt-3 text-base text-secondary-text">
        Didn’t receive the OTP?
        {timer > 0 ? (
          <span className="text-gray-400 ml-1 ">Resend in {timer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-primary ml-1 cursor-pointer font-medium"
          >
            Resend OTP
          </button>
        )}
      </p>
    </AuthLayout>
  );
};

export default VerifyOtp;
