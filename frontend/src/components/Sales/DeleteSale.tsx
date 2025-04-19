import { Button, DialogTitle, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";

import { SalesService } from "@/client";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import useCustomToast from "@/hooks/useCustomToast";
import { useNavigate } from "@tanstack/react-router";

const DeleteSale = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteSale = async (id: string) => {
    await SalesService.deleteSale({ id: id });
  };

  const mutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      showSuccessToast("La vente a été supprimée avec succès");
      setIsOpen(false);
      navigate({ to: "/sales/", search: { page: 1 } });
    },
    onError: () => {
      showErrorToast(
        "Une erreur s'est produite lors de la suppression de la vente"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      role="alertdialog"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 fontSize="16px" />
          Supprimer la vente
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Supprimer la vente</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Cette vente sera définitivement supprimée. Êtes-vous sûr ? Vous ne
              pourrez pas annuler cette action.
            </Text>
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
              colorPalette="red"
              type="submit"
              loading={isSubmitting}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteSale;
