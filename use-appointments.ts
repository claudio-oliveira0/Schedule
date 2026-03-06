import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AppointmentInput, type AppointmentResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Helper to ensure dates are properly instantiated
const parseDates = (appointment: any): AppointmentResponse => ({
  ...appointment,
  startTime: new Date(appointment.startTime),
  endTime: new Date(appointment.endTime),
});

export function useAppointments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const appointmentsQuery = useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetch(api.appointments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const json = await res.json();
      const parsed = api.appointments.list.responses[200].parse(json);
      return parsed.map(parseDates);
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentInput) => {
      const validated = api.appointments.create.input.parse(data);
      const res = await fetch(api.appointments.create.path, {
        method: api.appointments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.appointments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to book appointment");
      }
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      toast({ title: "Success", description: "Appointment booked successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.appointments.delete.path, { id });
      const res = await fetch(url, { 
        method: api.appointments.delete.method, 
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Appointment not found");
        throw new Error("Failed to delete appointment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      toast({ title: "Deleted", description: "Appointment has been removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  return {
    appointments: appointmentsQuery.data ?? [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment: createAppointmentMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    isDeleting: deleteAppointmentMutation.isPending,
  };
}
