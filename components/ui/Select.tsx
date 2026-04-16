'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  searchable?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = '— select —',
  className = '',
  style,
  disabled,
  searchable = true,
}: SelectProps) {
  const [open, setOpen]               = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  const filtered = searchable && searchQuery.trim()
    ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const ITEM_H    = 42;
  const SEARCH_H  = 52; // search input row height
  const MAX_ITEMS = 6;  // visible rows before scroll

  const positionDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect        = triggerRef.current.getBoundingClientRect();
    const listH       = Math.min(MAX_ITEMS, filtered.length) * ITEM_H;
    const totalH      = (searchable ? SEARCH_H : 0) + listH + 8;
    const spaceBelow  = window.innerHeight - rect.bottom;
    const openAbove   = spaceBelow < totalH && rect.top > totalH;

    setDropdownStyle({
      position: 'fixed',
      left:     rect.left,
      width:    rect.width,
      zIndex:   99999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [filtered.length, searchable]);

  const handleOpen = () => {
    if (disabled) return;
    positionDropdown();
    setOpen(v => !v);
  };

  // Auto-focus search on open; reset search on close
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
    } else {
      setSearchQuery('');
    }
  }, [open]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const update = () => positionDropdown();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, positionDropdown]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current  && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const selected      = options.find(o => o.value === value);
  const displayLabel  = selected?.label ?? placeholder;
  const isPlaceholder = !selected;

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        ...dropdownStyle,
        background:          'rgba(14,14,14,0.98)',
        border:              '1px solid rgba(255,255,255,0.1)',
        borderRadius:        12,
        boxShadow:           '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)',
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        overflow:            'hidden',
        animation:           'csel-in 0.13s ease',
        display:             'flex',
        flexDirection:       'column',
      }}
    >
      {/* ── Search input ── */}
      {searchable && (
        <div style={{
          padding:      '0.55rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink:   0,
        }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && filtered.length === 1) {
                  onChange(filtered[0].value);
                  setOpen(false);
                }
              }}
              placeholder="Search…"
              style={{
                width:           '100%',
                background:      'rgba(255,255,255,0.05)',
                border:          '1px solid rgba(255,255,255,0.09)',
                borderRadius:    8,
                padding:         '0.45rem 0.65rem 0.45rem 30px',
                fontSize:        '0.8rem',
                color:           'rgba(255,255,255,0.8)',
                outline:         'none',
                boxSizing:       'border-box',
                fontFamily:      'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            />
          </div>
        </div>
      )}

      {/* ── Options list (scrollable, no visible scrollbar) ── */}
      <div
        className="csel-list"
        style={{
          overflowY:  'auto',
          maxHeight:  MAX_ITEMS * ITEM_H,
          flexShrink: 1,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
            No results
          </div>
        ) : (
          filtered.map(opt => {
            const isActive = opt.value === value;
            return (
              <div
                key={opt.value}
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '0.72rem 1rem',
                  fontSize:       '0.84rem',
                  cursor:         'pointer',
                  borderBottom:   '1px solid rgba(255,255,255,0.04)',
                  color:          isActive ? '#C9A84C' : 'rgba(255,255,255,0.65)',
                  background:     isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                  transition:     'background 0.12s ease, color 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLDivElement).style.color      = 'rgba(255,255,255,0.9)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color      = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {opt.label}
                </span>
                {isActive && (
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}>
                    <path d="M1 5L4.5 8.5L12 1" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <style>{`
        @keyframes csel-in {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Hide scrollbar in all browsers while keeping scroll */
        .csel-list::-webkit-scrollbar { display: none; }
        .csel-list { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div className={className} style={{ position: 'relative', ...style }}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            width:          '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            background:     open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)',
            border:         `1px solid ${open ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.09)'}`,
            borderRadius:   10,
            padding:        '0.7rem 0.9rem 0.7rem 1rem',
            fontSize:       '0.84rem',
            cursor:         disabled ? 'not-allowed' : 'pointer',
            outline:        'none',
            transition:     'border-color 0.2s ease, background 0.2s ease',
            textAlign:      'left',
            boxSizing:      'border-box',
            fontFamily:     'inherit',
            userSelect:     'none',
            opacity:        disabled ? 0.4 : 1,
            color:          isPlaceholder ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)',
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayLabel}
          </span>
          <svg
            width="11" height="7" viewBox="0 0 11 7" fill="none"
            style={{
              flexShrink: 0,
              marginLeft: '0.65rem',
              color:      'rgba(201,168,76,0.7)',
              transform:  open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="M1 1L5.5 6L10 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
      </div>
    </>
  );
}
