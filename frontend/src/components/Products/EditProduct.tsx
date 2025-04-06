import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaExchangeAlt } from "react-icons/fa";

import { type ApiError, type ProductPublic, ProductsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
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

interface EditProductProps {
  product: ProductPublic;
}

interface ProductUpdateForm {
  name: string;
  estimated_selling_price: number;
}

const EditProduct = ({ product }: EditProductProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...product,
      estimated_selling_price: parseFloat(product.estimated_selling_price),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductUpdateForm) =>
      ProductsService.updateProduct({
        id: product.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Produit mis à jour avec succès.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["purchases", product.purchase_id],
      });
    },
  });

  const onSubmit: SubmitHandler<ProductUpdateForm> = async (data) => {
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
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Modifier le produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Mettez à jour les détails du produit ci-dessous.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Nom"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Le nom est requis",
                  })}
                  placeholder="Nom"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.estimated_selling_price}
                errorText={errors.estimated_selling_price?.message}
                label="Prix de vente estimé"
              >
                <Input
                  id="estimated_selling_price"
                  {...register("estimated_selling_price", {
                    required: "Le prix estimé est requis",
                    valueAsNumber: true,
                    min: {
                      value: 0.01,
                      message: "Le prix estimé doit être supérieur à 0",
                    },
                  })}
                  placeholder="Prix estimé de vente"
                  type="number"
                  step="0.01"
                />
              </Field>
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

export default EditProduct;
