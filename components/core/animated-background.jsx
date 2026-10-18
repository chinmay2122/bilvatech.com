'use client';

import React, {
  Children,
  cloneElement,
  useEffect,
  useState,
  useId,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className = 'bg-[#1b1b1e] border border-white/10',
  transition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.6,
  },
  enableHover = false,
}) {
  const [activeId, setActiveId] = useState(defaultValue || null);
  const uniqueId = useId();

  const handleSetActiveId = (id) => {
    setActiveId(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      child,
      {
        key: id || index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0 rounded-none', className)}
              style={{ borderRadius: 0 }}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 w-full">{child.props.children}</div>
      </>
    );
  });
}

export default AnimatedBackground;
