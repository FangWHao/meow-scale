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

const HistoryChart = ({ userData = [], partnerData = [], title }) => {
    const [view, setView] = React.useState('weight');
    const [pinkIcons, setPinkIcons] = React.useState([]);
    const [blueIcons, setBlueIcons] = React.useState([]);

    // Memoize random assignments to prevent jitter on re-render
    const [userIconIndices, setUserIconIndices] = React.useState([]);
    const [partnerIconIndices, setPartnerIconIndices] = React.useState([]);

    React.useEffect(() => {
        const createCatIcon = (color, rotation = 0) => {
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g style="transform-origin: center; transform: rotate(${rotation}deg)">
                        <circle cx="12" cy="13" r="8" fill="${color}" />
                        <path d="M5 8l1-6 5 4zM19 8l-1-6-5 4z" fill="${color}" />
                        <circle cx="9" cy="13" r="1" fill="white" />
                        <circle cx="15" cy="13" r="1" fill="white" />
                        <path d="M11 16a2 2 0 0 0 2 0" stroke="white" stroke-width="1" fill="none" stroke-linecap="round" />
                    </g>
                </svg>
            `;
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svg.trim());
            return img;
        };

        const rotations = [0, 12, -12, 8, -8, 5, -5];
        setPinkIcons(rotations.map(r => createCatIcon('#FFB7B2', r)));
        setBlueIcons(rotations.map(r => createCatIcon('#B2CEFE', r)));
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

    const allDates = Array.from(new Set([
        ...userData.map(d => format(new Date(d.timestamp), 'MM-dd')),
        ...partnerData.map(d => format(new Date(d.timestamp), 'MM-dd'))
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
                data: getDataForDates(userData, view),
                borderColor: '#FFB7B2',
                backgroundColor: 'rgba(255, 183, 178, 0.2)',
                tension: 0.4,
                spanGaps: true,
                pointStyle: getAssignedIcons(userData, view, pinkIcons, userIconIndices),
                pointRadius: 10,
                pointHoverRadius: 12,
            },
            partnerData.length > 0 && {
                label: view === 'weight' ? '伴侣体重' : '伴侣 BMI',
                data: getDataForDates(partnerData, view),
                borderColor: '#B2CEFE',
                backgroundColor: 'rgba(178, 206, 254, 0.2)',
                tension: 0.4,
                spanGaps: true,
                pointStyle: getAssignedIcons(partnerData, view, blueIcons, partnerIconIndices),
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
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#9E9E9E' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9E9E9E' }
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--color-text)', fontSize: '1.4rem', margin: 0 }}>{title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setView('weight')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            background: view === 'weight' ? 'var(--color-primary)' : '#EEE',
                            color: view === 'weight' ? '#FFF' : '#888',
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
                            background: view === 'bmi' ? 'var(--color-primary)' : '#EEE',
                            color: view === 'bmi' ? '#FFF' : '#888',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        BMI
                    </button>
                </div>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default HistoryChart;
