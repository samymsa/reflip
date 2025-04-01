import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

import type { PurchasePublic } from "@/client";
import DeletePurchase from "../Purchases/DeletePurchase";
import EditPurchase from "../Purchases/EditPurchase";

interface PurchaseActionsMenuProps {
  purchase: PurchasePublic;
}

export const PurchaseActionsMenu = ({ purchase }: PurchaseActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditPurchase purchase={purchase} />
        <DeletePurchase id={purchase.id} />
      </MenuContent>
    </MenuRoot>
  );
};
