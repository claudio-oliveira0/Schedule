import { format, differenceInMinutes } from "date-fns";
import { Clock, User, Scissors, Trash2 } from "lucide-react";
import { type AppointmentResponse } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/use-appointments";

interface AppointmentCardProps {
  appointment: AppointmentResponse;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { deleteAppointment, isDeleting } = useAppointments();
  
  const duration = differenceInMinutes(appointment.endTime, appointment.startTime);
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationStr = hours > 0 
    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` 
    : `${mins}m`;

  return (
    <div className="group relative bg-white rounded-2xl p-5 premium-shadow border border-slate-100 hover-lift overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-pink-500 rounded-l-2xl"></div>
      
      <div className="flex justify-between items-start pl-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-2">
              <Scissors className="w-4 h-4 text-pink-500" />
              {appointment.serviceType}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
            <span className="flex items-center gap-1.5 text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md">
              <Clock className="w-4 h-4" />
              {format(appointment.startTime, "h:mm a")} - {format(appointment.endTime, "h:mm a")}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <User className="w-4 h-4" />
              {appointment.clientName}
            </span>
            <span className="text-slate-400">
              ({durationStr})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if(confirm("Cancel this appointment?")) {
                deleteAppointment(appointment.id);
              }
            }}
            disabled={isDeleting}
            className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
