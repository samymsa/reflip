import { ProductPublic } from "@/client";
import { ProductActionsMenu } from "@/components/Common/ProductActionsMenu";
import { Table, Text } from "@chakra-ui/react";

function ProductsTable({ products }: { products: Array<ProductPublic> }) {
  if (products.length === 0) {
    return <Text>Aucun produit n'est lié à cet achat.</Text>;
  }

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="sm">Nom</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Prix de revente estimé</Table.ColumnHeader>
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
              <ProductActionsMenu product={product} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export default ProductsTable;
