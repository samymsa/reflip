import { type PurchasePublic } from "@/client";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { LuEye } from "react-icons/lu";

interface ViewPurchaseProps {
  purchase: PurchasePublic;
}

const ViewPurchase = ({ purchase }: ViewPurchaseProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: "/purchases/$purchaseId",
      params: { purchaseId: purchase.id },
    });
  };

  return (
    <Button variant="ghost" onClick={handleClick}>
      <LuEye />
      Voir les détails
    </Button>
  );
};

export default ViewPurchase;
