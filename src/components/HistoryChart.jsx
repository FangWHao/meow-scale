import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const HistoryChart = ({ userData = [], partnerData = [], title, onViewDetails }) => {
    const { isDark } = useTheme();
    const [view, setView] = React.useState('weight');
    const [timeRange, setTimeRange] = React.useState('all'); // 'all', '30', '90', 'custom'
    const [customStartDate, setCustomStartDate] = React.useState('');
    const [customEndDate, setCustomEndDate] = React.useState('');
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [pinkIcons, setPinkIcons] = React.useState([]);
    const [blueIcons, setBlueIcons] = React.useState([]);

    // Memoize random assignments to prevent jitter on re-render
    const [userIconIndices, setUserIconIndices] = React.useState([]);
    const [partnerIconIndices, setPartnerIconIndices] = React.useState([]);

    React.useEffect(() => {
        const createCatIcon = (color, rotation = 0) => {
            // 使用 lucide Cat 图标的 SVG 路径
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <g transform="rotate(${rotation} 12 12)">
                        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/>
                        <path d="M9 14h.01"/>
                        <path d="M15 14h.01"/>
                        <path d="M10 17a3.5 3.5 0 0 0 4 0"/>
                    </g>
                </svg>
            `;
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svg.trim());
            return img;
        };

        const rotations = [0, 12, -12, 8, -8, 5, -5];
        setPinkIcons(rotations.map(r => createCatIcon('#FFB7B2', r)));
        setBlueIcons(rotations.map(r => createCatIcon('#5FD4A8', r)));
    }, []);

    // Stabilize icon assignments when data length changes
    React.useEffect(() => {
        if (userData.length > 0) {
            setUserIconIndices(userData.map(() => Math.floor(Math.random() * 7)));
        }
        if (partnerData.length > 0) {
            setPartnerIconIndices(partnerData.map(() => Math.floor(Math.random() * 7)));
        }
    }, [userData.length, partnerData.length]);

    if ((!userData || userData.length === 0) && (!partnerData || partnerData.length === 0)) {
        return <p style={{ textAlign: 'center', color: '#BBB', padding: '20px' }}>还没有数据哦 ~ 🐾</p>;
    }

    // Filter data based on time range
    const filterByTimeRange = (data) => {
        if (timeRange === 'all') return data;

        const now = new Date();
        let startDate;

        if (timeRange === '30') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (timeRange === '90') {
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        } else if (timeRange === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            return data.filter(d => {
                const date = new Date(d.timestamp);
                return date >= startDate && date <= endDate;
            });
        } else {
            return data;
        }

        return data.filter(d => new Date(d.timestamp) >= startDate);
    };

    const filteredUserData = filterByTimeRange(userData);
    const filteredPartnerData = filterByTimeRange(partnerData);

    const allDates = Array.from(new Set([
        ...filteredUserData.map(d => format(new Date(d.timestamp), 'MM-dd')),
        ...filteredPartnerData.map(d => format(new Date(d.timestamp), 'MM-dd'))
    ])).sort();

    const getDataForDates = (data, field) => {
        return allDates.map(date => {
            const match = data.find(d => format(new Date(d.timestamp), 'MM-dd') === date);
            return match ? match[field] : null;
        });
    };

    const getAssignedIcons = (data, field, icons, indices) => {
        if (!icons || icons.length === 0) return null;
        return allDates.map((date, i) => {
            const dataIndex = data.findIndex(d => format(new Date(d.timestamp), 'MM-dd') === date);
            if (dataIndex === -1) return icons[0]; // Default icon if no data for this date
            return icons[indices[dataIndex] % icons.length] || icons[0];
        });
    };

    const chartData = {
        labels: allDates,
        datasets: [
            {
                label: view === 'weight' ? '我的体重' : '我的 BMI',
                data: getDataForDates(filteredUserData, view),
                borderColor: '#FFB7B2',
                backgroundColor: 'rgba(255, 183, 178, 0.2)',
                tension: 0.4,
                spanGaps: true,
                pointStyle: getAssignedIcons(filteredUserData, view, pinkIcons, userIconIndices),
                pointRadius: 10,
                pointHoverRadius: 12,
            },
            filteredPartnerData.length > 0 && {
                label: view === 'weight' ? '伴侣体重' : '伴侣 BMI',
                data: getDataForDates(filteredPartnerData, view),
                borderColor: '#5FD4A8',
                backgroundColor: 'rgba(95, 212, 168, 0.2)',
                tension: 0.4,
                spanGaps: true,
                pointStyle: getAssignedIcons(filteredPartnerData, view, blueIcons, partnerIconIndices),
                pointRadius: 10,
                pointHoverRadius: 12,
            }
        ].filter(Boolean),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    font: { size: 12 },
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#6A5D5D',
                bodyColor: '#6A5D5D',
                borderColor: '#EEE',
                borderWidth: 1,
                padding: 10,
                usePointStyle: true,
            },
        },
        scales: {
            y: {
                grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: isDark ? '#a0a0a0' : '#9E9E9E' }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: isDark ? '#a0a0a0' : '#9E9E9E',
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    autoSkipPadding: 20,
                    callback: function (value, index, ticks) {
                        const totalLabels = allDates.length;
                        let skipInterval = 1;

                        // 智能调整显示间隔
                        if (totalLabels > 60) {
                            skipInterval = 15; // 超过60个数据点，每15个显示一个
                        } else if (totalLabels > 30) {
                            skipInterval = 7; // 30-60个数据点，每7个显示一个
                        } else if (totalLabels > 15) {
                            skipInterval = 5; // 15-30个数据点，每5个显示一个
                        } else if (totalLabels > 10) {
                            skipInterval = 3; // 10-15个数据点，每3个显示一个
                        } else if (totalLabels > 7) {
                            skipInterval = 2; // 7-10个数据点，每2个显示一个
                        }
                        // 7个或更少，显示所有标签

                        // 总是显示第一个和最后一个标签
                        if (index === 0 || index === totalLabels - 1) {
                            return allDates[index];
                        }

                        // 按间隔显示其他标签
                        if (index % skipInterval === 0) {
                            return allDates[index];
                        }

                        return ''; // 不显示此标签
                    }
                }
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: 'var(--color-text)', fontSize: '1.4rem', margin: 0 }}>{title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setView('weight')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            background: view === 'weight' ? 'var(--color-primary)' : (isDark ? '#3a3a3a' : '#EEE'),
                            color: view === 'weight' ? '#FFF' : (isDark ? '#e0e0e0' : '#888'),
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        体重
                    </button>
                    <button
                        onClick={() => setView('bmi')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            background: view === 'bmi' ? 'var(--color-primary)' : (isDark ? '#3a3a3a' : '#EEE'),
                            color: view === 'bmi' ? '#FFF' : (isDark ? '#e0e0e0' : '#888'),
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        BMI
                    </button>
                </div>
            </div>

            {/* Time Range Selection */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '15px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => { setTimeRange('30'); setShowDatePicker(false); }}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: timeRange === '30' ? 'var(--color-secondary)' : (isDark ? '#3a3a3a' : '#F5F5F5'),
                        color: timeRange === '30' ? '#FFF' : (isDark ? '#e0e0e0' : '#666'),
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: timeRange === '30' ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    最近30天
                </button>
                <button
                    onClick={() => { setTimeRange('90'); setShowDatePicker(false); }}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: timeRange === '90' ? 'var(--color-secondary)' : (isDark ? '#3a3a3a' : '#F5F5F5'),
                        color: timeRange === '90' ? '#FFF' : (isDark ? '#e0e0e0' : '#666'),
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: timeRange === '90' ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    最近90天
                </button>
                <button
                    onClick={() => { setTimeRange('all'); setShowDatePicker(false); }}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: timeRange === 'all' ? 'var(--color-secondary)' : (isDark ? '#3a3a3a' : '#F5F5F5'),
                        color: timeRange === 'all' ? '#FFF' : (isDark ? '#e0e0e0' : '#666'),
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: timeRange === 'all' ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    全部
                </button>
                <button
                    onClick={() => { setShowDatePicker(!showDatePicker); setTimeRange('custom'); }}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: timeRange === 'custom' ? 'var(--color-secondary)' : (isDark ? '#3a3a3a' : '#F5F5F5'),
                        color: timeRange === 'custom' ? '#FFF' : (isDark ? '#e0e0e0' : '#666'),
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: timeRange === 'custom' ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    自定义
                </button>
                {onViewDetails && (
                    <button
                        onClick={onViewDetails}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--color-primary)',
                            background: isDark ? '#2d2d2d' : '#FFF',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        详细记录
                    </button>
                )}
            </div>

            {/* Custom Date Picker */}
            {showDatePicker && (
                <div style={{
                    background: isDark ? '#2d2d2d' : '#F9F9F9',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '15px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>从</label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid #DDD',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>到</label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid #DDD',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Chart Container */}
            <div style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                marginBottom: '10px'
            }}>
                <div style={{
                    minWidth: allDates.length > 10 ? `${allDates.length * 50}px` : '100%',
                    height: '300px'
                }}>
                    <Line data={chartData} options={options} />
                </div>
            </div>

            {allDates.length > 10 && (
                <p style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    textAlign: 'center',
                    margin: '5px 0 0 0'
                }}>
                    👆 左右滑动查看更多数据
                </p>
            )}
        </div>
    );
};

export default HistoryChart;
