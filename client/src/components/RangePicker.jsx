import { Button, ButtonGroup } from "@heroui/react";
import { RANGE_OPTIONS } from "../lib/constants";

export function RangePicker({ value, onChange, size = "sm" }) {
  return (
    <ButtonGroup size={size} radius="full" variant="flat" className="bg-content2/80">
      {RANGE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          color={value === option.value ? "primary" : "default"}
          variant={value === option.value ? "solid" : "light"}
          className={
            value === option.value
              ? "min-w-12 font-semibold"
              : "min-w-12 text-default-500"
          }
          onPress={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
