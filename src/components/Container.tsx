import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Container = ({ children, className, ...props }: ContainerProps) => {
  const combinedClassName = [
    "grid grid-cols-12 gap-x-8 w-full max-w-screen-2xl mx-auto px-8",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Container;

