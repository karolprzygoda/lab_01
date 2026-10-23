"use client";

import { useRef, useState, type ComponentProps } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type NumberInputProps = Omit<ComponentProps<typeof InputGroupInput>, "type" | "value" | "defaultValue" | "onChange" | "ref"> & {
  defaultValue: string;
  label: string;
};

export function NumberInput({ defaultValue, label, disabled, ...props }: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  function changeByStep(direction: "up" | "down") {
    const input = inputRef.current;
    if (!input) return;
    if (direction === "up") input.stepUp();
    else input.stepDown();
    setValue(input.value);
  }

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        ref={inputRef}
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
      />
      <InputGroupAddon align="inline-start">
        <InputGroupButton size="icon-xs" disabled={disabled} aria-label={`Zmniejsz ${label}`} onClick={() => changeByStep("down")}>
          <MinusIcon aria-hidden="true" />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" disabled={disabled} aria-label={`Zwiększ ${label}`} onClick={() => changeByStep("up")}>
          <PlusIcon aria-hidden="true" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
