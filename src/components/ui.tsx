import type { ReactNode } from 'react';
import type { ContentItem, ContentStatus, FilterResult } from '../core/types';
import { formatDuration } from '../core/utils';

export function BigButton({
  emoji, label, sub, onClick, variant = 'primary', disabled = false,
}: {
  emoji?: string; label: string; sub?: string; onClick: () => void;
  variant?: 'primary' | 'soft' | 'quiet' | 'danger' | 'warm'; disabled?: boolean;
}) {
  return (
    <button type="button" className={`big-button ${variant}`} onClick={onClick} disabled={disabled}>
      {emoji && <span className="big-emoji" aria-hidden="true">{emoji}</span>}
      <span className="big-label">{label}</span>
      {sub && <span className="big-sub">{sub}</span>}
    </button>
  );
}

export function SmallButton({
  children, onClick, variant = 'soft', disabled = false, title,
}: {
  children: ReactNode; onClick: () => void; variant?: 'soft' | 'primary' | 'quiet' | 'danger';
  disabled?: boolean; title?: string;
}) {
  return (
    <button type="button" className={`small-button ${variant}`} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function ScreenTitle({ title, subtitle, emoji }: { title: string; subtitle?: string; emoji?: string }) {
  return (
    <header className="screen-title">
      {emoji && <span className="title-emoji" aria-hidden="true">{emoji}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

export function Section({ title, note, children, right }: {
  title: string; note?: string; children: ReactNode; right?: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {right}
      </div>
      {note && <p className="section-note">{note}</p>}
      {children}
    </section>
  );
}

export function Note({ children, tone = 'calm' }: { children: ReactNode; tone?: 'calm' | 'warn' | 'info' }) {
  return <p className={`note ${tone}`}>{children}</p>;
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const labels = { adapte: '🟢 Probablement adapté', 'a-verifier': '🟠 À vérifier', bloque: '🔴 Bloqué' };
  return <span className={`status-badge ${status}`}>{labels[status]}</span>;
}

export function ContentCard({
  item, evaluation, onClick, favorite, onFavorite, compact = false, footer,
}: {
  item: ContentItem; evaluation?: FilterResult; onClick: () => void;
  favorite?: boolean; onFavorite?: () => void; compact?: boolean; footer?: ReactNode;
}) {
  const blocked = evaluation?.status === 'bloque';
  return (
    <article className={`content-card ${compact ? 'compact' : ''} ${blocked ? 'is-blocked' : ''}`}>
      <button type="button" className="content-card-main" onClick={onClick} aria-label={`Ouvrir ${item.simpleTitle}`}>
        <span className="thumb" style={{ background: item.color }} aria-hidden="true">{item.emoji}</span>
        <span className="content-card-text">
          <strong>{item.simpleTitle}</strong>
          <span className="card-meta">
            {item.kind === 'video' || item.kind === 'music' ? `${formatDuration(item.durationSec)} · ` : ''}{item.site}
          </span>
          {evaluation && <StatusBadge status={evaluation.status} />}
        </span>
      </button>
      {(onFavorite || evaluation || footer) && (
        <div className="content-card-foot">
          {evaluation && blocked && <span className="blocked-hint">Cette vidéo n’est pas disponible.</span>}
          {footer}
          {onFavorite && (
            <SmallButton variant="quiet" onClick={onFavorite} title="Ajouter ou retirer des favoris">
              {favorite ? '⭐ Dans mes favoris' : '☆ Ajouter aux favoris'}
            </SmallButton>
          )}
        </div>
      )}
    </article>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label"><span>{label}</span><span>{Math.round(percent)} %</span></div>}
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (value: boolean) => void;
}) {
  return (
    <button type="button" className="toggle-row" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span className="toggle-text"><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <span className={`toggle-track ${checked ? 'on' : ''}`} aria-hidden="true"><span className="toggle-knob" /></span>
    </button>
  );
}

export function Field({ label, value, onChange, placeholder, type = 'text', min, max }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
  type?: string; min?: string; max?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} min={min} max={max} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { id: T; label: string; hint?: string }[]; onChange: (value: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button key={option.id} type="button" className={value === option.id ? 'active' : ''}
          onClick={() => onChange(option.id)}>
          <strong>{option.label}</strong>
          {option.hint && <small>{option.hint}</small>}
        </button>
      ))}
    </div>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  if (!onClick) return <span className={`chip ${active ? 'active' : ''}`}>{children}</span>;
  return <button type="button" className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>;
}

export function EmptyState({ emoji, title, text, action, children }: {
  emoji: string; title: string; text: string; action?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">{emoji}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="stat-card">
      <small>{label}</small>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function TagList({ items, onRemove, emptyText }: {
  items: string[]; onRemove: (value: string) => void; emptyText: string;
}) {
  if (!items.length) return <p className="muted">{emptyText}</p>;
  return (
    <div className="tag-list">
      {items.map((item) => (
        <span className="tag" key={item}>{item}
          <button type="button" aria-label={`Retirer ${item}`} onClick={() => onRemove(item)}>×</button>
        </span>
      ))}
    </div>
  );
}
