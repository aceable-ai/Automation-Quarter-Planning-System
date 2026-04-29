import {
  Q2C2_INVENTORY,
  SECTION_ORDER,
  SECTION_COLORS,
  type InventorySection,
} from '@/lib/q2c2-inventory';
import { InventoryTable } from '@/components/inventory-table';

const HOURS_PER_FTE = 160;
const TOP_N = 10;

export default function PortfolioDashboardPage() {
  const totalHours = Q2C2_INVENTORY.reduce((sum, e) => sum + (e.hoursPerMonth ?? 0), 0);
  const totalEntries = Q2C2_INVENTORY.length;
  const activeEntries = Q2C2_INVENTORY.filter(e => (e.hoursPerMonth ?? 0) > 0).length;
  const fte = totalHours / HOURS_PER_FTE;

  const sectionTotals: Array<{ section: InventorySection; hours: number }> = SECTION_ORDER.map(
    section => ({
      section,
      hours: Q2C2_INVENTORY
        .filter(e => e.section === section)
        .reduce((sum, e) => sum + (e.hoursPerMonth ?? 0), 0),
    })
  );
  const maxSectionHours = Math.max(...sectionTotals.map(s => s.hours), 1);

  const topWorkflows = [...Q2C2_INVENTORY]
    .filter(e => (e.hoursPerMonth ?? 0) > 0)
    .sort((a, b) => (b.hoursPerMonth ?? 0) - (a.hoursPerMonth ?? 0))
    .slice(0, TOP_N);
  const maxTopHours = topWorkflows[0]?.hoursPerMonth ?? 1;

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Marketing Automation
        </h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
          Operating leverage from automated marketing ops, Q2 2026 Cycle 2. Every entry below is a
          measured number against an hours-saved-per-month KPI.
        </p>

        {/* KPI cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 20,
            marginTop: 24,
          }}
        >
          <KpiCard
            label="TOTAL HOURS SAVED PER MONTH"
            value={String(totalHours)}
            sub={`Across ${totalEntries} inventory entries`}
            topColor="#5BB8C9"
          />
          <KpiCard
            label="FTE-EQUIVALENT"
            value={fte.toFixed(1)}
            sub={`Hours ÷ ${HOURS_PER_FTE}/mo`}
            topColor="#E94B7B"
            valueColor="#22c55e"
          />
          <KpiCard
            label="ACTIVE WORKFLOWS"
            value={String(activeEntries)}
            sub={`Of ${totalEntries} total inventory entries`}
            topColor="#0f172a"
          />
        </div>

        {/* By section */}
        <Card title="HOURS SAVED PER MONTH, BY SECTION" style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${sectionTotals.length}, minmax(0, 1fr))`,
              gap: 16,
              alignItems: 'end',
              height: 320,
              padding: '16px 8px 0 8px',
            }}
          >
            {sectionTotals.map(({ section, hours }) => {
              const heightPct = (hours / maxSectionHours) * 100;
              return (
                <div
                  key={section}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}
                >
                  <div
                    style={{
                      flex: 1,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      title={`${hours}h`}
                      style={{
                        height: `${heightPct}%`,
                        background: SECTION_COLORS[section],
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: -22,
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontSize: 12,
                          color: '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {hours}h
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: '#475569',
                      textAlign: 'center',
                    }}
                  >
                    {section}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top workflows */}
        <Card title={`TOP ${TOP_N} WORKFLOWS BY HOURS SAVED PER MONTH`} style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 4px' }}>
            {topWorkflows.map(entry => {
              const pct = ((entry.hoursPerMonth ?? 0) / maxTopHours) * 100;
              return (
                <div key={entry.name} style={{ display: 'grid', gridTemplateColumns: '280px 1fr 60px', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#334155',
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={entry.name}
                  >
                    {entry.name}
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: SECTION_COLORS[entry.section],
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {entry.hoursPerMonth}h
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory table */}
        <Card title="FULL INVENTORY" style={{ marginTop: 24 }}>
          <InventoryTable />
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  topColor,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  topColor: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
        borderTop: `4px solid ${topColor}`,
        padding: '20px 24px',
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 0.4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: valueColor ?? '#0f172a', marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Card({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
        padding: '20px 24px',
        ...style,
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 0.4, fontWeight: 600, marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

