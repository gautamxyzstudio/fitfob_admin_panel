import React from "react";

interface CustomButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonStyle?: "primary" | "secondary" | "disabled" | "white" | "outlined";
  customStyles?: string;
  type?: "button" | "reset" | "submit";
}

const getButtonStyles = (
  style: "primary" | "secondary" | "disabled" | "white" | "outlined",
) => {
  switch (style) {
    case "primary":
      return `bg-primary text-white cursor-pointer`;
    case "secondary":
      return `bg-background text-black-50 cursor-pointer`;
    case "disabled":
      return `bg-white text-secondary-text rounded-lg text-sm border border-divider shadow-[0_1px_2px_0_rgba(14,24,41,0.05)] cursor-not-allowed`;
    case "white":
      return `bg-white text-secondary-text shadow-[0_0_12px_0_rgba(0,0,0,0.10)] cursor-pointer`;
    case "outlined":
      return `bg-transparent text-primary rounded-lg text-sm border border-primary shadow-[0_1px_2px_0_rgba(14,24,41,0.05)] cursor-pointer`;
  }
};
const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  onClick,
  buttonStyle = "primary",
  disabled = false,
  customStyles,
  type,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyles(
        buttonStyle,
      )} ${customStyles} flex items-center justify-center gap-x-1 px-4 py-2 rounded-md font-bold text-base transition-opacity duration-200`}
    >
      {icon && <span>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
};

export default CustomButton;
