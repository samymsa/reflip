import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { PurchasesService } from "@/client";
import { PurchaseActionsMenu } from "@/components/Common/PurchaseActionsMenu";
import PendingPurchases from "@/components/Pending/PendingPurchases";
import AddPurchase from "@/components/Purchases/AddPurchase";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";

const purchasesSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getPurchasesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      PurchasesService.readPurchases({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["purchases", { page }],
  };
}

export const Route = createFileRoute("/_layout/purchases")({
  component: Purchases,
  validateSearch: (search) => purchasesSearchSchema.parse(search),
});

function PurchasesTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getPurchasesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { page: number }) => ({ ...prev, page }),
    });

  const purchases = data?.data.slice(0, PER_PAGE) ?? [];
  const count = data?.count ?? 0;

  if (isLoading) {
    return <PendingPurchases />;
  }

  if (purchases.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Vous n'avez pas encore d'achats</EmptyState.Title>
            <EmptyState.Description>
              Ajoutez vos achats pour les gérer facilement.
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Date</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Prix</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Nom</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {purchases?.map((purchase) => (
            <Table.Row key={purchase.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {purchase.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {purchase.date}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                ${purchase.price}
              </Table.Cell>
              <Table.Cell
                color={!purchase.name ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {purchase.name || "N/A"}
              </Table.Cell>
              <Table.Cell>
                <PurchaseActionsMenu purchase={purchase} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
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

function Purchases() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Achats
      </Heading>
      <AddPurchase />
      <PurchasesTable />
    </Container>
  );
}
