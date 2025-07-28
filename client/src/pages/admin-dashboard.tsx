import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { LogOut, Send, Trash2, Database, Edit, Plus } from "lucide-react";
import briLogo from "@assets/BRI_2020_(Alternative).svg_1753669770193.png";
import type { Chat, User, Notification } from "@shared/schema";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [savingsAmount, setSavingsAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedUserForNotif, setSelectedUserForNotif] = useState("1");
  const [selectedUserForBalance, setSelectedUserForBalance] = useState("1");
  const [invoiceEmail, setInvoiceEmail] = useState("sitiaminah@example.com");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [adminChatMessage, setAdminChatMessage] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ username: "", pin: "", saldo_tabungan: "", saldo_deposito: "" });
  const [showAddUser, setShowAddUser] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user (assuming Siti Aminah with ID 1)
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users", 1],
  });

  // Fetch chat messages
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["/api/chat"],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Database management queries
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: allNotifications = [] } = useQuery({
    queryKey: ["/api/admin/notifications"],
  });

  const { data: allChatMessages = [] } = useQuery({
    queryKey: ["/api/admin/chat-messages"],
  });

  // Update balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: ({ userId, type, amount }: { userId: number, type: 'tabungan' | 'deposito', amount: number }) => 
      api.updateUserBalance(userId, { type, amount }),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSavingsAmount("");
      setDepositAmount("");
      toast({
        title: "Berhasil",
        description: "Saldo berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error("Update balance error:", error);
      toast({
        title: "Gagal",
        description: "Gagal memperbarui saldo",
        variant: "destructive",
      });
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: ({ userId, message, type }: { userId: number, message: string, type: 'info' | 'popup' }) =>
      api.createNotification({
        user_id: userId,
        isi: message,
        tipe: type,
      }),
    onSuccess: () => {
      setNotificationMessage("");
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Berhasil", 
        description: "Notifikasi berhasil dikirim",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal mengirim notifikasi",
        variant: "destructive",
      });
    },
  });

  // Send chat message mutation
  const sendChatMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: () => {
      setAdminChatMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  // Delete mutations
  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: api.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Berhasil",
        description: "Notifikasi berhasil dihapus",
      });
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: api.deleteChatMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat-messages"] });
      toast({
        title: "Berhasil",
        description: "Pesan chat berhasil dihapus",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddUser(false);
      setNewUserData({ username: "", pin: "", saldo_tabungan: "", saldo_deposito: "" });
      toast({
        title: "Berhasil",
        description: "User berhasil ditambahkan",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal menambahkan user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number, userData: any }) => api.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({
        title: "Berhasil", 
        description: "User berhasil diupdate",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal mengupdate user",
        variant: "destructive",
      });
    },
  });



  const handleSendInvoice = () => {
    if (invoiceEmail && invoiceAmount) {
      const amount = parseInt(invoiceAmount);
      toast({
        title: "Invoice Terkirim",
        description: `Invoice sebesar Rp. ${amount.toLocaleString('id-ID')} berhasil dikirim ke ${invoiceEmail}`,
      });
      setInvoiceAmount("");
    }
  };

  const handleSendAdminChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminChatMessage.trim()) {
      sendChatMutation.mutate({
        sender: "admin",
        message: adminChatMessage.trim(),
      });
    }
  };

  const handleLogout = () => {
    setLocation("/dashboard");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleCreateUser = () => {
    if (newUserData.username && newUserData.pin && newUserData.saldo_tabungan && newUserData.saldo_deposito) {
      createUserMutation.mutate(newUserData);
    }
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({ 
        id: editingUser.id, 
        userData: {
          username: editingUser.username,
          pin: editingUser.pin,
          saldo_tabungan: editingUser.saldo_tabungan,
          saldo_deposito: editingUser.saldo_deposito
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[var(--bri-blue)] text-white p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={briLogo} alt="BRI Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold">Dashboard Admin</h1>
          </div>
          <Button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            <LogOut className="mr-2" size={16} />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard Admin</TabsTrigger>
            <TabsTrigger value="database">
              <Database className="mr-2" size={16} />
              Kelola Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* User Management */}
            <Card>
          <CardHeader>
            <CardTitle>Kelola Saldo Nasabah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Pilih User Penerima</Label>
                <Select value={selectedUserForBalance} onValueChange={setSelectedUserForBalance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih user" />
                  </SelectTrigger>
                  <SelectContent>
                    {(allUsers as User[]).map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} (ID: {user.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Tambah Saldo Tabungan</Label>
                  <Input
                    type="number"
                    placeholder="Jumlah (Rp)"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    onClick={() => {
                      const amount = parseInt(savingsAmount);
                      const userId = parseInt(selectedUserForBalance);
                      if (amount && amount > 0 && userId) {
                        updateBalanceMutation.mutate({ userId, type: 'tabungan', amount });
                      }
                    }}
                    disabled={!savingsAmount || updateBalanceMutation.isPending}
                    className="w-full bg-[var(--bri-green)] hover:bg-green-700"
                  >
                    Tambah Tabungan
                  </Button>
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Tambah Saldo Deposito</Label>
                  <Input
                    type="number"
                    placeholder="Jumlah (Rp)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    onClick={() => {
                      const amount = parseInt(depositAmount);
                      const userId = parseInt(selectedUserForBalance);
                      if (amount && amount > 0 && userId) {
                        updateBalanceMutation.mutate({ userId, type: 'deposito', amount });
                      }
                    }}
                    disabled={!depositAmount || updateBalanceMutation.isPending}
                    className="w-full bg-[var(--bri-blue)] hover:bg-blue-700"
                  >
                    Tambah Deposito
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Management */}
        <Card>
          <CardHeader>
            <CardTitle>Kirim Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Pilih User Penerima</Label>
              <Select value={selectedUserForNotif} onValueChange={setSelectedUserForNotif}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih user" />
                </SelectTrigger>
                <SelectContent>
                  {(allUsers as User[]).map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} (ID: {user.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Pesan Notifikasi</Label>
              <Textarea
                rows={3}
                placeholder="Tulis pesan..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  if (notificationMessage) {
                    const userId = parseInt(selectedUserForNotif);
                    sendNotificationMutation.mutate({ userId, message: notificationMessage, type: 'info' });
                  }
                }}
                disabled={!notificationMessage || sendNotificationMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Kirim Info
              </Button>
              <Button
                onClick={() => {
                  if (notificationMessage) {
                    const userId = parseInt(selectedUserForNotif);
                    sendNotificationMutation.mutate({ userId, message: notificationMessage, type: 'popup' });
                  }
                }}
                disabled={!notificationMessage || sendNotificationMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Kirim Popup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Management */}
        <Card>
          <CardHeader>
            <CardTitle>Kirim Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Email nasabah"
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Nominal (Rp)"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
            />
            <Button
              onClick={handleSendInvoice}
              disabled={!invoiceEmail || !invoiceAmount}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Kirim Invoice
            </Button>
          </CardContent>
        </Card>

        {/* Live Chat Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Live Chat dengan Nasabah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
              {chatMessages.map((msg: Chat) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`mb-3 flex ${isAdmin ? '' : 'justify-end'}`}>
                    <div className={`chat-bubble px-3 py-2 rounded-lg ${
                      isAdmin 
                        ? 'bg-gray-200 text-gray-800' 
                        : 'bg-[var(--bri-blue)] text-white'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <span className={`text-xs ${
                        isAdmin ? 'text-gray-500' : 'text-blue-200'
                      }`}>
                        {formatTime(msg.waktu)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSendAdminChat} className="flex space-x-2">
              <Input
                value={adminChatMessage}
                onChange={(e) => setAdminChatMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!adminChatMessage.trim() || sendChatMutation.isPending}
                className="bg-[var(--bri-blue)] hover:bg-blue-700"
              >
                <Send size={16} />
              </Button>
            </form>
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Kelola Data Users</CardTitle>
                  <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-500 hover:bg-green-600">
                        <Plus size={16} className="mr-2" />
                        Tambah User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Username</Label>
                          <Input
                            value={newUserData.username}
                            onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                            placeholder="Masukkan username"
                          />
                        </div>
                        <div>
                          <Label>PIN</Label>
                          <Input
                            value={newUserData.pin}
                            onChange={(e) => setNewUserData({...newUserData, pin: e.target.value})}
                            placeholder="Masukkan PIN"
                          />
                        </div>
                        <div>
                          <Label>Saldo Tabungan</Label>
                          <Input
                            type="number"
                            value={newUserData.saldo_tabungan}
                            onChange={(e) => setNewUserData({...newUserData, saldo_tabungan: e.target.value})}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Saldo Deposito</Label>
                          <Input
                            type="number"
                            value={newUserData.saldo_deposito}
                            onChange={(e) => setNewUserData({...newUserData, saldo_deposito: e.target.value})}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleCreateUser} className="flex-1">
                            Simpan
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                            Batal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Saldo Tabungan</TableHead>
                      <TableHead>Saldo Deposito</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>Rp. {user.saldo_tabungan?.toLocaleString('id-ID')}</TableCell>
                        <TableCell>Rp. {user.saldo_deposito?.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => setEditingUser(user)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Username</Label>
                                      <Input
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label>PIN</Label>
                                      <Input
                                        value={editingUser.pin}
                                        onChange={(e) => setEditingUser({...editingUser, pin: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label>Saldo Tabungan</Label>
                                      <Input
                                        type="number"
                                        value={editingUser.saldo_tabungan}
                                        onChange={(e) => setEditingUser({...editingUser, saldo_tabungan: parseInt(e.target.value)})}
                                      />
                                    </div>
                                    <div>
                                      <Label>Saldo Deposito</Label>
                                      <Input
                                        type="number"
                                        value={editingUser.saldo_deposito}
                                        onChange={(e) => setEditingUser({...editingUser, saldo_deposito: parseInt(e.target.value)})}
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button onClick={handleUpdateUser} className="flex-1">
                                        Update
                                      </Button>
                                      <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                        Batal
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Notifications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Kelola Data Notifikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Isi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allNotifications.map((notification: Notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{notification.id}</TableCell>
                        <TableCell>{notification.user_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.isi}</TableCell>
                        <TableCell>{notification.tipe}</TableCell>
                        <TableCell>{new Date(notification.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Chat Messages Table */}
            <Card>
              <CardHeader>
                <CardTitle>Kelola Data Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allChatMessages.map((message: Chat) => (
                      <TableRow key={message.id}>
                        <TableCell>{message.id}</TableCell>
                        <TableCell>{message.sender}</TableCell>
                        <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                        <TableCell>{new Date(message.waktu).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => deleteChatMutation.mutate(message.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
