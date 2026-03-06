import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, User, Scissors, Mail } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";

const formSchema = z.object({
  clientName: z.string().min(1, "Name is required"),
  clientEmail: z.string().email("Invalid email"),
  serviceType: z.string().min(1, "Service is required"),
  startTime: z.coerce.date({ required_error: "Start time is required" }),
  endTime: z.coerce.date({ required_error: "End time is required" }),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type FormValues = z.infer<typeof formSchema>;

const formatDateForInput = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
}

export function AppointmentDialog({ open, onOpenChange, selectedDate }: AppointmentDialogProps) {
  const { createAppointment, isCreating } = useAppointments();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      serviceType: "",
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  useEffect(() => {
    if (open) {
      const start = selectedDate || new Date();
      if (selectedDate && selectedDate.getHours() === 0) {
        start.setHours(9, 0, 0, 0);
      }
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      form.reset({
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startTime: start,
        endTime: end,
      });
    }
  }, [open, selectedDate, form]);

  const onSubmit = async (values: FormValues) => {
    await createAppointment(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              Book Appointment
            </DialogTitle>
            <DialogDescription className="text-pink-50">
              Fill in the details for your beauty treatment.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <User className="w-4 h-4 text-pink-500" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" className="bg-slate-50 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-pink-500" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" className="bg-slate-50 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-pink-500" /> Service Type
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Facial, Manicure, Haircut" className="bg-slate-50 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-pink-500" /> Starts
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        className="bg-slate-50 rounded-xl"
                        value={field.value ? formatDateForInput(field.value) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-pink-500" /> Ends
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        className="bg-slate-50 rounded-xl"
                        value={field.value ? formatDateForInput(field.value) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="rounded-xl bg-pink-500 hover:bg-pink-600 text-white px-8 shadow-md shadow-pink-200">
                {isCreating ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
