import React from "react";

interface CustomBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  customClasses?: string;
  compRef?: React.Ref<HTMLDivElement>;
}

const CustomBox: React.FC<CustomBoxProps> = ({
  children,
  customClasses = "",
  compRef,
  className = "",
  ...props
}) => {
  return (
    <div
      ref={compRef}
      className={`bg-white rounded-2xl ${customClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default CustomBox;

