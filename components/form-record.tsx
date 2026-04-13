"use client";

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
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, StarIcon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

import { plataforms, Series, types } from "@/lib/types";
import { formSchema } from "@/lib/types";
import { useEffect, useState } from "react";

type FormRecordProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshSeries: () => void;
  mode: "create" | "edit";
  serie: Series | null;
};

export default function FormRecord({ open, onOpenChange, serie, refreshSeries, mode }: FormRecordProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Serie",
      platform: "Netflix",
      rating: 1,
      finishDate: undefined,
      couple: false,
      season: "1",
      comments: "",
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (serie && mode === "edit") {
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
    } else {
      reset({
        title: "",
        type: "Serie",
        platform: "Netflix",
        rating: 1,
        finishDate: undefined,
        couple: false,
        season: "1",
        comments: "",
      });
    }
  }, [serie, reset, mode]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    const payload = {
      type: data.type,
      title: data.title,
      season: data.season,
      comments: data.comments,
      platform: data.platform,
      rating: data.rating,
      couple: data.couple,
      finished_at: data.finishDate.toISOString(),
    };

    if (mode === "create") {
      const id = uuidv4();
      const { error } = await supabase.from("series").insert({
        id,
        ...payload,
      });
      if (error) {
        console.error("Error inserting series:", error);
        setLoading(false);
      }
    } else {
      const { error } = await supabase.from("series").update(payload).eq("id", serie?.id);
      if (error) {
        console.error("Error updating series:", error);
        setLoading(false);
      }
    }
    form.reset();
    onOpenChange(false);
    refreshSeries();
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creación de serie</DialogTitle>
          <DialogDescription>Ingresa los detalles de la serie.</DialogDescription>
        </DialogHeader>
        <form
          id="form-series-record"
          onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-title">Titulo de serie</FieldLabel>
                  <Input
                    {...field}
                    id="form-series-record-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Stranger things"
                    autoComplete="off"
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
                  <FieldLabel htmlFor="form-series-record-type">Tipo</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                </Field>
              )}
            />
            <Controller
              name="platform"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-platform">Plataforma de streaming</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                </Field>
              )}
            />

            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-rating">Calificación</FieldLabel>
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="finishDate"
              control={form.control}
              render={({ field: { value, onChange }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-finish-date">Fecha de finalización</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="form-series-record-finish-date"
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="season"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-season">Temporada</FieldLabel>
                  <Input
                    {...field}
                    id="form-series-record-season"
                    aria-invalid={fieldState.invalid}
                    placeholder="3"
                    autoComplete="off"
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
                  <FieldLabel htmlFor="form-series-record-comments">Comentarios</FieldLabel>
                  <Textarea
                    {...field}
                    id="form-series-record-comments"
                    placeholder="Escribe tus comentarios sobre la serie"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          {mode === "edit" && (
            <Button
              type="submit"
              form="form-series-record"
              disabled={loading}>
              {loading ? "Actualizando..." : "Guardar"}
            </Button>
          )}
          {mode === "create" && (
            <Button
              type="submit"
              form="form-series-record"
              disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
