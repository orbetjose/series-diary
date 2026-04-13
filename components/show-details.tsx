import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Series } from "@/lib/types";
import { Heart, StarIcon } from "lucide-react";

type ShowDetailsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serie: Series | null;
};

export default function ShowDetails({ open, onOpenChange, serie }: ShowDetailsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogDescription className="hidden">Detalles de la serie seleccionada.</DialogDescription>
          <DialogTitle>
            {serie?.title} - {serie?.type}
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-2 pb-2">
            <p>Calificacion:</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, index) => index + 1).map((index) => (
                <div
                  className="relative"
                  key={index}>
                  <StarIcon
                    fill={serie?.rating && serie.rating > index ? "yellow" : "none"}
                    color={serie?.rating && serie.rating > index ? "yellow" : "gray"}
                  />
                </div>
              ))}
            </div>
          </div>
          {serie?.finished_at ? (
            <p>Fecha de finalizacion: {formatDate(serie.finished_at)}</p>
          ) : (
            <p>Fecha de finalizacion no disponible</p>
          )}
          <div className="pt-2">
            <p>Temporada {serie?.season}</p>
          </div>
          <div className="pt-2">
            {serie?.comments ? <p>Comentarios: {serie.comments}</p> : <p>No hay comentarios</p>}
          </div>
          <div className="pt-2">
            {serie?.couple && (
              <Heart
                fill="#FF46A2"
                color="#FF46A2"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
