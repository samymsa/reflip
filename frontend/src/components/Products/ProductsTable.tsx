import { ProductPublic, ProductsService } from "@/client";
import { ProductActionsMenu } from "@/components/Common/ProductActionsMenu";
import BadgeSelect, { BadgeOption } from "@/components/ui/BadgeSelect";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import { Table, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";

const productStatusItems: BadgeOption[] = [
  { label: "A publier", value: "A publier", colorPalette: "orange" },
  { label: "Publié", value: "Publié", colorPalette: "blue" },
  { label: "Vendu", value: "Vendu", colorPalette: "green" },
];

function ProductsTable({ products }: { products: Array<ProductPublic> }) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  if (products.length === 0) {
    return <Text>Aucun produit n'est lié à cet achat.</Text>;
  }

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="sm">Nom</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Prix de revente estimé</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Statut</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {products.map((product) => (
          <Table.Row key={product.id}>
            <Table.Cell truncate maxW="sm">
              {product.name}
            </Table.Cell>
            <Table.Cell truncate maxW="sm">
              {Number(product.estimated_selling_price).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </Table.Cell>
            <Table.Cell>
              <BadgeSelect
                items={productStatusItems}
                defaultValue={[product.status]}
                variant="solid"
                size="md"
                onValueChange={({ value }) => {
                  ProductsService.updateProduct({
                    id: product.id,
                    requestBody: {
                      status: value[0] as ProductPublic["status"],
                    },
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: ["purchases", product.purchase_id],
                      });
                      showSuccessToast("Statut mis à jour avec succès.");
                    })
                    .catch((error) => {
                      handleError(error);
                    });
                }}
              />
            </Table.Cell>
            <Table.Cell>
              <ProductActionsMenu product={product} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export default ProductsTable;
