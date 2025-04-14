"use client";

import {
  Badge,
  BadgeProps,
  HStack,
  Portal,
  Select,
  SelectRootProps,
  createListCollection,
  useSelectContext,
} from "@chakra-ui/react";
import { RiForbidLine } from "react-icons/ri";

export interface BadgeOption {
  label: string;
  value: string;
  colorPalette: string;
}

export interface BadgeSelectProps
  extends Omit<SelectRootProps, "collection" | "variant"> {
  items: BadgeOption[];
  variant: BadgeProps["variant"];
  size: BadgeProps["size"];
}

const SelectTrigger = ({
  size,
  variant,
}: {
  size: BadgeProps["size"];
  variant: BadgeProps["variant"];
}) => {
  const select = useSelectContext();
  const items = select.selectedItems as BadgeOption[];
  return select.hasSelectedItems ? (
    <Badge
      as="button"
      size={size}
      variant={variant}
      colorPalette={items[0]?.colorPalette}
      _hover={{ cursor: "pointer" }}
      {...select.getTriggerProps()}
    >
      {items[0]?.label}
    </Badge>
  ) : (
    <RiForbidLine />
  );
};

const BadgeSelect = ({ items, variant, size, ...props }: BadgeSelectProps) => {
  return (
    <Select.Root
      collection={createListCollection({ items })}
      minW="32"
      {...props}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <SelectTrigger size={size} variant={variant} />
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content minW="32">
            {items.map((item) => (
              <Select.Item item={item} key={item.value}>
                <HStack>
                  <Badge
                    size={size}
                    variant={variant}
                    colorPalette={item.colorPalette}
                  >
                    {item.label}
                  </Badge>
                </HStack>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default BadgeSelect;
