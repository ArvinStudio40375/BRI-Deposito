import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Bell, University, MessageCircle, LogOut } from "lucide-react";
import briLogo from "@assets/BRI_2020_(Alternative).svg_1753669770193.png";
import BalanceCard from "@/components/balance-card";
import ChatModal from "@/components/chat-modal";
import NotificationModal from "@/components/notification-modal";
import type { User } from "@shared/schema";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
  }, [setLocation]);

  // Fetch updated user data
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["/api/users", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/users", currentUser?.id, "notifications"],
    enabled: !!currentUser?.id,
  });

  const adminAccessMutation = useMutation({
    mutationFn: api.adminAccess,
    onSuccess: () => {
      setLocation("/admin");
    },
    onError: () => {
      toast({
        title: "Kode akses salah",
        description: "Kode yang Anda masukkan tidak valid",
        variant: "destructive",
      });
    },
  });

  const checkWithdrawalEligibility = () => {
    if (!user) return false;
    const requiredSavings = user.saldo_deposito * 0.015; // 1.5%
    return user.saldo_tabungan >= requiredSavings;
  };

  const formatCurrency = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')},-`;
  };

  const getShortfall = () => {
    if (!user) return 0;
    const requiredSavings = user.saldo_deposito * 0.015;
    return Math.max(0, requiredSavings - user.saldo_tabungan);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast({
      title: "Logout berhasil",
      description: "Terima kasih telah menggunakan Deposit BRI",
    });
    setLocation("/");
  };

  const handleTransfer = () => {
    if (!checkWithdrawalEligibility()) {
      setShowInsufficientFunds(true);
    } else {
      toast({
        title: "Fitur Transfer",
        description: "Fitur transfer akan segera tersedia",
      });
    }
  };

  const handleWithdraw = () => {
    if (!checkWithdrawalEligibility()) {
      setShowInsufficientFunds(true);
    } else {
      toast({
        title: "Fitur Tarik Tunai",
        description: "Fitur tarik tunai akan segera tersedia",
      });
    }
  };

  const handleAdminAccess = () => {
    if (adminCode === "011090") {
      adminAccessMutation.mutate({ code: adminCode });
      setShowAdminModal(false);
      setAdminCode("");
    } else {
      toast({
        title: "Kode akses salah",
        description: "Kode yang Anda masukkan tidak valid",
        variant: "destructive",
      });
    }
  };

  const unreadNotifications = notifications.filter((n: any) => !n.read).length;

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bri-gray)]">
      {/* Header */}
      <header className="gradient-bg text-white p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold">Selamat Datang</h1>
            <p className="text-sm opacity-90">{currentUser.username}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-white hover:bg-white/20"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="p-2 text-white hover:bg-white/20"
              title="Logout"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div className="px-6 -mt-4 mb-6">
        <BalanceCard 
          user={user || currentUser} 
          onRefresh={refetchUser}
        />
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleTransfer}
            className="bg-[var(--bri-blue)] hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Transfer
          </Button>
          <Button
            onClick={handleWithdraw}
            className="bg-[var(--bri-green)] hover:bg-green-700 text-white py-4 rounded-xl font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 000 4h8a2 2 0 000-4H6z" />
            </svg>
            Tarik Tunai
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Layanan Lainnya</h3>
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline" className="bg-white p-4 rounded-xl card-shadow text-center h-auto flex flex-col">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-[var(--bri-blue)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Investasi</p>
          </Button>
          <Button variant="outline" className="bg-white p-4 rounded-xl card-shadow text-center h-auto flex flex-col">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-[var(--bri-green)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs font-medium">Riwayat</p>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowChat(true)}
            className="bg-white p-4 rounded-xl card-shadow text-center h-auto flex flex-col"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium">Live Chat</p>
          </Button>
        </div>
      </div>

      {/* BRI Footer */}
      <footer 
        onClick={() => setShowAdminModal(true)}
        className="bg-white border-t border-gray-200 p-6 mt-8 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={briLogo} alt="BRI Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-[var(--bri-blue)] font-semibold">Bank Rakyat Indonesia</span>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">© 2025 PT Bank Rakyat Indonesia Tbk</p>
      </footer>

      {/* Modals */}
      <ChatModal 
        open={showChat} 
        onOpenChange={setShowChat}
        currentUser={currentUser}
      />

      <NotificationModal
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={notifications}
      />

      {/* Admin Access Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Akses Admin</h3>
            <input
              type="password"
              placeholder="Masukkan kode akses"
              maxLength={6}
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminCode("");
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleAdminAccess}
                className="flex-1 bg-[var(--bri-blue)] hover:bg-blue-700"
              >
                Masuk
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Funds Modal */}
      {showInsufficientFunds && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Dana Tidak Mencukupi</h3>
              <p className="text-sm text-gray-600 mb-4">
                ❗ Anda belum bisa menarik dana deposito. Saldo tabungan Anda kurang sebesar {formatCurrency(getShortfall())}
              </p>
              <p className="text-sm text-blue-600 mb-4">
                Silakan lakukan top up saldo tabungan terlebih dahulu.
              </p>
              <Button
                onClick={() => setShowInsufficientFunds(false)}
                className="w-full bg-[var(--bri-blue)] hover:bg-blue-700"
              >
                Mengerti
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--bri-green)] hover:bg-green-700 text-white rounded-full shadow-lg pulse-notification"
        size="icon"
      >
        <MessageCircle size={24} />
      </Button>
    </div>
  );
}
