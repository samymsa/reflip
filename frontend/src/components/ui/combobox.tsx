"use client";

import {
  createListCollection,
  Input,
  Select,
  SelectRootProps,
  Separator,
} from "@chakra-ui/react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "./input-group";

interface ComboboxProps
  extends Omit<SelectRootProps, "collection" | "placeholder"> {
  items: Array<{ label: string; value: string }>;
  control?: any; // react-hook-form control
  name?: string; // name of the field in the form
  label?: string;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
}

const Combobox = ({
  items,
  control = null,
  name = "",
  label = "Elément",
  selectPlaceholder = "Sélectionnez un élément",
  searchPlaceholder = "Rechercher des éléments",
  ...props
}: ComboboxProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const filteredItems = items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <Select.Root
            name={field.name}
            value={field.value}
            onValueChange={({ value }) => field.onChange(value)}
            onInteractOutside={() => field.onBlur()}
            collection={createListCollection({ items })}
            {...props}
          >
            <Select.HiddenSelect />
            <Select.Label>{label}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={selectPlaceholder} />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <InputGroup startElement={<LuSearch />} mb={1}>
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Separator />
                {filteredItems.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        );
      }}
    />
  );
};

export default Combobox;
