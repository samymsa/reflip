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

import {
  type ApiError,
  ProductsService,
  type PurchasePublic,
  PurchasesService,
  PurchaseUpdate,
} from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import { LuPencil } from "react-icons/lu";
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

interface EditPurchaseProps extends ButtonProps {
  purchase: PurchasePublic;
}

const EditPurchase = ({ purchase, ...props }: EditPurchaseProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm<PurchaseUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...purchase,
      product_ids: purchase.products?.map((product) => product.id) ?? [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PurchaseUpdate) =>
      PurchasesService.updatePurchase({
        id: purchase.id,
        requestBody: data,
      }),
    onSuccess: (_data: PurchasePublic, variables: PurchaseUpdate) => {
      showSuccessToast("Achat mis à jour avec succès.");
      reset(variables);
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
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

  const onSubmit: SubmitHandler<PurchaseUpdate> = async (data) => {
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
          <LuPencil />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifier l'achat</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Mettez à jour les détails de l'achat ci-dessous.</Text>
            <VStack gap={4}>
              <Field
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Nom"
              >
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nom"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.price}
                errorText={errors.price?.message}
                label="Prix"
              >
                <Input
                  id="price"
                  {...register("price", {
                    required: "Prix est requis",
                    valueAsNumber: true,
                    min: {
                      value: 0.01,
                      message: "Le prix doit être supérieur à 0",
                    },
                  })}
                  placeholder="Prix"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field
                required
                invalid={!!errors.date}
                errorText={errors.date?.message}
                label="Date"
              >
                <Input
                  id="date"
                  {...register("date", {
                    required: "Date est requise",
                  })}
                  placeholder="Date"
                  type="date"
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
              <Button variant="solid" type="submit" loading={isSubmitting}>
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

export default EditPurchase;
