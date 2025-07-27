import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { insertNotificationSettingsSchema, NotificationSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: NotificationSettings;
}

export default function SettingsModal({ open, onOpenChange, settings }: SettingsModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertNotificationSettingsSchema.partial()),
    defaultValues: {
      pushEnabled: settings?.pushEnabled ?? true,
      emailEnabled: settings?.emailEnabled ?? false,
      smsEnabled: settings?.smsEnabled ?? false,
      whatsappEnabled: settings?.whatsappEnabled ?? false,
      reminderDays: settings?.reminderDays ?? 3,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      const response = await apiRequest("PATCH", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Asetukset tallennettu!",
        description: "Muutokset on päivitetty onnistuneesti.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Asetusten tallentaminen epäonnistui.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Asetukset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


            {/* Reminder Timing */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Muistutusaika</h4>
              <FormField
                control={form.control}
                name="reminderDays"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-gray-50 border-0 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 päivä ennen</SelectItem>
                        <SelectItem value="2">2 päivää ennen</SelectItem>
                        <SelectItem value="3">3 päivää ennen</SelectItem>
                        <SelectItem value="5">5 päivää ennen</SelectItem>
                        <SelectItem value="7">7 päivää ennen</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Tallennetaan..." : "Tallenna asetukset"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
