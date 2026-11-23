import { useId, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Icon } from '../media/Icon';
import { cx } from '../lib/cx';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Controlled open id (one open at a time); uncontrolled when omitted. */
  openId?: string | null;
  onOpenChange?: (id: string | null) => void;
  className?: string;
}

/** Phone FAQ accordion, one open at a time, with disclosure semantics. */
export function Accordion({ items, openId, onOpenChange, className }: AccordionProps): JSX.Element {
  const [internal, setInternal] = useState<string | null>(null);
  const baseId = useId();
  const open = openId !== undefined ? openId : internal;
  const setOpen = (id: string | null): void => {
    if (onOpenChange) onOpenChange(id);
    if (openId === undefined) setInternal(id);
  };
  return (
    <div className={cx('hues-accordion', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id} className="hues-accordion__item" data-open={isOpen || undefined}>
            <h3 className="hues-accordion__heading">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="hues-accordion__trigger"
              >
                <span>{item.question}</span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="hues-accordion__panel">
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
