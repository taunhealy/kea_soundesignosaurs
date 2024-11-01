import { Check, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Search presets...",
}: MultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (optionValue: string) => {
    onChange(
      selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
    );
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-2">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">
              No presets found
            </p>
          ) : (
            <div className="space-y-1">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-sm",
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted"
                    )}
                    type="button"
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
