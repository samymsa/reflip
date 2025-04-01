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

import { type PurchaseCreate, PurchasesService } from "@/client";
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

const AddPurchase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PurchaseCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      price: 0,
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PurchaseCreate) =>
      PurchasesService.createPurchase({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Achat créé avec succès.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  const onSubmit: SubmitHandler<PurchaseCreate> = (data) => {
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
        <Button value="add-purchase" my={4}>
          <FaPlus fontSize="16px" />
          Ajouter un achat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter un achat</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Remplissez les détails pour ajouter un nouvel achat.
            </Text>
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
                    required: "Le prix est requis.",
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
                label="Date d'achat"
              >
                <Input
                  id="date"
                  {...register("date", {
                    required: "La date d'achat est requise.",
                  })}
                  placeholder="Date d'achat"
                  type="date"
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

export default AddPurchase;
