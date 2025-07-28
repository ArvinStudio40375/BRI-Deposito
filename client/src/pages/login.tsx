import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { University, ArrowRight, Info } from "lucide-react";
import briLogo from "@assets/BRI_2020_(Alternative).svg_1753669770193.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.login({
        username: username,
        pin: pin
      });

      // Store user data in localStorage
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      
      toast({
        title: "Login berhasil",
        description: "Selamat datang di Deposit BRI",
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login gagal",
        description: "PIN yang Anda masukkan salah",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center px-6">
      <Card className="bg-white rounded-2xl card-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <img src={briLogo} alt="BRI Logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--bri-blue)] mb-2">Deposit BRI</h1>
            <p className="text-gray-600 text-sm">Simulasi Layanan Perbankan Digital</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Username</Label>
              <Input 
                type="text" 
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">PIN Verifikasi</Label>
              <Input 
                type="password" 
                placeholder="Masukkan PIN 6 digit" 
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || pin.length !== 6 || !username.trim()}
              className="w-full bg-[var(--bri-blue)] hover:bg-blue-700 text-white py-3 font-semibold"
            >
              {isLoading ? "Memproses..." : "Masuk"} 
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Info className="mr-1" size={12} />
              Masukkan PIN 6 digit Anda
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
