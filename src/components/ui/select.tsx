"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; value?: string; onValueChange?: (val: string) => void }
>(({ children, value, onValueChange }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(value || "");

  const handleSelect = (val: string) => {
    setSelected(val);
    onValueChange?.(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selected || "Seleccionar"}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { onSelect: handleSelect } as any)
              : child
          )}
        </div>
      )}
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}
    {...props}
  />
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  { value: string; onSelect?: (val: string) => void; children: React.ReactNode; className?: string }
>(({ className, value, onSelect, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
      className
    )}
    onClick={() => onSelect?.(value)}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  { placeholder?: string; children?: React.ReactNode }
>(({ placeholder, children }, ref) => (
  <span ref={ref} className="pointer-events-none">
    {children || placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};