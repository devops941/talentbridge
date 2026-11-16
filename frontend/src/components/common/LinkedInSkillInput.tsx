import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';

interface LinkedInSkillInputProps {
  label: string;
  badgeText?: string;
  placeholder?: string;
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  taxonomySkills: string[];
  theme?: 'teal' | 'indigo';
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const LinkedInSkillInput: React.FC<LinkedInSkillInputProps> = ({
  label,
  badgeText,
  placeholder = 'Type a skill (e.g. Python, React) and press Enter...',
  skills,
  onAddSkill,
  onRemoveSkill,
  taxonomySkills,
  theme = 'teal',
  helperText,
  error,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter taxonomy suggestions based on user input
  const trimmed = inputValue.trim().toLowerCase();
  const suggestions = taxonomySkills.filter(
    (tax) =>
      !skills.some((s) => s.toLowerCase() === tax.toLowerCase()) &&
      (trimmed === '' ? true : tax.toLowerCase().includes(trimmed))
  ).slice(0, 8);

  const canAddCustom =
    trimmed.length > 0 &&
    !skills.some((s) => s.toLowerCase() === trimmed) &&
    !suggestions.some((s) => s.toLowerCase() === trimmed);

  const totalOptionsCount = suggestions.length + (canAddCustom ? 1 : 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (skillName: string) => {
    const clean = skillName.trim();
    if (clean) {
      onAddSkill(clean);
      setInputValue('');
      setIsOpen(false);
      setSelectedIndex(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && totalOptionsCount > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else if (totalOptionsCount > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalOptionsCount);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalOptionsCount > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalOptionsCount) % totalOptionsCount);
      }
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (isOpen && totalOptionsCount > 0) {
        if (selectedIndex < suggestions.length) {
          handleAdd(suggestions[selectedIndex]);
        } else if (canAddCustom) {
          handleAdd(inputValue.trim());
        }
      } else if (inputValue.trim()) {
        handleAdd(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && inputValue === '' && skills.length > 0) {
      e.preventDefault();
      onRemoveSkill(skills[skills.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isTeal = theme === 'teal';
  const tagBg = isTeal ? '#0D9488' : '#4F46E5';
  const tagBorder = isTeal ? '#0F766E' : '#4338CA';
  const badgeSubtleBg = isTeal ? '#CCFBF1' : '#EEF2FF';
  const badgeSubtleText = isTeal ? '#0F766E' : '#4338CA';

  // Popular unadded suggestions to display beneath
  const quickPills = taxonomySkills
    .filter((tax) => !skills.some((s) => s.toLowerCase() === tax.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="mb-3" ref={containerRef}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label small fw-semibold text-dark m-0">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {badgeText && (
          <span
            className="badge rounded-pill fw-medium small"
            style={{ backgroundColor: badgeSubtleBg, color: badgeSubtleText, fontSize: '11px' }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* LinkedIn Multi-Tag Input Box */}
      <div
        className={`form-control d-flex flex-wrap align-items-center gap-1 p-2 position-relative ${
          error ? 'border-danger' : ''
        }`}
        style={{
          minHeight: '48px',
          cursor: 'text',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: isOpen ? '0 0 0 3px rgba(13, 148, 136, 0.15)' : 'none',
          borderColor: isOpen ? (isTeal ? '#0D9488' : '#4F46E5') : (error ? '#DC2626' : '#D1D5DB'),
          transition: 'all 0.15s ease-in-out',
        }}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
            setIsOpen(true);
          }
        }}
      >
        {/* Chips inside the search bar */}
        {skills.map((skill) => (
          <span
            key={skill}
            className="d-inline-flex align-items-center gap-1 px-2 py-1 text-white rounded-pill fw-medium animate__animated animate__fadeIn"
            style={{
              backgroundColor: tagBg,
              borderColor: tagBorder,
              fontSize: '12.5px',
              letterSpacing: '0.2px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
          >
            <span>{skill}</span>
            <button
              type="button"
              className="btn btn-link p-0 text-white d-inline-flex align-items-center"
              style={{
                textDecoration: 'none',
                opacity: 0.85,
                lineHeight: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSkill(skill);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
              title={`Remove ${skill}`}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </span>
        ))}

        {/* Inline Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="border-0 bg-transparent flex-grow-1 p-1 small"
          style={{
            outline: 'none',
            minWidth: '160px',
            color: '#1F2937',
            fontSize: '13.5px',
          }}
          placeholder={skills.length === 0 ? placeholder : 'Add more skills...'}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Autocomplete Dropdown Menu (LinkedIn Style) */}
        {isOpen && (suggestions.length > 0 || canAddCustom) && (
          <div
            className="position-absolute bg-white rounded-3 shadow-lg border start-0 end-0 overflow-hidden"
            style={{
              top: '100%',
              marginTop: '4px',
              zIndex: 1050,
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            <div className="px-3 py-1 bg-light border-bottom text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>
              SUGGESTED SKILLS (Press Enter or Click to add)
            </div>

            {suggestions.map((sug, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={sug}
                  className="px-3 py-2 d-flex justify-content-between align-items-center cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? (isTeal ? '#F0FDFA' : '#EEF2FF') : 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(sug);
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={14} color={isTeal ? '#0D9488' : '#4F46E5'} />
                    <span className="fw-semibold text-dark">{sug}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>Taxonomy</span>
                  </div>
                  <span className="text-muted small">
                    <Plus size={14} />
                  </span>
                </div>
              );
            })}

            {canAddCustom && (
              <div
                className="px-3 py-2 d-flex justify-content-between align-items-center border-top cursor-pointer"
                style={{
                  backgroundColor: selectedIndex === suggestions.length ? (isTeal ? '#F0FDFA' : '#EEF2FF') : '#FAF5FF',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(inputValue.trim());
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <Plus size={14} color={isTeal ? '#0D9488' : '#4F46E5'} />
                  <span>
                    Add <strong>"{inputValue.trim()}"</strong> as custom skill
                  </span>
                </div>
                <span className="badge bg-secondary-subtle text-secondary small">Custom</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation error message */}
      {error && <div className="text-danger small mt-1">⚠️ {error}</div>}

      {/* Helper text */}
      {helperText && !error && <div className="text-muted small mt-1">{helperText}</div>}

      {/* Quick suggested pills underneath */}
      {quickPills.length > 0 && (
        <div className="d-flex align-items-center gap-1 mt-2 flex-wrap">
          <span className="text-muted" style={{ fontSize: '11.5px' }}>Popular suggestions:</span>
          {quickPills.map((p) => (
            <button
              key={p}
              type="button"
              className="btn btn-sm py-0 px-2 rounded-pill small border bg-light text-secondary"
              style={{ fontSize: '11px' }}
              onClick={() => handleAdd(p)}
            >
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
