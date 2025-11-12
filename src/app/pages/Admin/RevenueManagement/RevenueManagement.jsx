import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { fetchData } from '../../../../mocks/CallingAPI';
import Cube from '../../../components/Cube/Cube';
import './RevenueManagement.css';

export default function RevenueManagement() {
    const [PAYMENTs, setPAYMENTs] = useState([]);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDataAPI = async () => {
            setError(null);
            setLoading(true);
            const token = '';
            try {
                const PaymentResponse = await fetchData('payments', token);
                console.log('PaymentResponse', PaymentResponse);
                const OrderResponse = await fetchData('orders', token);
                console.log('OrderResponse', OrderResponse);
                const ProductResponse = await fetchData('products', token);
                console.log('ProductResponse', ProductResponse);
                const CategoryResponse = await fetchData('categories', token);
                console.log('CategoryResponse', CategoryResponse);

                const Products = ProductResponse.map(product => ({
                    ...product,
                    category: CategoryResponse.find(category => category.id === product.categoryId) || null,
                }));
                const Orders = OrderResponse.map(order => ({
                    ...order,
                    product: Products.find(product => product.id === order.productId) || null,
                }));
                const Payments = PaymentResponse.filter(payment => payment.status == 1).map(payment => ({
                    ...payment,
                    order: Orders.find(order => order.id === payment.orderId) || null,
                }));
                console.log('Payments', Payments);

                setPAYMENTs(Payments);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh]);

    const formatCurrencyShort = (value) => {
        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(1)}T ₫`; // T = Tỷ
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)}M ₫`; // M = Triệu
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(1)}K ₫`; // K = Nghìn
        }
        return `${value} ₫`;
    };

    function getPaymentStats(payments) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Tính thứ Hai của tuần hiện tại
        const dayOfWeek = today.getDay(); // 0: CN, 1: Thứ 2, ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Parse dd/mm/yyyy
        const parseDate = (d) => {
            const [dd, mm, yyyy] = d.split('/').map(Number);
            return new Date(yyyy, mm - 1, dd);
        };

        let totalToday = 0;
        let totalWeek = 0;
        let totalMonth = 0;
        let totalYear = 0;

        payments.forEach(p => {
            const date = parseDate(p.purchaseDate);
            if (date >= startOfDay) totalToday += p.amount;
            if (date >= startOfWeek) totalWeek += p.amount;
            if (date >= startOfMonth) totalMonth += p.amount;
            if (date >= startOfYear) totalYear += p.amount;
        });

        return [
            { title: 'Today', value: totalToday, icon: 'dollar', color: '#60A5FA', },
            { title: 'This week', value: totalWeek, icon: 'calendar-week', color: '#34D399', },
            { title: 'This month', value: totalMonth, icon: 'calendar-days', color: '#A78BFA', },
            { title: 'This year', value: totalYear, icon: 'chart-line', color: '#FBBF24', }
        ];
    }
    const totals = getPaymentStats(PAYMENTs);
    console.log('getPaymentStats', totals);

    function getRevenueByMonth(payments) {
        const revenueMap = {};

        payments.forEach(p => {
            const [dd, mm, yyyy] = p.purchaseDate?.split('/').map(Number);
            const key = `${yyyy}-${mm?.toString()?.padStart(2, '0')}`; // ví dụ: 2025-11

            if (!revenueMap[key]) {
                revenueMap[key] = 0;
            }
            revenueMap[key] += p.amount;
        });

        // Trả về array để dùng trực tiếp cho Recharts
        // Sắp xếp theo thời gian tăng dần
        return Object.keys(revenueMap)
            .sort()
            .map(key => {
                const [year, month] = key.split('-');
                return {
                    year,
                    month,
                    name: `${month}/${year}`,
                    total: revenueMap[key]
                };
            });
    }
    const revenueData = getRevenueByMonth(PAYMENTs);
    console.log('getRevenueByMonth', revenueData);

    function groupPaymentsByYearAndCategory(payments) {
        const result = {};

        payments.forEach((p) => {
            const [day, month, year] = p.purchaseDate?.split("/");
            const y = year;
            const catName = p.order?.product?.category?.name;
            const quantity = p.order?.quantity;
            const amount = p.amount;

            if (!result[y]) result[y] = {};

            if (!result[y][catName]) {
                result[y][catName] = {
                    name: catName,
                    totalQuantity: 0,
                    totalAmount: 0,
                };
            }

            result[y][catName].totalQuantity += quantity;
            result[y][catName].totalAmount += amount;
        });

        // chuyển từ object thành mảng để dễ dùng cho recharts
        const yearData = {};
        Object.keys(result).forEach((year) => {
            yearData[year] = Object.values(result[year]);
        });

        return yearData;
    }
    const grouped = groupPaymentsByYearAndCategory(PAYMENTs);
    console.log('groupPaymentsByYearAndCategory', grouped);

    const COLORS = ['#3787ffff', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#c485ffff'];
    const yearData = grouped[selectedYear] || [];
    const total = yearData.reduce((sum, item) => sum + item.totalAmount, 0);
    const dataWithPercent = yearData.map((item) => ({
        ...item,
        percent: ((item.totalAmount / total) * 100).toFixed(1),
    }));

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container revenue-management-container'>

                <header className='main-header'>
                    <h1>Revenue Management</h1>
                </header>

                <div className='revenue-stats-grid'>
                    {totals.map((item, index) => (
                        <div key={index} className='stat-card'>
                            <div className='info'>
                                <div className='title'>{item.title}</div>
                                <h3>{item.value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h3>
                                {/* <span className='change'>{item.change}</span> */}
                            </div>
                            <div className='icon' style={{ backgroundColor: item.color + '40' }}>
                                <i className={`fa-solid fa-${item.icon}`} style={{ color: item.color }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className='revenue-chart'>
                    <form>
                        <label>Total: {total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</label>
                        <select id='formStatus' value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            <option value={'2024'}>2024</option>
                            <option value={'2025'}>2025</option>
                        </select>
                    </form>

                    <div className='chart-container'>
                        <div className='chart bar-chart'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                    data={revenueData.filter(r => r.year == selectedYear)}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='name' />
                                    <YAxis
                                        tickFormatter={(value) => formatCurrencyShort(value)}
                                        tick={{ fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip formatter={(value) => formatCurrencyShort(value)} />
                                    <Legend />
                                    <Bar dataKey='total' fill='#4CAF50bf' name='Income' />
                                    {/* <Bar dataKey='outcome' fill='#F44336bf' name='Outcome' /> */}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='chart pie-chart'>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={dataWithPercent}
                                        dataKey='totalAmount'
                                        nameKey='name'
                                        cx='50%'
                                        cy='50%'
                                        outerRadius={120}
                                        label={({ name, percent }) => `${name} (${percent}%)`}
                                    >
                                        {dataWithPercent.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            `${value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`,
                                            `${props.payload.name} (x${props.payload.totalQuantity}) (${props.payload.percent}%)`,
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
