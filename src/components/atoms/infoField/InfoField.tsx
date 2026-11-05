type InfoFieldProps = {
  label: string;
  value?: string | null;
  className?: string;
  customClasses?:string;
};

export const InfoField = ({
  label,
  value,
  className = "w-[25%]",
  customClasses,
}: InfoFieldProps) => {
  return (
    <div className={`${className} ${customClasses} flex flex-col gap-y-0.5`}>
      <span className="text-sm text-secondary-text">{label}</span>
      <span className="text-base text-black">{value || "-"}</span>
    </div>
  );
};