import { Link, usePage } from '@inertiajs/react';
import { CalendarPlus, LayoutGrid, QrCode, UserCheck, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import { attendees as adminAttendees } from '@/routes/admin';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { isAdmin, userCapabilities } = usePage().props as {
        isAdmin?: boolean;
        userCapabilities?: {
            canManageAttendees: boolean;
            canManagePayments: boolean;
            canMarkAttendance: boolean;
        };
    };

    // For user-admins, only show Event Attendees (canMarkAttendance but not canManageAttendees)
    // For payment-admins and super-admins, show all admin items (canManageAttendees)
    const canAccessFullAdmin = userCapabilities?.canManageAttendees ?? isAdmin ?? false;
    const isUserAdmin = userCapabilities?.canMarkAttendance && !userCapabilities?.canManageAttendees;

    const mainNavItems: NavItem[] = [
        ...(isUserAdmin ? [] : [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ]),
        ...(isUserAdmin || canAccessFullAdmin
            ? [
                  {
                      title: 'Events',
                      href: '/events',
                      icon: CalendarPlus,
                  },
              ]
            : []),
        ...(canAccessFullAdmin && !isUserAdmin
            ? [
                  {
                      title: 'Registered Users',
                      href: '/admin/users',
                      icon: Users,
                  },
                  {
                      title: 'Event Attendees',
                      href: adminAttendees(),
                      icon: UserCheck,
                  },
                  {
                      title: 'QR Codes',
                      href: '/admin/qr-codes',
                      icon: QrCode,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="!bg-black">
            <SidebarHeader className="!bg-black">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="!bg-black">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="!bg-black">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
