"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { plataforms, types } from "@/lib/types";
import { formSchema } from "@/lib/types";
import { Series } from "@/lib/types";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Heart, StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { is } from "date-fns/locale";

type FormDetailsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serie: Series | null;
  refreshSeries: () => void;
};

export default function FormDetails({ open, onOpenChange, serie, refreshSeries }: FormDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Serie",
      platform: "Netflix",
      rating: 1,
      couple: false,
      finishDate: undefined,
      season: "1",
      comments: "",
    },
  });
  const { reset } = form;
  useEffect(() => {
    if (serie) {
      reset({
        title: serie.title,
        type: serie.type,
        platform: serie.platform,
        rating: serie.rating,
        couple: serie.couple,
        finishDate: serie.finished_at ? new Date(serie.finished_at) : undefined,
        season: serie.season,
        comments: serie.comments,
      });
    }
  }, [serie, reset]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const supabase = createClient();

    if (serie) {
      const { error } = await supabase
        .from("series")
        .update({
          type: data.type,
          title: data.title,
          season: data.season,
          comments: data.comments,
          platform: data.platform,
          rating: data.rating,
          couple: data.couple,
          finished_at: data.finishDate.toISOString(),
        })
        .eq("id", serie.id);

      if (error) {
        console.error("Error updating series:", error);
      } else {
        form.reset();
        toast.success("Datos guardados exitosamente", { position: "top-center" });
        onOpenChange(false);
        refreshSeries();
      }
    }
  }

  const handleDelete = async () => {
    const supabase = createClient();
    if (serie) {
      const { error } = await supabase.from("series").delete().eq("id", serie.id);
      if (error) {
        console.error("Error deleting series:", error);
      } else {
        form.reset();
        onOpenChange(false);
        toast.success("Serie eliminada exitosamente", { position: "top-center" });
        refreshSeries();
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la serie</DialogTitle>
            <DialogDescription>Revisa los detalles de tu serie</DialogDescription>
          </DialogHeader>
          <form
            id="form-series-details"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-title">Titulo de serie</FieldLabel>
                    <Input
                      {...field}
                      id="form-series-details-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Stranger things"
                      autoComplete="off"
                      disabled={!isEditing}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-type">Tipo</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {isEditing ? (
                      <Select
                        name={field.name}
                        value={field.value || "Serie"}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-45"
                          aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {types.map((type) => (
                              <SelectItem
                                key={type}
                                value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...field}
                        disabled={!isEditing}
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="platform"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-platform">Plataforma de streaming</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {isEditing ? (
                      <Select
                        name={field.name}
                        value={field.value || "Netflix"}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-45"
                          aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Seleccionar plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {plataforms.map((platform) => (
                              <SelectItem
                                key={platform}
                                value={platform}>
                                {platform}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...field}
                        disabled={!isEditing}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="rating"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-rating">Calificación</FieldLabel>
                    {isEditing ? (
                      <RadioGroup
                        value={field.value ? String(field.value) : "1"}
                        onValueChange={(value) => field.onChange(Number(value))}
                        className="flex">
                        {Array.from({ length: 5 }, (_, index) => index + 1).map((rate, index) => (
                          <div
                            className="relative"
                            key={index}>
                            <StarIcon
                              fill={field.value > index ? "yellow" : "none"}
                              color={field.value > index ? "yellow" : "gray"}
                            />
                            <RadioGroupItem
                              value={String(rate)}
                              id={`option-${rate}`}
                              className="absolute top-1/2 left-1/2 translate-middle opacity-0"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="flex gap-3">
                        {Array.from({ length: 5 }, (_, index) => index + 1).map((rate, index) => (
                          <div
                            className="relative"
                            key={index}>
                            <StarIcon
                              fill={field.value > index ? "yellow" : "none"}
                              color={field.value > index ? "yellow" : "gray"}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="couple"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="block space-y-2 relative"
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-series-record-couple"
                      className="">
                      Pareja
                    </FieldLabel>
                    {isEditing ? (
                      <div>
                        <Checkbox
                          id="form-series-record-couple"
                          className="absolute left-1 top-7 opacity-0"
                          checked={field.value ?? false}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                        {field.value ? (
                          <Heart
                            fill="#FF46A2"
                            color="#FF46A2"
                          />
                        ) : (
                          <Heart />
                        )}
                      </div>
                    ) : (
                      <div>
                        {field.value ? (
                          <Heart
                            fill="#FF46A2"
                            color="#FF46A2"
                          />
                        ) : (
                          <Heart />
                        )}
                      </div>
                    )}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="finishDate"
                control={form.control}
                render={({ field: { value, onChange }, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-finish-date">Fecha de finalización</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="form-series-details-finish-date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !value && "text-muted-foreground",
                            )}
                            aria-invalid={fieldState.invalid}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? format(value, "PPP") : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start">
                          <Calendar
                            mode="single"
                            selected={value}
                            onSelect={onChange}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        {...(value && { value: format(value, "PPP") })}
                        disabled={!isEditing}
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="season"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-season">Temporada</FieldLabel>
                    <Input
                      {...field}
                      id="form-series-details-season"
                      aria-invalid={fieldState.invalid}
                      placeholder="3"
                      autoComplete="off"
                      disabled={!isEditing}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="comments"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-series-details-comments">Comentarios</FieldLabel>
                    <Textarea
                      {...field}
                      id="form-series-details-comments"
                      placeholder="Escribe tus comentarios sobre la serie"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      disabled={!isEditing}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline">
                Cancel
              </Button>
            </DialogClose>
            {isEditing ? (
              <Button
                type="submit"
                form="form-series-details">
                Guardar
              </Button>
            ) : (
              <div className="flex flex-col-reverse gap-2 md:flex-row">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteModal(true);
                  }}>
                  Eliminar serie
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true);
                  }}>
                  Editar datos
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleteModal && (
        <AlertDialog
          open={deleteModal}
          onOpenChange={setDeleteModal}>
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
                onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
