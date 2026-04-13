"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Series } from "@/lib/types";

type ConfirmationDeleteProps = {
  open: boolean;
  serie: Series | null;
  onOpenChange: (open: boolean) => void;
  refreshSeries: () => void;
};

export default function ConfirmationDelete({ open, serie, onOpenChange, refreshSeries }: ConfirmationDeleteProps) {
  const handleDelete = async (id: string) => {
    const supabase = createClient();

    const { error } = await supabase.from("series").delete().eq("id", id);
    if (error) {
      console.error("Error deleting series:", error);
    } else {
      toast.success("Eliminado exitosamente", { position: "top-center" });
      refreshSeries();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar </AlertDialogTitle>
          <AlertDialogDescription>
            Esto eliminará permanentemente. ¿Estás seguro de que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (serie) {
                handleDelete(serie.id);
                refreshSeries();
                onOpenChange(false);
              }
            }}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
