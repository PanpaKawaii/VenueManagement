import { useEffect, useState } from 'react';
import { fetchData } from '../../../../mocks/CallingAPI';
import Cube from '../../../components/Cube/Cube';
import './TransactionManagement.css';

export default function TransactionManagement() {
    const [PAYMENTs, setPAYMENTs] = useState([]);
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
                const AddressResponse = await fetchData('addresses', token);
                console.log('AddressResponse', AddressResponse);
                const CustomerResponse = await fetchData('customers', token);
                console.log('CustomerResponse', CustomerResponse);
                const AccountResponse = await fetchData('accounts', token);
                console.log('AccountResponse', AccountResponse);

                const Customers = CustomerResponse.map(customer => ({
                    ...customer,
                    account: AccountResponse.find(acc => acc.id === customer.accountId) || null
                }));
                const Addresses = AddressResponse.map(address => ({
                    ...address,
                    customer: Customers.find(customer => customer.id === address.customerId) || null
                }));
                const Orders = OrderResponse.map(order => ({
                    ...order,
                    address: Addresses.find(address => address.id === order.addressId) || null,
                    product: ProductResponse.find(product => product.id === order.productId) || null
                }));
                const Payments = PaymentResponse.map(payment => ({
                    ...payment,
                    order: Orders.find(order => order.id === payment.orderId) || null
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

    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchAmount, setSearchAmount] = useState(0);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [select, setSelect] = useState('');
    // Đổi từ ISO (yyyy-mm-dd) sang hiển thị dd/mm/yyyy
    const formatDateDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };
    // Đổi từ dd/mm/yyyy sang ISO (yyyy-mm-dd)
    const formatDateInput = (displayDate) => {
        if (!displayDate) return '';
        const [day, month, year] = displayDate.split('/');
        return `${year}-${month}-${day}`;
    };
    // Khi user chọn ngày trong input[type="date"]
    const handleChange = (e) => {
        const { name, value } = e.target;
        const formatted = formatDateDisplay(value);
        setDateRange((prev) => ({
            ...prev,
            [name]: formatted,
        }));
    };
    // Hàm chuyển "dd/mm/yyyy" sang đối tượng Date để so sánh
    const parseDate = (str) => {
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`);
    };
    const paymentsFilter = PAYMENTs.filter((payment) => {
        const paymentCustomer = payment.order?.address?.customer?.account?.name?.toLowerCase();
        const paymentAmount = payment.amount;
        const paymentDate = parseDate(payment.purchaseDate);
        const paymentMethod = payment.method?.toLowerCase();
        const paymentStatus = payment.status;

        const matchCustomer = !searchCustomer || paymentCustomer?.includes(searchCustomer.toLowerCase());
        const matchAmount = !searchAmount || paymentAmount >= searchAmount;
        const matchFrom = dateRange.from ? paymentDate >= parseDate(dateRange.from) : true;
        const matchTo = dateRange.to ? paymentDate <= parseDate(dateRange.to) : true;
        const matchSelect = !select || paymentMethod?.includes(select.toLowerCase()) || paymentStatus == select;

        return matchFrom && matchTo && matchCustomer && matchAmount && matchSelect;
    })?.sort((a, b) => {
        const [dayA, monthA, yearA] = a.purchaseDate?.split('/')?.map(Number);
        const [dayB, monthB, yearB] = b.purchaseDate?.split('/')?.map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB - dateA;
    });
    const handleClear = () => {
        setSearchCustomer('');
        setSearchAmount(0);
        setDateRange({ from: '', to: '' });
        setSelect('');
    }


    // const [amount, setAmount] = useState(0);
    // // Chuyển giá trị nhập thành số
    // const handleChange = (e) => {
    //     const raw = e.target.value.replace(/[^\d]/g, ""); // loại bỏ ký tự không phải số
    //     setAmount(Number(raw));
    // };
    // // Hiển thị format kiểu tiền VND
    // const formattedValue =
    //     amount > 0
    //         ? amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    //         : "";


    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container transaction-management-container'>

                <header className='main-header'>
                    <h1>Transaction Management</h1>
                </header>

                <form className='controls'>
                    <div className='count'>{paymentsFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by customer...' value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
                    </div>
                    <div className='field'>
                        <input
                            type='number'
                            min={0}
                            placeholder='Find by amount...'
                            value={searchAmount}
                            onChange={(e) => setSearchAmount(e.target.value)}
                        />
                    </div>
                    {/* <input
                        type="text"
                        value={formattedValue}
                        onChange={handleChange} /> */}
                    <div className='field'>
                        <input
                            type='date'
                            name='from'
                            value={formatDateInput(dateRange.from)}
                            onChange={handleChange}
                        />
                    </div>
                    <i className='fa-solid fa-arrow-right' />
                    <div className='field'>
                        <input
                            type='date'
                            name='to'
                            value={formatDateInput(dateRange.to)}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='field'>
                        <select id='formSelect' value={select} onChange={(e) => setSelect(e.target.value)}>
                            <option className='option' value={''}>-- Status / Method --</option>
                            <option className='option-status' value={'0'}>Not yet</option>
                            <option className='option-status' value={'1'}>Success</option>
                            <option className='option-status' value={'2'}>Fail</option>
                            <option className='option-method' value={'COD'}>COD</option>
                            <option className='option-method' value={'VNPay'}>VNPay</option>
                            <option className='option-method' value={'Momo'}>Momo</option>
                            <option className='option-method' value={'ZaloPay'}>ZaloPay</option>
                            <option className='option-method' value={'Credit Card'}>Credit Card</option>
                        </select>
                    </div>
                    <button type='button' className='btn-secondary' onClick={handleClear}>
                        CLEAR
                    </button>
                    <button type='button' className='btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
                    </button>
                </form>

                <section className='admin-table-container'>
                    <table className='admin-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CUSTOMER</th>
                                <th>AMOUNT</th>
                                <th>DATE</th>
                                <th>METHOD</th>
                                <th>NOTE</th>
                                <th>STATUS</th>
                                <th>PRODUCT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentsFilter?.map((payment, index) => (
                                <tr key={index}>
                                    <td>#{index + 1}/ID{payment.id}</td>
                                    <td><span>{payment.order?.address?.customer?.account?.name}</span></td>
                                    <td><span>{payment.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></td>
                                    <td><span>{payment.purchaseDate}</span></td>
                                    <td><span>{payment.method}</span></td>
                                    <td><span>{payment.note}</span></td>
                                    <td>
                                        <div className='payment'>
                                            {payment.status == 0 && <div className='notyet'>Not yet</div>}
                                            {payment.status == 1 && <div className='success'>Success</div>}
                                            {payment.status == 2 && <div className='fail'>Fail</div>}
                                        </div>
                                    </td>
                                    <td><span>{payment.order?.product?.name}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    )
}
