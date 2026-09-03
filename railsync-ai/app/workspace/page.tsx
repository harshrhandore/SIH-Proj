'use client';

// =============================================================================
// Workspace Page (/workspace) — Block Planning & Marey Diagram Workspace
// =============================================================================
// Responsive Layout Strategies:
// - Desktop (>=1280px): 65% Marey Diagram / 35% Detail & Control Panel
// - Tablet Landscape (1024–1279px): 60% / 40% split
// - Tablet Portrait (768–1023px): Stacked (Canvas 340px top, tabs below)
// - Mobile (<768px): Single-panel mode with segmented toggle [ Train Graph | Proposals ]
// =============================================================================

import { useState, useEffect } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useNavMode } from '@/hooks/useNavMode';
import { useOrientation } from '@/hooks/useOrientation';
import MareyDiagram from '@/components/workspace/MareyDiagram';
import ProposalList from '@/components/workspace/ProposalList';
import AIAnalysisPanel from '@/components/workspace/AIAnalysisPanel';
import CorridorGIS from '@/components/workspace/CorridorGIS';
import ApprovalDrawer from '@/components/shared/ApprovalDrawer';
import { List, Brain, Map, LineChart, Sparkles, X, RotateCw } from 'lucide-react';

export default function WorkspacePage() {
  const trains = useOperationalStore((s) => s.trains);
  const proposals = useOperationalStore((s) => s.proposals);
  const tsrs = useOperationalStore((s) => s.tsrs);
  const navMode = useNavMode();
  const orientation = useOrientation();

  // Mobile segmented toggle: 'graph' | 'proposals'
  const [mobilePanel, setMobilePanel] = useState<'graph' | 'proposals'>('graph');

  // Tab state in right / bottom panel
  const [activeTab, setActiveTab] = useState<'proposals' | 'ai' | 'gis'>('proposals');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>('BP-2024-001');

  // Approval Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerProposalId, setDrawerProposalId] = useState<string | null>(null);

  // Orientation hint banner
  const [showRotateHint, setShowRotateHint] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navMode === 'mobile' && orientation === 'portrait') {
      const dismissed = sessionStorage.getItem('rotate_hint_dismissed');
      if (!dismissed) {
        setShowRotateHint(true);
      }
    } else {
      setShowRotateHint(false);
    }
  }, [navMode, orientation]);

  const dismissRotateHint = () => {
    setShowRotateHint(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rotate_hint_dismissed', 'true');
    }
  };

  const selectedProposal = proposals.find((p) => p.proposalId === selectedProposalId) || null;

  const handleSelectProposal = (id: string) => {
    setSelectedProposalId(id);
    if (navMode === 'mobile') {
      // On mobile, tapping a proposal opens the Approval Drawer (bottom sheet)
      setDrawerProposalId(id);
      setIsDrawerOpen(true);
    } else {
      setActiveTab('ai');
    }
  };

  const handleOpenDrawer = (id: string) => {
    setDrawerProposalId(id);
    setIsDrawerOpen(true);
  };

  const isStacked = navMode === 'mobile' || (typeof window !== 'undefined' && window.innerWidth < 1024);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* Orientation Hint Banner for Mobile Portrait */}
      {showRotateHint && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(2, 132, 199, 0.1)',
            border: '1px solid var(--color-accent-operational)',
            borderRadius: 'var(--radius-panel)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCw size={14} style={{ color: 'var(--color-accent-operational)' }} />
            <span>Rotate to landscape for a wider, interactive train graph view</span>
          </div>
          <button
            onClick={dismissRotateHint}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-2) var(--spacing-3)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--color-border-default)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Block Planning &amp; Workspace
          </h1>
          <span style={{ color: 'var(--color-border-strong)' }}>|</span>
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-mono)' }}>
            Ghaziabad – Kanpur Central (412 km)
          </span>
        </div>

        {/* Mobile Segmented Control [ Train Graph | Proposals ] */}
        {navMode === 'mobile' ? (
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-primary)',
              padding: 2,
              borderRadius: 'var(--radius-data)',
              border: '1px solid var(--color-border-default)',
              width: '100%',
              marginTop: 4,
            }}
          >
            <button
              onClick={() => setMobilePanel('graph')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-data)',
                border: 'none',
                background: mobilePanel === 'graph' ? 'var(--color-bg-elevated)' : 'transparent',
                color: mobilePanel === 'graph' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)',
                fontWeight: mobilePanel === 'graph' ? 700 : 500,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: mobilePanel === 'graph' ? 'var(--shadow-default)' : 'none',
                minHeight: '44px',
              }}
            >
              <LineChart size={14} />
              <span>Train Graph</span>
            </button>
            <button
              onClick={() => setMobilePanel('proposals')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-data)',
                border: 'none',
                background: mobilePanel === 'proposals' ? 'var(--color-bg-elevated)' : 'transparent',
                color: mobilePanel === 'proposals' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)',
                fontWeight: mobilePanel === 'proposals' ? 700 : 500,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: mobilePanel === 'proposals' ? 'var(--shadow-default)' : 'none',
                minHeight: '44px',
              }}
            >
              <List size={14} />
              <span>Proposals ({proposals.length})</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Total Trains: <strong style={{ color: 'var(--color-text-primary)' }}>{trains.length}</strong>
            </span>
            <span style={{ color: 'var(--color-border-strong)' }}>|</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Proposals: <strong style={{ color: 'var(--color-accent-warning)' }}>{proposals.length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      {navMode === 'mobile' ? (
        /* Mobile Single-Panel Mode */
        <div style={{ width: '100%' }}>
          {mobilePanel === 'graph' ? (
            <div style={{ height: 'calc(100vh - 240px)', minHeight: 380 }}>
              <MareyDiagram
                trains={trains}
                proposals={proposals}
                selectedProposalId={selectedProposalId}
                onSelectProposal={handleSelectProposal}
              />
            </div>
          ) : (
            <div className="panel" style={{ padding: 'var(--spacing-3)' }}>
              <ProposalList
                proposals={proposals}
                selectedProposalId={selectedProposalId}
                onSelectProposal={handleSelectProposal}
                onOpenDrawer={handleOpenDrawer}
              />
            </div>
          )}
        </div>
      ) : isStacked ? (
        /* Tablet Portrait Stacked Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ height: 340, width: '100%' }}>
            <MareyDiagram
              trains={trains}
              proposals={proposals}
              selectedProposalId={selectedProposalId}
              onSelectProposal={handleSelectProposal}
            />
          </div>

          <div
            className="panel"
            style={{
              padding: 'var(--spacing-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}
          >
            {/* Tab Header Strip */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-default)' }}>
              <button
                onClick={() => setActiveTab('proposals')}
                className={`tab ${activeTab === 'proposals' ? 'tab--active' : ''}`}
                style={{ padding: '8px 14px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <List size={14} />
                <span>Proposals ({proposals.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`tab ${activeTab === 'ai' ? 'tab--active' : ''}`}
                style={{ padding: '8px 14px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Brain size={14} />
                <span>AI Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab('gis')}
                className={`tab ${activeTab === 'gis' ? 'tab--active' : ''}`}
                style={{ padding: '8px 14px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Map size={14} />
                <span>Corridor GIS</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'proposals' && (
              <ProposalList
                proposals={proposals}
                selectedProposalId={selectedProposalId}
                onSelectProposal={handleSelectProposal}
                onOpenDrawer={handleOpenDrawer}
              />
            )}
            {activeTab === 'ai' && (
              <AIAnalysisPanel
                proposal={selectedProposal}
                trains={trains}
              />
            )}
            {activeTab === 'gis' && (
              <CorridorGIS selectedProposal={selectedProposal} tsrs={tsrs} />
            )}
          </div>
        </div>
      ) : (
        /* Desktop (65/35) & Laptop (60/40) Side-by-Side Split */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: navMode === 'desktop' ? '65% 35%' : '60% 40%',
            gap: 'var(--spacing-3)',
            height: 'calc(100vh - 190px)',
            minHeight: 560,
          }}
        >
          {/* Left: Marey Diagram Canvas */}
          <div style={{ height: '100%', minHeight: 0 }}>
            <MareyDiagram
              trains={trains}
              proposals={proposals}
              selectedProposalId={selectedProposalId}
              onSelectProposal={handleSelectProposal}
            />
          </div>

          {/* Right: Tabbed Details Panel */}
          <div
            className="panel"
            style={{
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Tab Header Strip */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-border-default)',
                background: 'var(--color-bg-primary)',
              }}
            >
              <button
                onClick={() => setActiveTab('proposals')}
                className={`tab ${activeTab === 'proposals' ? 'tab--active' : ''}`}
                style={{ flex: 1, padding: '10px 8px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <List size={14} />
                <span>Proposals</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`tab ${activeTab === 'ai' ? 'tab--active' : ''}`}
                style={{ flex: 1, padding: '10px 8px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Brain size={14} />
                <span>AI Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab('gis')}
                className={`tab ${activeTab === 'gis' ? 'tab--active' : ''}`}
                style={{ flex: 1, padding: '10px 8px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Map size={14} />
                <span>Corridor GIS</span>
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-3)' }}>
              {activeTab === 'proposals' && (
                <ProposalList
                  proposals={proposals}
                  selectedProposalId={selectedProposalId}
                  onSelectProposal={handleSelectProposal}
                  onOpenDrawer={handleOpenDrawer}
                />
              )}
              {activeTab === 'ai' && (
                <AIAnalysisPanel
                  proposal={selectedProposal}
                  trains={trains}
                />
              )}
              {activeTab === 'gis' && (
                <CorridorGIS selectedProposal={selectedProposal} tsrs={tsrs} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Approval Drawer Overlay */}
      <ApprovalDrawer
        isOpen={isDrawerOpen}
        proposalId={drawerProposalId}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
