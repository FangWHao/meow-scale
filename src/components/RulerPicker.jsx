import React, { useRef, useEffect, useState } from 'react';

const RulerPicker = ({ value, onChange, min = 30, max = 150, step = 0.1 }) => {
    const scrollRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Number of steps
    const stepsCount = Math.round((max - min) / step);
    const stepWidth = 10; // px per tick

    useEffect(() => {
        if (scrollRef.current && !isScrolling) {
            const initialScroll = (value - min) / step * stepWidth;
            scrollRef.current.scrollLeft = initialScroll;
        }
    }, [value, min, step, stepWidth]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        setIsScrolling(true);
        const scrollLeft = scrollRef.current.scrollLeft;
        const newValue = min + (scrollLeft / stepWidth) * step;
        const roundedValue = Math.round(newValue * 10) / 10;

        if (roundedValue !== value && roundedValue >= min && roundedValue <= max) {
            onChange(roundedValue);
        }
    };

    const handleScrollEnd = () => {
        setIsScrolling(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%', padding: '20px 0' }}>
            {/* Center Pointer */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: 'unset',
                bottom: '15px',
                height: '40px',
                width: '4px',
                background: 'var(--color-primary)',
                transform: 'translateX(-50%)',
                zIndex: 2,
                borderRadius: '2px',
                pointerEvents: 'none'
            }} />

            {/* Value Display */}
            <div style={{
                textAlign: 'center',
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--color-primary)',
                marginBottom: '10px'
            }}>
                {value.toFixed(1)} <span style={{ fontSize: '1.2rem' }}>kg</span>
            </div>

            {/* Scrollable Ruler */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onScrollEnd={handleScrollEnd} // Some browsers support this, or we can use a timeout
                style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    padding: '0 50%', // Fade in from center
                    scrollbarWidth: 'none', // Hide scrollbar for Firefox
                    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: '60px',
                    maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    {Array.from({ length: stepsCount + 1 }).map((_, i) => {
                        const val = min + i * step;
                        const isMain = i % 10 === 0;
                        const isHalf = i % 5 === 0;

                        return (
                            <div key={i} style={{
                                width: `${stepWidth}px`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    width: isMain ? '2px' : '1px',
                                    height: isMain ? '30px' : (isHalf ? '20px' : '12px'),
                                    background: isMain ? '#6A5D5D' : '#9E9E9E',
                                    borderRadius: '1px'
                                }} />
                                {isMain && (
                                    <span style={{ fontSize: '0.7rem', color: '#9E9E9E', marginTop: '4px' }}>
                                        {val}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default RulerPicker;
