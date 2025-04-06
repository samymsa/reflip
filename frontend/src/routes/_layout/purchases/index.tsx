import {
  Card,
  Container,
  EmptyState,
  Flex,
  Heading,
  SimpleGrid,
  Text,
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
import ViewPurchase from "@/components/Purchases/ViewPurchase";
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

export const Route = createFileRoute("/_layout/purchases/")({
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
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {purchases?.map((purchase) => {
          const purchaseDate = new Date(purchase.date).toLocaleDateString(
            "fr-FR"
          );
          const purchasePrice = Number(purchase.price).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          });

          return (
            <Card.Root key={purchase.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Card.Header gap={0}>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Card.Title>
                    {purchase.name || `Achat du ${purchaseDate}`}
                  </Card.Title>
                  <PurchaseActionsMenu purchase={purchase} />
                </Flex>
                <Card.Description>{purchaseDate}</Card.Description>
              </Card.Header>
              <Card.Footer mt={4} justifyContent={"space-between"}>
                <Text fontSize="lg" fontWeight="bold">
                  {purchasePrice}
                </Text>
                <ViewPurchase purchase={purchase} />
              </Card.Footer>
            </Card.Root>
          );
        })}
      </SimpleGrid>
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
