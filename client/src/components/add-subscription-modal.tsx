import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSubscriptionSchema, InsertSubscription, Subscription } from "@shared/schema";
import { POPULAR_SERVICES, PopularService } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubscription?: Subscription | null;
}

export default function AddSubscriptionModal({ open, onOpenChange, editingSubscription }: AddSubscriptionModalProps) {
  const [selectedService, setSelectedService] = useState<PopularService | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(insertSubscriptionSchema),
    defaultValues: {
      name: editingSubscription?.name || "",
      plan: editingSubscription?.plan || "",
      price: editingSubscription?.price || 0,
      currency: editingSubscription?.currency || "EUR",
      startDate: editingSubscription?.startDate ? new Date(editingSubscription.startDate) : new Date(),
      cancelByDate: editingSubscription?.cancelByDate ? new Date(editingSubscription.cancelByDate) : undefined,
      cancelUrl: editingSubscription?.cancelUrl || "",
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const method = editingSubscription ? "PATCH" : "POST";
      const url = editingSubscription ? `/api/subscriptions/${editingSubscription.id}` : "/api/subscriptions";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: editingSubscription ? "Tilaus päivitetty!" : "Tilaus lisätty!",
        description: editingSubscription ? "Tilaus on päivitetty onnistuneesti." : "Uusi tilaus on lisätty seurattavaksi.",
      });
      onOpenChange(false);
      form.reset();
      setSelectedService(null);
      setIsCustom(false);
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: editingSubscription ? "Tilauksen päivittäminen epäonnistui." : "Tilauksen lisääminen epäonnistui.",
        variant: "destructive",
      });
    },
  });

  const handleServiceSelect = (service: PopularService) => {
    setSelectedService(service);
    setIsCustom(false);
    form.setValue("name", service.name);
    // Remove trialDays since we're using cancelByDate now
    form.setValue("cancelUrl", service.cancelUrl || "");
    if (service.averagePrice) {
      form.setValue("price", service.averagePrice);
    }
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setSelectedService(null);
    form.reset();
    form.setValue("startDate", new Date());
  };

  // Update form when editingSubscription changes
  useEffect(() => {
    if (editingSubscription) {
      form.reset({
        name: editingSubscription.name,
        plan: editingSubscription.plan || "",
        price: editingSubscription.price,
        currency: editingSubscription.currency || "EUR",
        startDate: new Date(editingSubscription.startDate),
        cancelByDate: editingSubscription.cancelByDate ? new Date(editingSubscription.cancelByDate) : undefined,
        cancelUrl: editingSubscription.cancelUrl || "",
      });
      setIsCustom(true);
      setSelectedService(null);
    } else {
      form.reset({
        name: "",
        plan: "",
        price: 0,
        currency: "EUR",
        startDate: new Date(),
        cancelByDate: undefined,
        cancelUrl: "",
      });
      setSelectedService(null);
      setIsCustom(false);
    }
  }, [editingSubscription, form]);

  const onSubmit = (data: InsertSubscription) => {
    saveSubscriptionMutation.mutate(data);
  };

  const getServiceLogo = (service: PopularService) => {
    // Define logo mappings for each service
    const logoMap: { [key: string]: string } = {
      "Netflix": "N",
      "Spotify": "S", 
      "Adobe Creative Cloud": "Ai",
      "Disney+": "D+",
      "HBO Max": "H",
      "YouTube Premium": "YT",
      "Amazon Prime": "P",
      "Microsoft 365": "M",
      "Dropbox": "D",
      "Canva Pro": "C",
      "Figma": "F",
      "Notion": "N",
      "GitHub Pro": "G",
      "Slack": "S",
      "Zoom Pro": "Z"
    };
    
    const logoText = logoMap[service.name] || service.name.charAt(0).toUpperCase();
    return <span className="text-white font-bold text-sm">{logoText}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {editingSubscription ? "Muokkaa tilausta" : "Lisää tilaus"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Popular Services */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Suositut palvelut</h4>
            <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl p-3">
              <div className="grid grid-cols-3 gap-3">
                {POPULAR_SERVICES.map((service) => (
                  <button
                    key={service.name}
                    onClick={() => handleServiceSelect(service)}
                    className={`flex flex-col items-center p-2 border rounded-lg transition-colors ${
                      selectedService?.name === service.name
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: 
                          service.name === "Netflix" ? "#dc2626" :
                          service.name === "Spotify" ? "#22c55e" :
                          service.name === "Adobe Creative Cloud" ? "#dc2626" :
                          service.name === "Disney+" ? "#2563eb" :
                          service.name === "HBO Max" ? "#9333ea" :
                          service.name === "YouTube Premium" ? "#ef4444" :
                          service.name === "Microsoft 365" ? "#2563eb" :
                          service.name === "Slack" ? "#9333ea" :
                          service.name === "Zoom Pro" ? "#2563eb" :
                          service.name === "Trello" ? "#3b82f6" :
                          service.name === "Evernote" ? "#1d4ed8" :
                          service.name === "LinkedIn Premium" ? "#0077b5" :
                          service.name === "Canva Pro" ? "#8b5cf6" :
                          service.name === "Grammarly" ? "#15803d" :
                          service.name === "Dropbox Plus" ? "#3b82f6" :
                          service.name === "GitHub Pro" ? "#1f2937" :
                          service.name === "Figma Pro" ? "#374151" :
                          "#4b5563"
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {service.logoText || service.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{service.name}</span>
                    <span className="text-xs text-gray-500">{service.averagePrice?.toFixed(2)}€</span>
                  </button>
                ))}
                
                <button
                  onClick={handleCustomSelect}
                  className={`flex flex-col items-center p-2 border rounded-lg transition-colors ${
                    isCustom
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center mb-1">
                    <Plus className="text-white w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium">Muu</span>
                  <span className="text-xs text-gray-500">Mukautettu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          {(selectedService || isCustom) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palvelun nimi</FormLabel>
                        <FormControl>
                          <Input placeholder="Esim. Notion Pro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kuukausihinta (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="9.99"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aloituspäivä</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancelByDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peruuta viimeistään</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cancelUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peruutuslinkki (valinnainen)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Peruuta
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-white"
                    disabled={saveSubscriptionMutation.isPending}
                  >
                    {saveSubscriptionMutation.isPending 
                      ? (editingSubscription ? "Päivitetään..." : "Lisätään...") 
                      : (editingSubscription ? "Päivitä tilaus" : "Lisää tilaus")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
