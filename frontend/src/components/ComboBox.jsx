import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ComboBox.module.css';

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

export default function ComboBox({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select',
  icon = null,
  className = '',
  inputRef = null,
}) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideRoot = rootRef.current?.contains(event.target);
      const clickedInsidePanel = panelRef.current?.contains(event.target);

      if (!clickedInsideRoot && !clickedInsidePanel) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !rootRef.current) return;

    const syncPosition = () => {
      const rect = rootRef.current.getBoundingClientRect();
      setPanelStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    syncPosition();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);

    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const query = normalize(value);
    if (!query) return options;
    return options.filter((option) => normalize(option).includes(query));
  }, [options, value]);

  const handleSelect = (option) => {
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`${styles.combo} ${className}`}>
      <div className={styles.inputShell}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            onChange?.(event.target.value);
            setIsOpen(true);
          }}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle options"
        >
          ▾
        </button>
      </div>

      {isOpen && panelStyle
        ? createPortal(
            <>
              <button
                type="button"
                className={styles.backdrop}
                aria-label="Close options"
                onClick={() => setIsOpen(false)}
              />
              <div className={styles.panel} style={panelStyle}>
                <div ref={panelRef}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.option} ${normalize(option) === normalize(value) ? styles.optionActive : ''}`}
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className={styles.empty}>No matches</div>
                )}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
