import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { SalesService, SaleStatus } from "@/client";
import { SaleActionsMenu } from "@/components/Common/SaleActionsMenu";
import PendingSales from "@/components/Pending/PendingSales";
import AddSale from "@/components/Sales/AddSale";
import BadgeSelect, { BadgeOption } from "@/components/ui/BadgeSelect";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const salesSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getSalesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      SalesService.readSales({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["sales", { page }],
  };
}

export const Route = createFileRoute("/_layout/sales/")({
  component: Sales,
  validateSearch: (search) => salesSearchSchema.parse(search),
});

const saleStatusItems: BadgeOption[] = [
  { label: "A préparer", value: "A préparer", colorPalette: "orange" },
  { label: "Expédiée", value: "Expédiée", colorPalette: "blue" },
  { label: "Terminée", value: "Terminée", colorPalette: "green" },
];

function SalesTable() {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getSalesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { page: number }) => ({ ...prev, page }),
    });

  const sales = data?.data.slice(0, PER_PAGE) ?? [];
  const count = data?.count ?? 0;

  if (isLoading) {
    return <PendingSales />;
  }

  if (sales.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>
              Vous n'avez pas encore de ventes
            </EmptyState.Title>
            <EmptyState.Description>
              Ajoutez vos ventes pour les gérer facilement.
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
            <Table.ColumnHeader w="sm">Date</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Prix</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Produits</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Statut</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sales.map((sale) => (
            <Table.Row key={sale.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {new Date(sale.date).toLocaleDateString("fr-FR")}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {Number(sale.total_price).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {sale.products?.length ?? 0}
              </Table.Cell>
              <Table.Cell>
                <BadgeSelect
                  items={saleStatusItems}
                  defaultValue={[sale.status]}
                  variant="solid"
                  size="md"
                  onValueChange={({ value }) => {
                    SalesService.updateSale({
                      id: sale.id,
                      requestBody: { status: value[0] as SaleStatus },
                    })
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ["sales", { page }],
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
                <SaleActionsMenu sale={sale} />
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

function Sales() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Ventes
      </Heading>
      <AddSale />
      <SalesTable />
    </Container>
  );
}
