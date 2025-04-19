import { SalesService, SaleStatus } from "@/client";
import ProductsTable from "@/components/Products/ProductsTable";
import BadgeSelect, { BadgeOption } from "@/components/ui/BadgeSelect";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/sales/$saleId")({
  component: Sale,
});

function Sale() {
  const queryClient = useQueryClient();
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

  const saleStatusItems: BadgeOption[] = [
    { label: "A préparer", value: "A préparer", colorPalette: "orange" },
    { label: "Expédiée", value: "Expédiée", colorPalette: "blue" },
    { label: "Terminée", value: "Terminée", colorPalette: "green" },
  ];

  return (
    <Container maxW="full" py="12" spaceY="8">
      <Heading size="lg">
        <HStack>
          Vente
          <Separator orientation="vertical" height="4" />
          {saleDate}
          <Separator orientation="vertical" height="4" />
          <BadgeSelect
            items={saleStatusItems}
            defaultValue={[sale.status]}
            variant="solid"
            size="md"
            onValueChange={({ value }) => {
              SalesService.updateSale({
                id: sale.id,
                requestBody: { status: value[0] as SaleStatus },
              }).then(() => {
                queryClient.invalidateQueries({ queryKey: ["sales", saleId] });
              });
            }}
          />
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
