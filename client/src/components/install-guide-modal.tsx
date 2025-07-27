import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Share, Plus, Home } from "lucide-react";

interface InstallGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstallClick?: () => void;
  showInstallButton?: boolean;
}

export default function InstallGuideModal({ 
  open, 
  onOpenChange, 
  onInstallClick, 
  showInstallButton = false 
}: InstallGuideModalProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <span>📱 Asenna CancelBuddy</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Luo pikakuvake puhelimesi työpöydälle nopeaa käyttöä varten:
          </p>

          {isIOS && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-blue-900">iPhone/iPad ohjeet:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Avaa Safari-selain ja siirry sivulle</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <div className="flex items-center space-x-1">
                    <span>Paina</span>
                    <Share className="w-4 h-4" />
                    <span>"Jaa" -painiketta</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <div className="flex items-center space-x-1">
                    <span>Valitse</span>
                    <Plus className="w-4 h-4" />
                    <span>"Lisää Koti-näyttöön"</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <span>Paina "Lisää" vahvistaaksesi</span>
                </div>
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-green-900">Android ohjeet:</h4>
              {showInstallButton ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-800">
                    Paina alla olevaa painiketta asentaaksesi sovelluksen:
                  </p>
                  <Button 
                    onClick={onInstallClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Asenna sovellus
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Avaa Chrome-selain</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Paina selaimen valikon "⋮" -painiketta</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <div className="flex items-center space-x-1">
                      <span>Valitse</span>
                      <Plus className="w-4 h-4" />
                      <span>"Lisää aloitusnäyttöön"</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Vahvista "Lisää" painamalla</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Tietokone/Muu laite:</h4>
              <p className="text-sm text-gray-600">
                Avaa sivusto mobiililaitteella parhainta käyttökokemusta varten.
              </p>
            </div>
          )}

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Home className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-800 font-medium text-sm mb-1">
                  Miksi asentaa?
                </p>
                <ul className="text-purple-700 text-xs space-y-1">
                  <li>• Nopea pääsy työpöydältä</li>
                  <li>• Ilmoitukset päättyvistä tilauksista</li>
                  <li>• Toimii kuin tavallinen sovellus</li>
                  <li>• Ei vie tallennustilaa</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-sm"
            >
              Sulje
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}