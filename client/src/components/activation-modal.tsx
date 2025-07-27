import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Shield, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActivationModalProps {
  open: boolean;
  sessionKey: string;
  onActivated: () => void;
}

export default function ActivationModal({ open, sessionKey, onActivated }: ActivationModalProps) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const activateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/session/activate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "CancelBuddy aktivoitu!",
        description: "Voit nyt aloittaa tilausten seurannan.",
      });
      onActivated();
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Aktivointi epäonnistui. Yritä uudelleen.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async () => {
    const url = `${window.location.origin}?session=${sessionKey}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Kopioitu!",
        description: "URL kopioitu leikepöydälle.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const displayUrl = `${window.location.origin}?session=${sessionKey}`;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="text-center py-6">
          {/* Hero Section */}
          <div className="mb-6">
            <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Tervetuloa CancelBuddyyn!
            </h2>
            <p className="text-gray-600 text-sm">
              Sinun henkilökohtainen tilausmuistutuspalvelusi
            </p>
          </div>

          {/* URL Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Sinun yksilöllinen URL
            </h3>
            <div className="bg-white rounded-lg border p-3 mb-3">
              <p className="text-xs text-gray-600 break-all font-mono">
                {displayUrl}
              </p>
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Kopioitu
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Kopioi URL
                </>
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="mb-6 text-left">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">Mitä saat:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Älykkäät muistutukset</p>
                  <p className="text-gray-600 text-xs">Saat ilmoituksen ennen kokeilun päättymistä</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Kaikki palvelut yhdessä</p>
                  <p className="text-gray-600 text-xs">Netflix, Spotify, Adobe ja satoja muita</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Suorat peruutuslinkit</p>
                  <p className="text-gray-600 text-xs">Yksi klikkaus vie suoraan peruutukseen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activation Button */}
          <Button
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending}
            className="w-full gradient-bg text-white py-3 text-base font-semibold"
          >
            {activateMutation.isPending ? "Aktivoidaan..." : "Aktivoi CancelBuddy"}
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Klikkaamalla aktivoit henkilökohtaisen tilausmuistutuspalvelusi
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}