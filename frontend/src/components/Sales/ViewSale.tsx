import { type SalePublic } from "@/client";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { LuEye } from "react-icons/lu";

interface ViewSaleProps {
  sale: SalePublic;
}

const ViewSale = ({ sale }: ViewSaleProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: "/sales/$saleId",
      params: { saleId: sale.id },
    });
  };

  return (
    <Button variant="ghost" onClick={handleClick}>
      <LuEye />
      Voir les détails
    </Button>
  );
};

export default ViewSale;
