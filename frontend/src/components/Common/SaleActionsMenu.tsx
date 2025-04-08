import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

import type { SalePublic } from "@/client";
import DeleteSale from "../Sales/DeleteSale";
import EditSale from "../Sales/EditSale";
import ViewSale from "../Sales/ViewSale";

interface SaleActionsMenuProps {
  sale: SalePublic;
}

export const SaleActionsMenu = ({ sale }: SaleActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <ViewSale sale={sale} />
        <EditSale sale={sale} />
        <DeleteSale id={sale.id} />
      </MenuContent>
    </MenuRoot>
  );
};
