"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string | undefined>;

const FormErrorsContext = React.createContext<FieldErrors>({});
const FormItemContext = React.createContext<{ id: string; name: string }>({ id: "", name: "" });

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  errors?: FieldErrors;
}

export function Form({ errors = {}, className, children, ...props }: FormProps) {
  return (
    <FormErrorsContext.Provider value={errors}>
      <form className={cn("space-y-4", className)} {...props}>
        {children}
      </form>
    </FormErrorsContext.Provider>
  );
}

export interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const id = React.useId();
  return <FormItemContext.Provider value={{ id, name }}>{children}</FormItemContext.Provider>;
}

export function useFormField() {
  const { id, name } = React.useContext(FormItemContext);
  const errors = React.useContext(FormErrorsContext);
  return {
    id,
    name,
    error: name ? errors[name] : undefined,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
}

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  ),
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(error && "text-red-600 dark:text-red-400", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

export function FormControl({ children }: { children: React.ReactElement<Record<string, unknown>> }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return React.cloneElement(children, {
    id: formItemId,
    "aria-describedby": error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    "aria-invalid": Boolean(error),
  });
}

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-xs text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ?? children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-xs font-medium text-red-600 dark:text-red-400", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
