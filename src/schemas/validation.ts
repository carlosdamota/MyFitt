import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(100, "La contraseña es demasiado larga.");

export const AgeSchema = z.coerce
  .number()
  .min(13, "Debes tener al menos 13 años.")
  .max(120, "Edad no válida.");

export const HeightSchema = z.coerce
  .number()
  .min(100, "La altura mínima es 100 cm.")
  .max(250, "La altura máxima es 250 cm.");

export const WeightSchema = z.coerce
  .number()
  .min(30, "El peso mínimo es 30 kg.")
  .max(300, "El peso máximo es 300 kg.");

export const PersonalDataSchema = z.object({
  age: AgeSchema,
  height: HeightSchema,
  weight: WeightSchema,
});
