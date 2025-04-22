import { PurchasesService, PurchaseStatus } from "@/client";
import ProductsTable from "@/components/Products/ProductsTable";
import DeletePurchase from "@/components/Purchases/DeletePurchase";
import EditPurchase from "@/components/Purchases/EditPurchase";
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

export const Route = createFileRoute("/_layout/purchases/$purchaseId")({
  component: Purchase,
});

function Purchase() {
  const queryClient = useQueryClient();
  const purchaseId = Route.useParams().purchaseId;

  const { data, isLoading } = useQuery({
    queryFn: () => PurchasesService.readPurchase({ id: purchaseId }),
    queryKey: ["purchases", purchaseId],
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const purchase = data!;
  const purchaseDate = new Date(purchase.date).toLocaleDateString();
  const purchasePrice = Number(purchase.price);
  const estimatedSellingPrice = purchase.products.reduce(
    (acc, product) => acc + Number(product.estimated_selling_price),
    0
  );
  const estimatedMargin = estimatedSellingPrice - purchasePrice;
  const estimatedMarginRatio = estimatedMargin / purchasePrice;

  const purchaseStatusItems: BadgeOption[] = [
    { label: "En cours", value: "En cours", colorPalette: "blue" },
    { label: "Réceptionné", value: "Réceptionné", colorPalette: "orange" },
    { label: "Terminé", value: "Terminé", colorPalette: "green" },
  ];

  return (
    <Container maxW="full" py="12" spaceY="8">
      <Heading size="lg">
        <HStack>
          <Text textWrap="nowrap">{purchase.name || `Achat`}</Text>
          <Separator orientation="vertical" height="4" />
          {purchaseDate}
          <Separator orientation="vertical" height="4" />
          <BadgeSelect
            items={purchaseStatusItems}
            defaultValue={[purchase.status]}
            variant="solid"
            size="md"
            onValueChange={({ value }) => {
              PurchasesService.updatePurchase({
                id: purchase.id,
                requestBody: { status: value[0] as PurchaseStatus },
              }).then(() => {
                queryClient.invalidateQueries({
                  queryKey: ["purchases", purchaseId],
                });
              });
            }}
          />
        </HStack>
      </Heading>

      <HStack id="stats" alignItems="top">
        <Stat.Root>
          <Stat.Label textWrap="nowrap">Prix d'achat</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={purchasePrice}
              style="currency"
              currency="EUR"
            />
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
          <Stat.Label textWrap="nowrap">Marge estimée</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={estimatedMargin}
              style="currency"
              currency="EUR"
              signDisplay="always"
            />
          </Stat.ValueText>
          <Badge
            colorPalette={estimatedMargin >= 0 ? "green" : "red"}
            variant="plain"
            px="0"
          >
            <FormatNumber
              value={estimatedMarginRatio}
              style="percent"
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              signDisplay="always"
            />
          </Badge>
        </Stat.Root>
      </HStack>

      <HStack id="actions">
        <EditPurchase purchase={purchase} />
        <DeletePurchase id={purchase.id} />
      </HStack>

      <Box id="products" spaceY="2">
        <Heading size="md">Produits ({purchase.products.length || 0})</Heading>
        <ProductsTable products={purchase.products} />
      </Box>
    </Container>
  );
}
