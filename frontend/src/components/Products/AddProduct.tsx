import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import { type ProductCreate, ProductsService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
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

type AddProductProps = {
  purchaseId: string;
};

const AddProduct = ({ purchaseId }: AddProductProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Omit<ProductCreate, "purchase_id">>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      estimated_selling_price: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Omit<ProductCreate, "purchase_id">) =>
      ProductsService.createProduct({
        requestBody: { ...data, purchase_id: purchaseId },
      }),
    onSuccess: () => {
      showSuccessToast("Produit créé avec succès.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["purchases", purchaseId] });
    },
  });

  const onSubmit: SubmitHandler<Omit<ProductCreate, "purchase_id">> = (
    data
  ) => {
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
        <Button value="add-product" my={4}>
          <FaPlus fontSize="16px" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Remplissez les détails pour ajouter un nouveau produit.
            </Text>
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
                    required: "Le nom est requis.",
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
                    required: "Le prix estimé est requis.",
                    valueAsNumber: true,
                    min: {
                      value: 0.01,
                      message: "Le prix estimé doit être supérieur à 0",
                    },
                  })}
                  placeholder="Prix estimé"
                  type="number"
                  step="0.01"
                />
              </Field>
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

export default AddProduct;
