import { PurchasesService } from "@/client";
import AddProduct from "@/components/Products/AddProduct";
import ProductsTable from "@/components/Products/ProductsTable";
import { Container, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/purchases/$purchaseId")({
  component: Purchase,
});

function Purchase() {
  const purchaseId = Route.useParams().purchaseId;

  const { data, isLoading } = useQuery({
    queryFn: () => PurchasesService.readPurchase({ id: purchaseId }),
    queryKey: ["purchases", purchaseId],
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const purchase = data!;
  const purchaseDate = new Date(purchase.date).toLocaleDateString("fr-FR");
  const purchasePrice = Number(purchase.price).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        {purchase.name || `Achat du ${purchaseDate}`}
      </Heading>
      <Text color="gray.600">{purchaseDate}</Text>
      <Text fontSize="lg" fontWeight="bold" pt={4}>
        {purchasePrice}
      </Text>
      <Heading size="md" pt={8}>
        Produits ({purchase.products.length || 0})
      </Heading>
      <AddProduct purchaseId={purchase.id} />
      <ProductsTable products={purchase.products} />
    </Container>
  );
}
