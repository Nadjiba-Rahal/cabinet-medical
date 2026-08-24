export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Appointment = {
  id: string;
  serviceId: string;
  fullName: string;
  phone: string;
  email: string;
  message: string | null;
  startAt: string; // ISO
  endAt: string; // ISO
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentWithService = Appointment & {
  serviceName: string;
  durationMinutes: number;
};
