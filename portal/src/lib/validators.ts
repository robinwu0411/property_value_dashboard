import { z } from "zod";

const num = z.number({ invalid_type_error: "Please enter a valid number" });

export const propertyFeaturesSchema = z.object({
  square_footage: num
    .int()
    .min(100, "Must be at least 100")
    .max(50000, "Must be at most 50,000"),
  bedrooms: num
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(20, "Must be at most 20"),
  bathrooms: num
    .min(0.5, "Must be at least 0.5")
    .max(10, "Must be at most 10")
    .step(0.5, "Must be a multiple of 0.5"),
  year_built: num
    .int()
    .min(1801, "Must be after 1800")
    .max(2030, "Must be at most 2030"),
  lot_size: num
    .int()
    .min(100, "Must be at least 100")
    .max(50000, "Must be at most 50,000"),
  distance_to_city_center: num
    .min(0.1, "Must be at least 0.1")
    .max(100, "Must be at most 100"),
  school_rating: num
    .min(1, "Must be at least 1")
    .max(10, "Must be at most 10"),
});

export type PropertyFeatures = z.infer<typeof propertyFeaturesSchema>;
