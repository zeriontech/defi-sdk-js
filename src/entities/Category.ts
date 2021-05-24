type CategoryDisplayType = "short" | "detailed";

export interface Category {
  id: string;
  title: string;
  tagline: string;
  order_by: string | null;
  display_type: CategoryDisplayType;
}
