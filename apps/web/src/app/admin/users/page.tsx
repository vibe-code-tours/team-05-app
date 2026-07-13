"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Users,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Shield,
  ShoppingBag,
  UserCog,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Ban,
  UserCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockAdminUsers } from "@/lib/mock-admin-data";
import type { AdminUser, UserRole, UserStatus } from "@/types/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function roleBadge(role: UserRole) {
  switch (role) {
    case "admin":
      return (
        <Badge variant="default">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    case "seller":
      return (
        <Badge variant="secondary">
          <ShoppingBag className="mr-1 h-3 w-3" />
          Seller
        </Badge>
      );
    case "client":
      return (
        <Badge variant="outline">
          <UserCog className="mr-1 h-3 w-3" />
          Customer
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

function statusBadge(status: UserStatus) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  // ---- state ----
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  // detail dialog
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [detailRole, setDetailRole] = useState<UserRole>("client");
  const [detailStatus, setDetailStatus] = useState<UserStatus>("active");

  // toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ---- derived ----
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      seller: users.filter((u) => u.role === "seller").length,
      client: users.filter((u) => u.role === "client").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      pending: users.filter((u) => u.status === "pending").length,
    }),
    [users]
  );

  const stats = useMemo(() => {
    const totalOrders = users.reduce((sum, u) => sum + u.totalOrders, 0);
    const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
    return {
      totalUsers: users.length,
      activeUsers: counts.active,
      pendingUsers: counts.pending,
      totalOrders,
      totalRevenue,
    };
  }, [users, counts.active, counts.pending]);

  // ---- helpers ----
  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const verifyUser = useCallback(
    (user: AdminUser) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: "active" as UserStatus } : u
        )
      );
      showToast(`"${user.name}" has been verified`);
    },
    [showToast]
  );

  const suspendUser = useCallback(
    (user: AdminUser) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: "suspended" as UserStatus } : u
        )
      );
      showToast(`"${user.name}" has been suspended`, "error");
    },
    [showToast]
  );

  const openDetail = useCallback((user: AdminUser) => {
    setDetailUser(user);
    setDetailRole(user.role);
    setDetailStatus(user.status);
  }, []);

  const saveDetail = useCallback(() => {
    if (!detailUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === detailUser.id
          ? { ...u, role: detailRole, status: detailStatus }
          : u
      )
    );
    showToast(`"${detailUser.name}" updated successfully`);
    setDetailUser(null);
  }, [detailUser, detailRole, detailStatus, showToast]);

  // ---- render ----
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage platform users, roles, and account status.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <p className="text-sm">Total Users</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Active Users</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p className="text-sm">Pending Verification</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.pendingUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm">Total Revenue</p>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)} MMK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role tabs */}
      <Tabs
        value={roleFilter}
        onValueChange={(v) => setRoleFilter(v as "all" | UserRole)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="admin">Admin ({counts.admin})</TabsTrigger>
          <TabsTrigger value="seller">Seller ({counts.seller})</TabsTrigger>
          <TabsTrigger value="client">Customer ({counts.client})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | UserStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({counts.suspended})
          </TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* User table */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              No users found
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>

                    {/* Status */}
                    <td className="px-4 py-3">{statusBadge(user.status)}</td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(user.joinedDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {user.status !== "active" && (
                            <DropdownMenuItem onClick={() => verifyUser(user)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Verify User
                            </DropdownMenuItem>
                          )}
                          {user.status !== "suspended" && (
                            <DropdownMenuItem
                              onClick={() => suspendUser(user)}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================================================================
          User Detail Dialog
          ================================================================ */}
      <Dialog
        open={!!detailUser}
        onOpenChange={(open) => {
          if (!open) setDetailUser(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detailUser && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">User Details</DialogTitle>
                <DialogDescription>
                  View and manage user account information.
                </DialogDescription>
              </DialogHeader>

              {/* Profile info */}
              <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={detailUser.avatar} alt={detailUser.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(detailUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">{detailUser.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {detailUser.email}
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                {/* Role selection */}
                <div className="space-y-2">
                  <Label htmlFor="detail-role">Role</Label>
                  <select
                    id="detail-role"
                    value={detailRole}
                    onChange={(e) =>
                      setDetailRole(e.target.value as UserRole)
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                    <option value="client">Customer</option>
                  </select>
                </div>

                {/* Status toggle */}
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <div className="flex items-center gap-3 pt-1">
                    {statusBadge(detailStatus)}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={detailStatus === "active" ? "default" : "outline"}
                      onClick={() => setDetailStatus("active")}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Active
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        detailStatus === "suspended" ? "destructive" : "outline"
                      }
                      onClick={() => setDetailStatus("suspended")}
                    >
                      <Ban className="mr-1 h-3.5 w-3.5" />
                      Suspended
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        detailStatus === "pending" ? "secondary" : "outline"
                      }
                      onClick={() => setDetailStatus("pending")}
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Pending
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity summary */}
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-sm font-semibold">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {formatDate(detailUser.joinedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Last Active</p>
                      <p className="font-medium">
                        {formatDateTime(detailUser.lastActive)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{detailUser.totalOrders}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-medium">
                        {formatCurrency(detailUser.totalSpent)} MMK
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDetailUser(null)}
                >
                  Cancel
                </Button>
                <Button onClick={saveDetail}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Toast
          ================================================================ */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
