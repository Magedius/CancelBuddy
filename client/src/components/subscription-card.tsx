import { useState } from "react";
import { ExternalLink, MoreHorizontal, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Subscription } from "@shared/schema";


interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/subscriptions/${subscription.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Tilaus poistettu!",
        description: "Tilaus on poistettu onnistuneesti.",
      });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Tilauksen poistaminen epäonnistui.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Haluatko varmasti poistaa tämän tilauksen?")) {
      deleteSubscriptionMutation.mutate();
    }
  };
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "urgent":
        return {
          label: "KIIRE",
          className: "status-urgent",
          borderColor: "border-red-500",
        };
      case "warning":
        return {
          label: "MUISTA PIAN",
          className: "status-warning",
          borderColor: "border-yellow-500",
        };
      case "safe":
        return {
          label: "TURVASSA",
          className: "status-safe",
          borderColor: "border-green-500",
        };
      default:
        return {
          label: "TUNTEMATON",
          className: "bg-gray-500",
          borderColor: "border-gray-500",
        };
    }
  };

  const getDaysUntilEnd = () => {
    if (!subscription.cancelByDate) return "Ei määritelty";
    
    const now = new Date();
    const endDate = new Date(subscription.cancelByDate);
    
    const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return "Päättynyt";
    if (daysUntil === 1) return "Huomenna";
    if (daysUntil <= 7) return `${daysUntil} päivän päästä`;
    return `${daysUntil} päivän päästä`;
  };

  const getCancelByDate = () => {
    if (!subscription.cancelByDate) return "Ei määritelty";
    
    const endDate = new Date(subscription.cancelByDate);
    return endDate.toLocaleDateString("fi-FI");
  };

  const getServiceLogo = () => {
    const name = subscription.name.toLowerCase();
    
    if (name.includes("netflix")) {
      return <span className="text-white font-bold text-sm">N</span>;
    }
    if (name.includes("spotify")) {
      return <i className="fab fa-spotify text-white text-lg"></i>;
    }
    if (name.includes("adobe")) {
      return <span className="text-white font-bold text-xs">Ai</span>;
    }
    if (name.includes("disney")) {
      return <span className="text-white font-bold text-sm">D+</span>;
    }
    if (name.includes("hbo") || name.includes("max")) {
      return <span className="text-white font-bold text-sm">H</span>;
    }
    if (name.includes("youtube")) {
      return <i className="fab fa-youtube text-white text-lg"></i>;
    }
    
    return <span className="text-white font-bold text-sm">{subscription.name.charAt(0).toUpperCase()}</span>;
  };

  const getLogoBackground = () => {
    const name = subscription.name.toLowerCase();
    
    if (name.includes("netflix")) return "bg-red-600";
    if (name.includes("spotify")) return "bg-green-500";
    if (name.includes("adobe")) return "bg-red-600";
    if (name.includes("disney")) return "bg-blue-600";
    if (name.includes("hbo") || name.includes("max")) return "bg-purple-600";
    if (name.includes("youtube")) return "bg-red-500";
    
    return "bg-gray-600";
  };

  const statusInfo = getStatusInfo(subscription.status);

  const handleCancelClick = () => {
    if (subscription.cancelUrl) {
      window.open(subscription.cancelUrl, "_blank");
    }
  };



  return (
    <div 
      className={`service-card rounded-2xl shadow-lg card-hover fade-in border-l-4 ${statusInfo.borderColor} relative overflow-hidden`}
    >
      {/* Header - Always Visible */}
      <div className="p-4 relative z-10">
        {/* Top Row: Logo, Name, Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-12 h-12 ${getLogoBackground()} rounded-lg flex items-center justify-center`}>
              {getServiceLogo()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base truncate">{subscription.name}</h3>
              {subscription.plan && (
                <p className="text-gray-600 text-xs truncate">{subscription.plan}</p>
              )}
            </div>
          </div>
          <div className="text-right ml-2">
            <div className="text-gray-800 font-bold text-base">
              {subscription.price}€/kk
            </div>
            <div className={`text-sm font-medium ${
              subscription.status === "urgent" ? "text-red-600" : 
              subscription.status === "warning" ? "text-yellow-600" : 
              "text-green-600"
            }`}>
              {getDaysUntilEnd()}
            </div>
            <div className="text-sm text-gray-500">
              {getCancelByDate()}
            </div>
          </div>
        </div>
        
        {/* Bottom Row: Buttons */}
        <div className="flex items-center justify-between space-x-2">
          <Button
            onClick={handleCancelClick}
            className={`text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 ${
              subscription.status === "urgent" ? "bg-red-500 hover:bg-red-600" :
              subscription.status === "warning" ? "bg-yellow-500 hover:bg-yellow-600" :
              "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            Peruuta tilaus
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 p-0 hover:bg-gray-100 rounded-lg border-2 ${
                  subscription.status === "urgent" ? "border-red-500" :
                  subscription.status === "warning" ? "border-yellow-500" :
                  "border-gray-400"
                }`}
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(subscription)}>
                <Edit className="w-4 h-4 mr-2" />
                Muokkaa
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Poista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


    </div>
  );
}
