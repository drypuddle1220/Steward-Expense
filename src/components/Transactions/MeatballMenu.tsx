import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react'; // Changed from MoreVertical
import styles from './MeatballMenu.module.css';

interface MeatballMenuProps {
  options: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
  }[];
}

const MeatballMenu: React.FC<MeatballMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.meatballMenu} ref={menuRef}>
      <button 
        className={styles.meatballButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className={styles.menuDropdown}>
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className={`${styles.menuItem} ${option.variant === 'danger' ? styles.danger : ''}`}
            >
              {option.icon && <span className={styles.menuItemIcon}>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeatballMenu;