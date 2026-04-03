"use client";

import { useEffect, useState } from "react";

import { Series } from "@/lib/types";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import * as z from "zod";
import { plataforms, types } from "@/lib/types";
import { formSchema } from "@/lib/types";

type FormDetailsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serie: Series | null;
  refreshSeries: () => void;
};

export default function FormDetails({ open, onOpenChange, serie, refreshSeries }: FormDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Serie",
      platform: "Netflix",
      rating: 1,
      finishDate: undefined,
      season: 1,
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
          finished_at: data.finishDate.toISOString(),
        })
        .eq("id", serie.id);

      if (error) {
        console.error("Error inserting series:", error);
      } else {
        console.log("Serie editada con exito");
        form.reset();
        onOpenChange(false);
        refreshSeries();
      }
    }
  }

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
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
                      onValueChange={field.onChange}
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
                            value={String(field.value)}
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
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}>
              Editar datos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
