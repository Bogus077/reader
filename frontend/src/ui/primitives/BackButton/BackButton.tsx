import { FC } from "react";
import { IconButton, IconButtonProps } from "../Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type BackButtonProps = Omit<
  IconButtonProps,
  "icon" | "children" | "onClick" | "aria-label"
>;

export const BackButton: FC<BackButtonProps> = ({
  variant = "ghost",
  size = "md",
  ...rest
}) => {
  const navigate = useNavigate();
  return (
    <IconButton
      icon={<ArrowLeft size={18} />}
      variant={variant}
      size={size}
      aria-label="Назад"
      onClick={() => navigate(-1)}
      {...rest}
    />
  );
};
