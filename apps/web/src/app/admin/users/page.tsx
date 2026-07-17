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
import { toast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ---------------------------------------------------------------------------
// Types (matching backend AdminUser from admin.service.ts)
// ---------------------------------------------------------------------------

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "CLIENT" | "SELLER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

type UserRole = AdminUser["role"];
type UserStatus = AdminUser["status"];

// ---------------------------------------------------------------------------
// TODO: Replace with real API data once a /users endpoint is available.
//       Use: const { data, isLoading } = useAdminUsers();
// ---------------------------------------------------------------------------

const MOCK_USERS: AdminUser[] = [
  {
    id: "user-001",
    name: "Aung Kyaw",
    email: "aungkyaw@gmail.com",
    phone: "+95912345678",
    role: "SELLER",
    status: "ACTIVE",
    avatar: "/avatars/user-001.jpg",
    createdAt: "2025-06-15T00:00:00Z",
  },
  {
    id: "user-002",
    name: "May Thida",
    email: "maythida@gmail.com",
    phone: "+95923456789",
    role: "CLIENT",
    status: "ACTIVE",
    avatar: "/avatars/user-002.jpg",
    createdAt: "2025-08-20T00:00:00Z",
  },
  {
    id: "user-003",
    name: "Zaw Lin",
    email: "zawlin@crossmart.mm",
    phone: "+95934567890",
    role: "ADMIN",
    status: "ACTIVE",
    avatar: "/avatars/user-003.jpg",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-004",
    name: "Thin Zar",
    email: "thinzar@gmail.com",
    phone: "+95945678901",
    role: "CLIENT",
    status: "SUSPENDED",
    avatar: "/avatars/user-004.jpg",
    createdAt: "2025-10-10T00:00:00Z",
  },
  {
    id: "user-005",
    name: "Nay Chi",
    email: "naychi@seller.mm",
    phone: "+95956789012",
    role: "SELLER",
    status: "INACTIVE",
    avatar: "/avatars/user-005.jpg",
    createdAt: "2026-07-10T00:00:00Z",
  },
  {
    id: "user-006",
    name: "Htet Aung",
    email: "htetaung@gmail.com",
    phone: "+95967890123",
    role: "CLIENT",
    status: "ACTIVE",
    avatar: "/avatars/user-006.jpg",
    createdAt: "2025-12-01T00:00:00Z",
  },
];

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
    case "ADMIN":
      return (
        <Badge variant="default">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    case "SELLER":
      return (
        <Badge variant="secondary">
          <ShoppingBag className="mr-1 h-3 w-3" />
          Seller
        </Badge>
      );
    case "CLIENT":
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
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "SUSPENDED":
      return <Badge variant="destructive">Suspended</Badge>;
    case "INACTIVE":
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
  // TODO: Replace MOCK_USERS with API data: const users = data ?? [];
  const [users] = useState<AdminUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  // detail dialog
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [detailRole, setDetailRole] = useState<UserRole>("CLIENT");
  const [detailStatus, setDetailStatus] = useState<UserStatus>("ACTIVE");

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
      ADMIN: users.filter((u) => u.role === "ADMIN").length,
      SELLER: users.filter((u) => u.role === "SELLER").length,
      CLIENT: users.filter((u) => u.role === "CLIENT").length,
      ACTIVE: users.filter((u) => u.status === "ACTIVE").length,
      SUSPENDED: users.filter((u) => u.status === "SUSPENDED").length,
      INACTIVE: users.filter((u) => u.status === "INACTIVE").length,
    }),
    [users]
  );

  // ---- helpers ----

  const openDetail = useCallback((user: AdminUser) => {
    setDetailUser(user);
    setDetailRole(user.role);
    setDetailStatus(user.status);
  }, []);

  const saveDetail = useCallback(() => {
    if (!detailUser) return;
    // TODO: Call API to update user when endpoint is available
    toast({ title: `"${detailUser.name}" updated successfully` });
    setDetailUser(null);
  }, [detailUser]);

  // ---- render ----
  return (
    <ProtectedRoute requiredRole="ADMIN">
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
            <p className="mt-1 text-2xl font-bold">{counts.all}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Active Users</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{counts.ACTIVE}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p className="text-sm">Sellers</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{counts.SELLER}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ban className="h-4 w-4" />
              <p className="text-sm">Suspended</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{counts.SUSPENDED}</p>
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
          <TabsTrigger value="ADMIN">Admin ({counts.ADMIN})</TabsTrigger>
          <TabsTrigger value="SELLER">Seller ({counts.SELLER})</TabsTrigger>
          <TabsTrigger value="CLIENT">Customer ({counts.CLIENT})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | UserStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active ({counts.ACTIVE})</TabsTrigger>
          <TabsTrigger value="SUSPENDED">
            Suspended ({counts.SUSPENDED})
          </TabsTrigger>
          <TabsTrigger value="INACTIVE">Inactive ({counts.INACTIVE})</TabsTrigger>
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
                      {formatDate(user.createdAt)}
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
                          {user.status !== "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Call API to activate user
                                toast({ title: `"${user.name}" has been activated` });
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          {user.status !== "SUSPENDED" && (
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Call API to suspend user
                                toast({ title: `"${user.name}" has been suspended`, variant: "destructive" });
                              }}
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
                    <option value="ADMIN">Admin</option>
                    <option value="SELLER">Seller</option>
                    <option value="CLIENT">Customer</option>
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
                      variant={detailStatus === "ACTIVE" ? "default" : "outline"}
                      onClick={() => setDetailStatus("ACTIVE")}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Active
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        detailStatus === "SUSPENDED" ? "destructive" : "outline"
                      }
                      onClick={() => setDetailStatus("SUSPENDED")}
                    >
                      <Ban className="mr-1 h-3.5 w-3.5" />
                      Suspended
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        detailStatus === "INACTIVE" ? "secondary" : "outline"
                      }
                      onClick={() => setDetailStatus("INACTIVE")}
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity summary */}
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-sm font-semibold">Account Info</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {formatDate(detailUser.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {detailUser.phone || "N/A"}
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
    </div>
    </ProtectedRoute>
  );
}
