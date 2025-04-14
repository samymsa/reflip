"use client";

import { toaster } from "@/components/ui/toaster";

const useCustomToast = () => {
  const showSuccessToast = (description: string) => {
    toaster.create({
      title: "Succès !",
      description,
      type: "success",
    });
  };

  const showErrorToast = (description: string) => {
    toaster.create({
      title: "Une erreur est survenue !",
      description,
      type: "error",
    });
  };

  return { showSuccessToast, showErrorToast };
};

export default useCustomToast;
