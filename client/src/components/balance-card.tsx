import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Wallet, Info, AlertTriangle } from "lucide-react";
import type { User } from "@shared/schema";

interface BalanceCardProps {
  user: User;
  onRefresh?: () => void;
}

export default function BalanceCard({ user }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return `Rp. ${amount.toLocaleString('id-ID')},-`;
  };

  const requiredSavings = user.saldo_deposito * 0.015; // 1.5%
  const shortfall = Math.max(0, requiredSavings - user.saldo_tabungan);

  return (
    <Card className="bg-white rounded-2xl card-shadow">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Saldo Rekening</h2>
        
        {/* Deposit Balance */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[var(--bri-green-light)] rounded-full flex items-center justify-center mr-3">
                <PiggyBank className="text-[var(--bri-green)]" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Deposito</p>
                <p className="text-2xl font-bold text-[var(--bri-blue)]">
                  {formatCurrency(user.saldo_deposito)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Balance */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Wallet className="text-[var(--bri-blue)]" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Tabungan</p>
                <p className="text-xl font-bold text-[var(--bri-blue)]">
                  {formatCurrency(user.saldo_tabungan)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Requirements */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800 flex items-start">
            <Info className="mr-2 mt-0.5 flex-shrink-0" size={16} />
            Untuk melakukan transfer atau tarik tunai, Anda wajib memiliki saldo tabungan minimal 1,5% dari saldo deposito.
          </p>
        </div>

        {/* Progress Info */}
        {shortfall > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 flex items-start">
              <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
              Tinggal <strong>{formatCurrency(shortfall)}</strong> lagi untuk dapat menarik seluruh saldo deposito Anda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
