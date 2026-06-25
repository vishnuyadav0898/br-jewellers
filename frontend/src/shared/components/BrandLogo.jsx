import { Link } from "react-router-dom";
import { appConfig } from "../../config/appConfig";
import { routes } from "../../config/routes";
import brandLogo from "../../assets/logo/br-logo.svg";
import { cn } from "../utils/cn";

export function BrandLogo({
  to = routes.appHome,
  className,
  imageClassName,
}) {
  return (
    <Link
      to={to}
      aria-label={appConfig.name}
      className={cn("inline-flex min-w-0 shrink-0 items-center", className)}
    >
      <img
        src={brandLogo}
        alt={appConfig.name}
        width="220"
        height="69"
        className={cn("block h-auto w-[168px] max-w-full object-contain sm:w-[220px]", imageClassName)}
      />
    </Link>
  );
}
