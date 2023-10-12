import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Crimedata.css'
import img1 from '../assets/chat-bubble.png';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


const Crimedata = () => {
    const [crimeData, setCrimeData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(
                'https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv'
            );
            const data = await response.json();
            setCrimeData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const prepareChartData = () => {
        if (loading || !crimeData || crimeData.length === 0) {
            console.log('Data is loading or empty');
            return {};
        }

        const years = crimeData.map((data) => data.data_year);
        const totalArrests = crimeData.map((data) => data.Burglary);
        console.log(years);
        console.log(totalArrests);

        return {
            labels: years,
            datasets: [
                {
                    label: 'Total Arrests',
                    data: totalArrests,
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 2,
                    fill: false,
                },
            ],
        };
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,

            },
            title: {
                display: false,
                text: 'Chart.js Line Chart',
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.3)',
                    display: false
                },
                ticks: {
                    fontSize: 21,
                },

            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.3)',
                },
                title: {
                    display: true,
                    text: 'Arrests',
                    font:{
                        size: 32
                    }

                },

            },
        },
        defaultFontSize: 200,
    };


    const chartData = prepareChartData();

    const generatePDF = async () => {
            const chartNode = document.getElementById('chart-container');

            if (chartNode) {
                const canvas = await html2canvas(chartNode);
                const pdf = new jsPDF('portrait', 'mm', 'a4');

                const logoWidth = 30;
                pdf.addImage(img1, 'PNG', 5, 0, 10, 10);

                // Title text
                pdf.setFontSize(16);
                const titleText = 'RealAssist.AI';
                pdf.text(titleText, 17, 7);

                pdf.setFontSize(12);
                const address='123 main street, Dover, NH 03820-4667'
                pdf.text(address,pdf.internal.pageSize.getWidth()-80,7)

                // Header line
                const headerLineHeight = 1;
                pdf.setLineWidth(headerLineHeight);
                pdf.line(5, 12, pdf.internal.pageSize.getWidth() - 5, 12);

                // Chart
                const chartWidth = 180;
                const chartHeight = (chartWidth / canvas.width) * canvas.height;
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 30 + logoWidth + 10, chartWidth, chartHeight);

                // Footer
                const footerLineHeight = 1;
                pdf.setLineWidth(footerLineHeight);
                pdf.line(5, pdf.internal.pageSize.getHeight() - 12, pdf.internal.pageSize.getWidth() - 5, pdf.internal.pageSize.getHeight() - 12);
                pdf.setFontSize(12);

                const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                pdf.text(`Report Generated ON ${currentDate}`, 7, pdf.internal.pageSize.getHeight() - 5);
                
                pdf.text('RealAssist Property Report | Page 1 of 25',pdf.internal.pageSize.getWidth()-85,pdf.internal.pageSize.getHeight() - 5)

                pdf.save('chart.pdf');
            }
    };

    return (
        <div className='container'>
            <h2>Burglary</h2>
            <div id="chart-container">
            {loading && <p>Loading data...</p>}
                {!loading && <Line data={chartData} options={options} />}
            </div>
            <button onClick={generatePDF}>Generate PDF</button>
            
        </div>

    );
};

export default Crimedata;
