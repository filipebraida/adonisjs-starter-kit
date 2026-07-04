import * as React from "react";
import { EyeClosed, EyeIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-9", className)}
        disabled={disabled}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <EyeIcon size={18} /> : <EyeClosed size={18} />}
      </Button>
    </div>
  );
}

export { PasswordInput };
