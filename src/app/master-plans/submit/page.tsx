'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'rarely';
type SubmissionKind = '' | 'new-idea' | 'existing-plan';

interface MasterProject {
  id: string;
  name: string;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'rarely', label: 'Rarely' },
];

export default function SubmitProblemPage() {
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [kind, setKind] = useState<SubmissionKind>('');
  const [targetPlan, setTargetPlan] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [workaround, setWorkaround] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/master-projects')
      .then(r => r.json() as Promise<MasterProject[]>)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!kind || !name.trim() || !title.trim() || !problem.trim()) return;
    if (kind === 'existing-plan' && !targetPlan) return;
    setSubmitting(true);
    setError(null);

    const bodyParts = [
      problem.trim(),
      '',
      `**Submission type:** ${kind === 'new-idea' ? 'New idea / new master plan' : 'Feature request for existing plan'}`,
      `**Frequency:** ${frequency}`,
    ];
    if (workaround.trim()) {
      bodyParts.push(`**Current workaround:** ${workaround.trim()}`);
    }
    if (email.trim()) {
      bodyParts.push(`**Email:** ${email.trim()}`);
    }

    const res = await fetch('/api/feedback-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'intake-form',
        author: name.trim(),
        title: title.trim(),
        body: bodyParts.join('\n'),
        category: 'feature-request',
        projectId: kind === 'existing-plan' ? targetPlan : null,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError('Something went wrong. Try again or ping Peggy directly.');
    }
  }

  function reset() {
    setKind('');
    setTargetPlan('');
    setName('');
    setEmail('');
    setTitle('');
    setProblem('');
    setWorkaround('');
    setFrequency('weekly');
    setSubmitted(false);
    setError(null);
  }

  if (submitted) {
    return <SuccessPanel onReset={reset} />;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/master-plans" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
          &larr; Master Plans
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '8px 0 4px' }}>
          Submit a problem
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Got a workflow headache or a tool you wish existed? Drop it here. Peggy triages the inbox and decides whether it becomes its own master plan or a feature of an existing one.
        </p>
      </div>

      <form onSubmit={e => void submit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            What is this? *
          </label>
          <select
            value={kind}
            onChange={e => setKind(e.target.value as SubmissionKind)}
            required
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, background: '#fff' }}
          >
            <option value="">Pick one...</option>
            <option value="existing-plan">Feature request for an existing master plan</option>
            <option value="new-idea">New idea (could be its own master plan)</option>
          </select>
        </div>

        {kind === 'existing-plan' && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Which master plan? *
            </label>
            <select
              value={targetPlan}
              onChange={e => setTargetPlan(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, background: '#fff' }}
            >
              <option value="">Pick a plan...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your name *" value={name} onChange={setName} placeholder="Jane Doe" required />
          <Field label="Email" value={email} onChange={setEmail} placeholder="jane@aceable.com" type="email" />
        </div>

        <Field label="Title *" value={title} onChange={setTitle} placeholder="Short summary of the problem" required />

        <TextArea
          label="What's the problem? *"
          value={problem}
          onChange={setProblem}
          placeholder="Describe what hurts. What are you trying to do, and what's getting in the way?"
          rows={5}
          required
        />

        <TextArea
          label="Current workaround"
          value={workaround}
          onChange={setWorkaround}
          placeholder="How are you solving this today (if at all)?"
          rows={3}
        />

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            How often does this hurt?
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FREQUENCIES.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                style={{
                  padding: '6px 14px', fontSize: 13, fontWeight: 600,
                  color: frequency === f.value ? '#fff' : '#374151',
                  background: frequency === f.value ? '#4f46e5' : '#f3f4f6',
                  border: 'none', borderRadius: 99, cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, fontSize: 13, color: '#991b1b' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {(() => {
            const disabled =
              submitting ||
              !kind ||
              (kind === 'existing-plan' && !targetPlan) ||
              !name.trim() ||
              !title.trim() ||
              !problem.trim();
            return (
              <button
                type="submit"
                disabled={disabled}
                style={{
                  padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff',
                  background: disabled ? '#d1d5db' : '#4f46e5',
                  border: 'none', borderRadius: 8,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit problem'}
              </button>
            );
          })()}
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder, rows = 4, required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
      />
    </div>
  );
}

interface CurrentCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  const [cycle, setCycle] = useState<CurrentCycle | null>(null);
  const [entryCount, setEntryCount] = useState<number | null>(null);

  useEffect(() => {
    void fetch('/api/cycles/current')
      .then(r => r.json() as Promise<{ cycle: CurrentCycle | null }>)
      .then(({ cycle: c }) => {
        setCycle(c);
        if (c) {
          void fetch(`/api/cycles/${c.id}/drawing-entries`)
            .then(r => r.json() as Promise<{ count: number }>)
            .then(({ count }) => setEntryCount(count))
            .catch(() => setEntryCount(null));
        }
      })
      .catch(() => setCycle(null));
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)', border: '1px solid #c4b5fd', borderRadius: 12, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>🎟️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#5b21b6', margin: 0 }}>You&rsquo;re entered to win!</h1>
        {cycle && entryCount !== null ? (
          <p style={{ fontSize: 14, color: '#5b21b6', marginTop: 12, lineHeight: 1.6 }}>
            You&rsquo;re entry <strong>#{entryCount}</strong> in the <strong>{cycle.name}</strong> drawing.
            One submitter wins a custom theme song about their problem at the end of this cycle ({new Date(cycle.end_date).toLocaleDateString()}).
            <br />
            <span style={{ fontSize: 13, color: '#7c3aed' }}>More submissions = more chances to win.</span>
          </p>
        ) : (
          <p style={{ fontSize: 14, color: '#5b21b6', marginTop: 12, lineHeight: 1.6 }}>
            Your problem landed in the triage queue. Each submission is one entry in the cycle drawing — one submitter wins a custom theme song about their problem.
          </p>
        )}
        <p style={{ fontSize: 12, color: '#7c3aed', marginTop: 12, fontStyle: 'italic' }}>
          Bonus: if your problem makes it onto the roadmap and ships, we&rsquo;ll send you a custom celebration card.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={onReset} style={{
            padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#fff',
            background: '#7c3aed', border: 'none', borderRadius: 8, cursor: 'pointer',
          }}>
            Submit another problem
          </button>
          <Link href="/master-plans" style={{
            padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#374151',
            background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, textDecoration: 'none',
          }}>
            Back to Master Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
