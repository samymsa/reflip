import {
  Button,
  ButtonGroup,
  ButtonProps,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaExchangeAlt } from "react-icons/fa";

import {
  type ApiError,
  ProductsService,
  type SalePublic,
  SalesService,
  SaleUpdate,
} from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import Combobox from "../ui/combobox";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface EditSaleProps extends ButtonProps {
  sale: SalePublic;
}

const EditSale = ({ sale, ...props }: EditSaleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SaleUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...sale,
      product_ids: sale.products?.map((product) => product.id) ?? [],
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductsService.readProducts(),
    select: ({ data }) =>
      data.map((product) => ({
        label: product.name,
        value: product.id,
      })),
  });

  const mutation = useMutation({
    mutationFn: (data: SaleUpdate) =>
      SalesService.updateSale({
        id: sale.id,
        requestBody: data,
      }),
    onSuccess: (_data: SalePublic, variables: SaleUpdate) => {
      showSuccessToast("Vente mise à jour avec succès.");
      reset(variables);
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const onSubmit: SubmitHandler<SaleUpdate> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button {...props}>
          <FaExchangeAlt fontSize="16px" />
          Modifier la vente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifier la vente</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Mettez à jour les détails de la vente ci-dessous.
            </Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.date}
                errorText={errors.date?.message}
                label="Date"
              >
                <Input
                  id="date"
                  {...register("date", {
                    required: "La date est requise.",
                  })}
                  placeholder="Date"
                  type="date"
                />
              </Field>

              <Field
                required
                invalid={!!errors.total_price}
                errorText={errors.total_price?.message}
                label="Prix total"
              >
                <Input
                  id="total_price"
                  {...register("total_price", {
                    required: "Le prix total est requis.",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Le prix doit être supérieur ou égal à 0.",
                    },
                  })}
                  placeholder="Prix total"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Combobox
                items={products ?? []}
                control={control}
                name="product_ids"
                label="Produits"
                selectPlaceholder="Sélectionnez un produit"
                searchPlaceholder="Rechercher des produits"
                multiple
              />
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </DialogActionTrigger>
              <Button
                variant="solid"
                type="submit"
                disabled={!isValid}
                loading={isSubmitting}
              >
                Enregistrer
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditSale;
