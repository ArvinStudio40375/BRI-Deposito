import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import type { Notification } from "@shared/schema";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
}

export default function NotificationModal({ open, onOpenChange, notifications }: NotificationModalProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-[var(--bri-blue)]" size={32} />
            </div>
            <DialogTitle className="text-lg font-semibold mb-2">Notifikasi</DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.tipe === 'info' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-orange-50 border border-orange-200'
                  }`}
                >
                  <p className={`font-medium ${
                    notification.tipe === 'info' ? 'text-blue-800' : 'text-orange-800'
                  }`}>
                    {notification.isi}
                  </p>
                  <span className={`text-xs ${
                    notification.tipe === 'info' ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {formatDate(notification.tanggal)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Tidak ada notifikasi</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full bg-[var(--bri-blue)] hover:bg-blue-700 mt-4"
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}
