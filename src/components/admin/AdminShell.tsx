import {
    BarChart3,
    BookOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Users,
    X,
} from "lucide-react";
import {
    Link,
    useLocation,
    useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";

type AdminShellProps = {
    children: ReactNode;
};

const navigation = [
    {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "CMS",
        to: "/admin/cms",
        icon: BookOpen,
    },
    {
        label: "CRM",
        to: "/admin/crm",
        icon: Users,
    },
    {
        label: "Reports",
        to: "/admin/reports",
        icon: BarChart3,
    },
    {
        label: "Settings",
        to: "/admin/settings",
        icon: Settings,
    },
] as const;

export function AdminShell({ children }: AdminShellProps) {
    const { user, ready, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!ready) return;

        if (!user || user.role !== "admin") {
            void navigate({
                to: "/admin",
                replace: true,
            });
        }
    }, [ready, user, navigate]);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    async function signOut() {
        await logout();
        window.location.assign("/admin");
    }

    if (!ready || !user || user.role !== "admin") {
        return <div className="min-h-screen bg-[#0c1724]" />;
    }

    return (
        <div className="min-h-screen bg-[#f6f5f1]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c1724] text-white">
                <div className="flex h-[73px] items-center justify-between px-5 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setMobileOpen((value) => !value)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 transition hover:bg-white/10 lg:hidden"
                            aria-label="Toggle admin navigation"
                        >
                            {mobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>

                        <Link
                            to="/admin/dashboard"
                            className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl"
                        >
                            Nepal Heaven{" "}
                            <span className="text-gold">
                Admin
              </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">
                                {user.name}
                            </p>

                            <p className="text-xs text-white/50">
                                {user.email}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={signOut}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                        >
                            <LogOut className="h-4 w-4" />

                            <span className="hidden sm:inline">
                Sign out
              </span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 border-r border-black/10 bg-white lg:block">
                    <AdminNavigation pathname={location.pathname} />
                </aside>

                {/* Mobile sidebar */}
                {mobileOpen ? (
                    <>
                        <button
                            type="button"
                            aria-label="Close admin navigation"
                            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        <aside className="fixed bottom-0 left-0 top-[73px] z-40 w-[min(82vw,18rem)] overflow-y-auto border-r border-black/10 bg-white shadow-2xl lg:hidden">
                            <AdminNavigation pathname={location.pathname} />
                        </aside>
                    </>
                ) : null}

                {/* Workspace */}
                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

function AdminNavigation({
                             pathname,
                         }: {
    pathname: string;
}) {
    return (
        <div className="p-5">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Workspace
            </p>

            <nav className="mt-3 grid gap-1">
                {navigation.map((item) => {
                    const Icon = item.icon;

                    const active =
                        pathname === item.to ||
                        (item.to !== "/admin/dashboard" &&
                            pathname.startsWith(`${item.to}/`));

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={[
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                                active
                                    ? "bg-[#0c1724] font-semibold text-white"
                                    : "font-medium text-[#0c1724] hover:bg-black/5",
                            ].join(" ")}
                        >
                            <Icon
                                className={[
                                    "h-4 w-4",
                                    active ? "text-gold" : "",
                                ].join(" ")}
                            />

                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}