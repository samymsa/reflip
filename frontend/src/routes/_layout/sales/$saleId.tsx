import { SalesService } from "@/client";
import ProductsTable from "@/components/Products/ProductsTable";
import { Container, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/sales/$saleId")({
  component: Sale,
});

function Sale() {
  const saleId = Route.useParams().saleId;

  const { data, isLoading } = useQuery({
    queryFn: () => SalesService.readSale({ id: saleId }),
    queryKey: ["sales", saleId],
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const sale = data!;
  const saleDate = new Date(sale.date).toLocaleDateString("fr-FR");
  const salePrice = Number(sale.total_price).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        {`Vente du ${saleDate}`}
      </Heading>
      <Text color="gray.600">{saleDate}</Text>
      <Text fontSize="lg" fontWeight="bold" pt={4}>
        {salePrice}
      </Text>
      <Heading size="md" pt={8} pb={2}>
        Produits ({sale.products?.length ?? 0})
      </Heading>
      <ProductsTable products={sale.products} />
    </Container>
  );
}
