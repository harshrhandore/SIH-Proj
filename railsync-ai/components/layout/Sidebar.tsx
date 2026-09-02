'use client';

// =============================================================================
// Sidebar — Operational Navigation Rail
// =============================================================================
// Human-crafted workstation sidebar:
// - Live operational badges (Pending counts, CP-SAT tag, verified status)
// - Collapsible rail (240px to 64px)
// - Station controller terminal metadata at bottom
// =============================================================================

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useOperationalStore } from '@/store/operationalStore';
import { useAuditStore } from '@/store/auditStore';
import {
  LayoutDashboard,
  GitBranchPlus,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Server,
  Network,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: 'primary' | 'warning' | 'success';
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const proposals = useOperationalStore((s) => s.proposals);
  const chainVerified = useAuditStore((s) => s.chainVerified);

  const pendingCount = proposals.filter(
    (p) => p.status === 'PENDING' || p.status === 'AI_RECOMMENDED' || p.status === 'UNDER_REVIEW'
  ).length;

  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Block Planning',
      href: '/workspace',
      icon: <GitBranchPlus size={18} />,
      badge: pendingCount > 0 ? `${pendingCount} Req` : undefined,
      badgeType: 'warning',
    },
    {
      label: 'Simulation',
      href: '/simulate',
      icon: <Zap size={18} />,
      badge: 'CP-SAT',
      badgeType: 'primary',
    },
    {
      label: 'Audit Log',
      href: '/audit',
      icon: <ShieldCheck size={18} />,
      badge: chainVerified ? 'Valid' : undefined,
      badgeType: 'success',
    },
  ];

  const width = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: `calc(100vh - var(--status-strip-height) - var(--nav-height))`,
        position: 'fixed',
        top: 'calc(var(--status-strip-height) + var(--nav-height))',
        left: 0,
        background: 'var(--color-bg-elevated)',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 150ms ease-out, min-width 150ms ease-out',
        zIndex: 30,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-default)',
      }}
    >
      {/* Top: Nav Items */}
      <div>
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: collapsed ? 'none' : 'block',
          }}
        >
          Operations Cockpit
        </div>

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: '0 var(--spacing-2)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '10px 0' : '8px 12px',
                  borderRadius: 'var(--radius-data)',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-bg-hover)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-accent-operational)' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 120ms ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: isActive ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-data)',
                      background:
                        item.badgeType === 'warning'
                          ? 'rgba(180, 83, 9, 0.12)'
                          : item.badgeType === 'success'
                            ? 'rgba(21, 128, 61, 0.12)'
                            : 'rgba(2, 132, 199, 0.12)',
                      color:
                        item.badgeType === 'warning'
                          ? 'var(--color-accent-warning)'
                          : item.badgeType === 'success'
                            ? 'var(--color-accent-success)'
                            : 'var(--color-accent-operational)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Terminal Info & Collapse Toggle */}
      <div>
        {!collapsed && (
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              margin: '0 var(--spacing-2) var(--spacing-2) var(--spacing-2)',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-data)',
              border: '1px solid var(--color-border-default)',
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Server size={12} style={{ color: 'var(--color-accent-operational)' }} />
              <strong style={{ color: 'var(--color-text-primary)' }}>Terminal GZB-04</strong>
            </div>
            <div className="font-mono" style={{ fontSize: '10px' }}>
              Host: 10.42.1.200
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--color-accent-success)' }}>
              <Network size={10} />
              <span>COA Gateway Synced</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: 'var(--spacing-3) var(--spacing-4)',
            borderTop: '1px solid var(--color-border-default)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--text-xs)',
            width: '100%',
          }}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
