import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Bell, BarChart3, Settings, Download, Shield, TrendingUp, Smartphone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "@/components/subscription-card";
import AddSubscriptionModal from "@/components/add-subscription-modal";
import SettingsModal from "@/components/settings-modal";
import ActivationModal from "@/components/activation-modal";
import InstallGuideModal from "@/components/install-guide-modal";

import { Subscription, NotificationSettings, UserSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isInstallGuideModalOpen, setIsInstallGuideModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  


  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddModalOpen(true);
  };

  // Check session status
  const { data: sessionData, isLoading: sessionLoading } = useQuery<{sessionKey: string | null, session: UserSession | null}>({
    queryKey: ["/api/session"],
  });

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: sessionData?.session?.isActivated === true,
  });

  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ["/api/settings"],
    enabled: sessionData?.session?.isActivated === true,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/session/create");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/session"], data);
      setIsActivationModalOpen(true);
    },
  });

  // Calculate stats for badge updates
  const stats = {
    active: subscriptions.length,
    upcoming: subscriptions.filter(s => s.status === "warning" || s.status === "urgent").length,
    saved: "189€", // This would be calculated from user's history
  };

  // Handle first visit or URL session parameter
  useEffect(() => {
    if (sessionLoading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionKey = urlParams.get('session');

    if (urlSessionKey && sessionData?.sessionKey !== urlSessionKey) {
      // Redirect with URL session key - this would need server-side handling
      window.location.reload();
      return;
    }

    if (!sessionData?.sessionKey) {
      // No session exists, create one
      createSessionMutation.mutate();
    } else if (sessionData?.session && !sessionData.session.isActivated) {
      // Session exists but not activated
      setIsActivationModalOpen(true);
    }
  }, [sessionData, sessionLoading]);

  // PWA Install handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    // Always show install button on mobile devices, regardless of installation status
    const isMobile = /iPad|iPhone|iPod|Android/.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
      setShowInstallButton(true);
      
      if (!isStandalone && !isIOSStandalone) {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update PWA badge based on upcoming subscriptions
  useEffect(() => {
    const upcomingCount = subscriptions.filter(s => s.status === "warning" || s.status === "urgent").length;
    if ('setAppBadge' in navigator) {
      if (upcomingCount > 0) {
        (navigator as any).setAppBadge(upcomingCount);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  }, [subscriptions]);

  const handleInstallClick = async () => {
    // Request notification permission for badge support
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        // Set initial badge if there are upcoming subscriptions
        const upcomingCount = subscriptions.filter(s => s.status === "warning" || s.status === "urgent").length;
        if ('setAppBadge' in navigator && upcomingCount > 0) {
          (navigator as any).setAppBadge(upcomingCount);
        }
      }
      setDeferredPrompt(null);
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // iOS instructions
      alert('📱 iPhone-asennus:\n\n1. Napauta Safari-selaimen alapalkin JAA-painiketta (📤)\n2. Vieritä alas ja valitse "Lisää kotinäytölle"\n3. Napauta "Lisää" oikeassa yläkulmassa\n\n✅ Sovellus ilmestyy kotinäytöllesi!\n\n🔴 Putoavia numeroita tilausten päättymisestä näkyy kuvakkeessa kun tilaukset ovat päättymässä.');
    } else {
      // Android or other mobile devices
      alert('📱 Asennus:\n\nNavigointi → Lisää kotinäytölle\ntai\nSelain → Asetukset → Lisää kotinäytölle\n\n🔴 Punaiset numerot kuvakkeessa kertovat tilausten päättymisestä!');
    }
  };

  const handleActivated = () => {
    setIsActivationModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/session"] });
    queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
  };

  // Show loading while checking session
  if (sessionLoading || createSessionMutation.isPending) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">CancelBuddy</h2>
          <p className="text-gray-600">Ladataan...</p>
        </div>
      </div>
    );
  }

  // Show activation modal if session not activated
  if (sessionData?.session && !sessionData.session.isActivated) {
    return (
      <>
        <div className="bg-gray-50 min-h-screen"></div>
        <ActivationModal
          open={isActivationModalOpen}
          sessionKey={sessionData.sessionKey || ""}
          onActivated={handleActivated}
        />
      </>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="gradient-bg text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CancelBuddy</h1>
              <p className="text-white/80 text-sm">Peruutusmuistutukset</p>
            </div>
          </div>

        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <div className="text-white/80 text-xs">Aktiivista</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{subscriptions.filter(s => s.status === "warning" || s.status === "urgent").length}</div>
            <div className="text-white/80 text-xs">Päättyy pian</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold">{subscriptions.reduce((total, sub) => total + (sub.price || 0), 0).toFixed(0)}€</div>
            <div className="text-white/80 text-xs">Kuukausikulu</div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="px-6 pt-6 relative z-10">





        {/* Subscription Cards */}
        <div className="space-y-4 mb-32">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Ladataan tilauksia...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ei tilauksia</h3>
              <p className="text-gray-600 mb-4">Aloita lisäämällä ensimmäinen tilauksesi</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-white"
              >
                Lisää tilaus
              </Button>
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <SubscriptionCard 
                key={subscription.id} 
                subscription={subscription} 
                onEdit={handleEditSubscription}
              />
            ))
          )}
        </div>
      </main>



      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-around">
          {/* Add Subscription Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center space-y-0.5"
          >
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium text-primary">Lisää</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/costs'}
            className="flex flex-col items-center space-y-1"
          >
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-green-600">Kustannukset</span>
          </button>
          
          <button 
            onClick={() => setIsInstallGuideModalOpen(true)}
            className="flex flex-col items-center space-y-1"
          >
            <Smartphone className="w-6 h-6 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">Asenna</span>
          </button>
          
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex flex-col items-center space-y-1"
          >
            <Settings className="w-6 h-6 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Asetukset</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AddSubscriptionModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingSubscription(null);
        }}
        editingSubscription={editingSubscription}
      />
      <SettingsModal 
        open={isSettingsModalOpen} 
        onOpenChange={setIsSettingsModalOpen}
        settings={settings}
      />
      <ActivationModal
        open={isActivationModalOpen}
        sessionKey={sessionData?.sessionKey || ""}
        onActivated={handleActivated}
      />
      <InstallGuideModal
        open={isInstallGuideModalOpen}
        onOpenChange={setIsInstallGuideModalOpen}
        onInstallClick={handleInstallClick}
        showInstallButton={showInstallButton}
      />
    </div>
  );
}
