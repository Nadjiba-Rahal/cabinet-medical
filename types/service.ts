export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number | null;
  color: string | null;
  active: boolean;
  order: number;
};
