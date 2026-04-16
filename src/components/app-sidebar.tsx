'use client';

import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';
import { Home, LayoutGrid, Database, MessageSquare, Target, FolderKanban, History, Inbox, Network } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Home">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/platform-map'} tooltip="Platform Map">
              <Link href="/platform-map">
                <LayoutGrid className="h-5 w-5" />
                <span>Platform Map</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/database-roadmap'} tooltip="Database Roadmap">
              <Link href="/database-roadmap">
                <Database className="h-5 w-5" />
                <span>Database Roadmap</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/comments'} tooltip="Comments">
              <Link href="/comments">
                <MessageSquare className="h-5 w-5" />
                <span>Comments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Portfolio Planning */}
          <SidebarMenuItem>
            <div style={{ height: 1, background: '#e5e7eb', margin: '8px 12px' }} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/master-plans')} tooltip="Master Plans">
              <Link href="/master-plans">
                <FolderKanban className="h-5 w-5" />
                <span>Master Plans</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.endsWith('/diagram')} tooltip="Diagrams">
              <Link href="/diagrams">
                <Network className="h-5 w-5" />
                <span>Diagrams</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/cycle-planning'} tooltip="Cycle Planning">
              <Link href="/cycle-planning">
                <Target className="h-5 w-5" />
                <span>Cycle Planning</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/cycles')} tooltip="Cycle History">
              <Link href="/cycles">
                <History className="h-5 w-5" />
                <span>Cycle History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/feedback-inbox'} tooltip="Feedback Inbox">
              <Link href="/feedback-inbox">
                <Inbox className="h-5 w-5" />
                <span>Feedback Inbox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
