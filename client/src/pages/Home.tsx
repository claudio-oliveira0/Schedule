import { useState, useMemo } from "react";
import { format, isSameDay, startOfDay } from "date-fns";
import { Plus, Calendar as CalendarIcon, Loader2, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentCard } from "@/components/AppointmentCard";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { useAppointments } from "@/hooks/use-appointments";
import { type AppointmentResponse } from "@shared/routes";

export default function Home() {
  const { appointments, isLoading, error } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupedAppointments = useMemo(() => {
    if (!appointments) return [];
    
    const sorted = [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const filtered = selectedDate 
      ? sorted.filter(e => isSameDay(e.startTime, selectedDate))
      : sorted;

    const groups: { date: Date; appointments: AppointmentResponse[] }[] = [];
    filtered.forEach(appointment => {
      const day = startOfDay(appointment.startTime);
      const existing = groups.find(g => isSameDay(g.date, day));
      if (existing) {
        existing.appointments.push(appointment);
      } else {
        groups.push({ date: day, appointments: [appointment] });
      }
    });

    return groups;
  }, [appointments, selectedDate]);

  const handleCreate = () => {
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <Button 
            onClick={handleCreate}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-bold text-lg shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="mr-2 h-6 w-6" /> Book Appointment
          </Button>

          <div className="bg-white rounded-3xl premium-shadow border border-slate-100 p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              className="w-full flex justify-center"
              classNames={{
                head_cell: "text-slate-500 w-9 font-semibold text-xs uppercase tracking-wider",
                cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-slate-100 rounded-full transition-colors",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md shadow-primary/30",
                day_today: "bg-slate-50 text-primary font-bold",
              }}
            />
          </div>
          
          <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-5 text-sm text-pink-900/80">
            <div className="flex gap-3 mb-2 font-semibold text-pink-900">
              <Info className="w-5 h-5 text-pink-500" />
              Beauty Clinic
            </div>
            <p className="leading-relaxed">
              Select a date to see available slots or view your existing bookings. We look forward to seeing you!
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-end mb-8 border-b border-slate-200/60 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "All Appointments"}
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                {appointments?.length || 0} total bookings
              </p>
            </div>
            {selectedDate && (
              <Button 
                variant="ghost" 
                onClick={() => setSelectedDate(undefined)}
                className="text-primary hover:bg-primary/10 rounded-full font-semibold"
              >
                View All
              </Button>
            )}
          </div>

          <div className="space-y-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="font-medium text-lg">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-destructive bg-destructive/5 rounded-3xl border border-destructive/10">
                <p className="font-bold text-lg">Failed to load appointments.</p>
              </div>
            ) : groupedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                  <CalendarIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No appointments</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                  {selectedDate 
                    ? "No appointments scheduled for this day."
                    : "You haven't booked any appointments yet."}
                </p>
                <Button 
                  onClick={handleCreate}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  Book Now
                </Button>
              </div>
            ) : (
              groupedAppointments.map((group) => (
                <div key={group.date.toISOString()} className="relative">
                  <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm py-2 mb-4 flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">
                      {format(group.date, "EEEE, MMMM d")}
                    </h2>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {group.appointments.map(apt => (
                      <AppointmentCard 
                        key={apt.id} 
                        appointment={apt} 
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <AppointmentDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        selectedDate={selectedDate}
      />
    </Layout>
  );
}
