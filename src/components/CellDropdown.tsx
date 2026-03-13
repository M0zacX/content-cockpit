"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface CellDropdownOption {
  value: string;
  label: string;
  dot?: string;       // colored dot class (category)
  bg?: string;        // pill bg class
  textCls?: string;   // pill text class
  icon?: string;      // emoji icon (status)
}

export default function CellDropdown({
  value, options, onChange, onFocus, dataCellId, pillBg, pillText, disabled = false, searchable = false,
}: {
  value: string;
  options: CellDropdownOption[];
  onChange: (v: string) => void;
  onFocus?: () => void;
  dataCellId?: string;
  pillBg: string;
  pillText: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable && search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Position dropdown using fixed coordinates
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open]);

  // Reset highlight + search when opened; auto-focus search
  useEffect(() => {
    if (open) {
      setSearch("");
      const idx = filteredOptions.findIndex(o => o.value === value);
      setHighlightIdx(idx >= 0 ? idx : 0);
      if (searchable) setTimeout(() => searchRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
        return;
      }
      return;
    }

    e.stopPropagation();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(i => (i + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(i => (i - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filteredOptions.length) {
        onChange(filteredOptions[highlightIdx].value);
      }
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const current = options.find(o => o.value === value);

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown} className="flex justify-center">
      <button
        ref={triggerRef}
        data-cell={dataCellId}
        type="button"
        onClick={() => { if (!disabled) { setOpen(o => !o); onFocus?.(); } }}
        onFocus={() => onFocus?.()}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 max-w-full overflow-hidden whitespace-nowrap ${pillBg} ${pillText} ${disabled ? "cursor-default" : "cursor-pointer"}`}
      >
        {current?.icon && <span className="text-xs">{current.icon}</span>}
        {current?.dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
        <span className="truncate">{current?.label || value}</span>
        <svg className={`w-3 h-3 opacity-40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && dropPos && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className={`fixed dropdown-menu rounded-xl animate-slide-up overflow-hidden ${searchable ? "w-52" : "w-44 py-1"}`}
            style={{ top: dropPos.top, left: dropPos.left, zIndex: 9999 }}
          >
            {searchable && (
              <div className="px-2 pt-2 pb-1.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-input-bg border border-border">
                  <svg className="w-3.5 h-3.5 text-text3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/></svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-text3 outline-none min-w-0"
                  />
                </div>
              </div>
            )}
            <div className={searchable ? "pb-1.5" : ""}>
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-xs text-text3 text-center">No results</p>
              )}
              {filteredOptions.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseEnter={() => setHighlightIdx(i)}
                  onClick={() => { onChange(opt.value); setOpen(false); triggerRef.current?.focus(); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2
                    ${i === highlightIdx ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"}
                    ${opt.value === value ? "font-bold" : ""}
                  `}
                >
                  {opt.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />}
                  {opt.icon && <span className="text-sm">{opt.icon}</span>}
                  {opt.label}
                  {opt.value === value && (
                    <svg className="w-3.5 h-3.5 ml-auto text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
