import { Container, EmptyState, Flex, Heading, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { ProductsService } from "@/client";
import PendingProducts from "@/components/Pending/PendingProducts";
import AddProduct from "@/components/Products/AddProduct";
import ProductsTableComponent from "@/components/Products/ProductsTable";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";

const productsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getProductsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ProductsService.readProducts({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["products", { page }],
  };
}

export const Route = createFileRoute("/_layout/products/")({
  component: Products,
  validateSearch: (search) => productsSearchSchema.parse(search),
});

function ProductsTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getProductsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const products = data?.data.slice(0, PER_PAGE) ?? [];
  const count = data?.count ?? 0;

  if (isLoading) {
    return <PendingProducts />;
  }

  if (products.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No products available</EmptyState.Title>
            <EmptyState.Description>
              Add a new product to get started.
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <ProductsTableComponent products={products} />
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function Products() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Produits
      </Heading>
      <AddProduct />
      <ProductsTable />
    </Container>
  );
}
