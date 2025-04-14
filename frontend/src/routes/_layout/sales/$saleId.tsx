import { SalesService } from "@/client";
import ProductsTable from "@/components/Products/ProductsTable";
import {
  Badge,
  Box,
  Container,
  FormatNumber,
  Heading,
  HStack,
  Separator,
  Stat,
  Text,
} from "@chakra-ui/react";
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
  const salePrice = Number(sale.total_price);
  const estimatedSellingPrice = sale.products.reduce(
    (acc, product) => acc + Number(product.estimated_selling_price),
    0
  );
  const priceGap = salePrice - estimatedSellingPrice;
  const priceGapRatio =
    priceGap === 0 ? 0 : (priceGap / estimatedSellingPrice) * 100;

  return (
    <Container maxW="full" py="12" spaceY="8">
      <Heading size="lg">
        <HStack>
          Vente
          <Separator orientation="vertical" height="4" />
          {saleDate}
        </HStack>
      </Heading>

      <HStack id="stats" alignItems="top">
        <Stat.Root>
          <Stat.Label textWrap="nowrap">Prix de revente réel</Stat.Label>
          <Stat.ValueText>
            <FormatNumber value={salePrice} style="currency" currency="EUR" />
          </Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label textWrap="nowrap">Prix de revente estimé</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={estimatedSellingPrice}
              style="currency"
              currency="EUR"
            />
          </Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label textWrap="nowrap">Ecart de prix</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={priceGap}
              style="currency"
              currency="EUR"
              signDisplay="always"
            />
          </Stat.ValueText>
          <Badge
            colorPalette={priceGap >= 0 ? "green" : "red"}
            variant="plain"
            px="0"
          >
            <FormatNumber
              value={priceGapRatio}
              style="percent"
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              signDisplay="always"
            />
          </Badge>
        </Stat.Root>
      </HStack>

      <Box id="products">
        <Heading size="md">Produits ({sale.products.length || 0})</Heading>
        <ProductsTable products={sale.products} />
      </Box>
    </Container>
  );
}
