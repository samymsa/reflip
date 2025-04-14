import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { ProductsService, type SaleCreate, SalesService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
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
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

const AddSale = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SaleCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      total_price: 0,
      product_ids: [],
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
    mutationFn: (data: SaleCreate) =>
      SalesService.createSale({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Vente créée avec succès.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const onSubmit: SubmitHandler<SaleCreate> = (data) => {
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
        <Button value="add-sale" my={4}>
          <FaPlus fontSize="16px" />
          Ajouter une vente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter une vente</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Remplissez les détails pour ajouter une nouvelle vente.
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
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddSale;
