import { useEffect, useState } from 'react';
import { fetchData, postData, putData } from '../../../../mocks/CallingAPI';
import Cube from '../../../components/Cube/Cube';
import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
// import EditUserModal from './EditUserModal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import './OrderManagement.css';

export default function OrderManagement() {
    const [ORDERs, setORDERs] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorFunction, setErrorFunction] = useState(null);
    const [popupProps, setPopupProps] = useState(null);
    const [changeStatusLoading, setChangeStatusLoading] = useState(-1);
    const [changePaymentLoading, setChangePaymentLoading] = useState(-1);

    useEffect(() => {
        const fetchDataAPI = async () => {
            setError(null);
            setLoading(true);
            const token = '';
            try {
                const OrderResponse = await fetchData('orders', token);
                console.log('OrderResponse', OrderResponse);
                const AddressResponse = await fetchData('addresses', token);
                console.log('AddressResponse', AddressResponse);
                const CustomerResponse = await fetchData('customers', token);
                console.log('CustomerResponse', CustomerResponse);
                const AccountResponse = await fetchData('accounts', token);
                console.log('AccountResponse', AccountResponse);
                const ProductResponse = await fetchData('products', token);
                console.log('ProductResponse', ProductResponse);
                const PaymentResponse = await fetchData('payments', token);
                console.log('PaymentResponse', PaymentResponse);

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
                    product: ProductResponse.find(product => product.id === order.productId) || null,
                    payment: PaymentResponse.filter(payment => payment.orderId === order.id) || null
                }));
                console.log('Orders', Orders);

                setORDERs(Orders);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh]);

    const changeStatus = async ({ index, order, value }) => {
        setChangeStatusLoading(index);
        const token = '';
        const newOrder = {
            orderDate: order.orderDate,
            receiveDate: order.receiveDate,
            quantity: order.quantity,
            total: order.total,
            note: order.note,
            rating: order.rating,
            feedback: order.feedback,
            status: parseInt(value), // New Status
            productId: order.productId,
            addressId: order.addressId,
            myVoucherId: order.myVoucherId,
            customerId: order.customerId,
            id: order.id,
        }
        try {
            const OrderResult = await putData(`orders/${order.id}`, newOrder, token);
            console.log('OrderResult', OrderResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        } finally {
            setChangeStatusLoading(-1);
        }
    }

    const changePayment = async ({ index, payment, value }) => {
        setChangePaymentLoading(index);
        const token = '';
        const newPayment = { ...payment, status: parseInt(value) }
        console.log('newPayment', newPayment);

        try {
            const PaymentResult = await putData(`payments/${newPayment.id}`, newPayment, token);
            console.log('PaymentResult', PaymentResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        } finally {
            setChangePaymentLoading(-1);
        }
    }

    const [searchOrder, setSearchOrder] = useState('');
    const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
    const ordersFilter = ORDERs.filter((order) => {
        const orderProduct = order.product?.name?.toLowerCase();
        const orderAddress = order.address?.address?.toLowerCase();
        const orderPhone = order.address?.phone?.toLowerCase();
        const orderEmail = order.address?.customer?.account?.email?.toLowerCase();
        const orderStatus = order.status;
        const paymentStatus = order.payment[0]?.status;

        const matchSearch = !searchOrder
            || orderProduct?.includes(searchOrder.toLowerCase())
            || orderAddress?.includes(searchOrder.toLowerCase())
            || orderPhone?.includes(searchOrder.toLowerCase())
            || orderEmail?.includes(searchOrder.toLowerCase());
        const matchOrderStatus = !selectedOrderStatus || orderStatus == selectedOrderStatus;
        const matchPaymentStatus = !selectedPaymentStatus || paymentStatus == selectedPaymentStatus;

        return matchSearch && matchOrderStatus && matchPaymentStatus;
    })?.sort((a, b) => {
        const [dayA, monthA, yearA] = a.orderDate?.split('/')?.map(Number);
        const [dayB, monthB, yearB] = b.orderDate?.split('/')?.map(Number);

        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        return dateB - dateA;
    });
    const handleClear = () => {
        setSearchOrder('');
        setSelectedOrderStatus('');
        setSelectedPaymentStatus('');
    }

    const handleSendNotification = async (contentStatus, accountId) => {
        const token = '';
        let content = 'Updating your order status';
        if (contentStatus == 1) { content = 'Your order is prepared' }
        else if (contentStatus == 2) { content = 'Your order has been shipped' }
        else if (contentStatus == 3) { content = 'The order has arrived your address' }
        else if (contentStatus == 4) { content = 'Please check the order and leave a feedback' }
        else if (contentStatus == 5) { content = 'The order is dilivered successfully' }
        else if (contentStatus == 6) { content = 'You have refused the order' }
        else if (contentStatus == 7) { content = 'The order is being returned' }
        else if (contentStatus == 8) { content = 'The owner has receive the sent back order' }
        else if (contentStatus == 9) { content = 'You have cancelled the order' }
        else if (contentStatus == 10) { content = 'The store has cancelled the order' }
        const notification = {
            sendDate: new Date().toLocaleDateString(),
            title: 'Update order',
            content: content,
            image: 'https://cdn-icons-png.flaticon.com/512/4226/4226663.png',
            status: 1,
            accountId: accountId,
            id: 1
        }
        console.log('notification', notification);
        try {
            const NotificationResult = await postData('notifications', notification, token);
        } catch (error) {
            setError('Error');
        }
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container order-management-container'>

                <header className='main-header'>
                    <h1>Order Management</h1>
                </header>

                <form className='controls'>
                    <div className='count'>{ordersFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by product, address, phone, email...' value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
                    </div>
                    <div className='field'>
                        <select id='formSelectedOrderStatus' value={selectedOrderStatus} onChange={(e) => setSelectedOrderStatus(e.target.value)}>
                            <option className='option' value={''}>-- Order status --</option>
                            <option className='status_-1' value={-1}>In Cart</option>
                            <option className='status_0' value={0}>Pending</option>
                            <option className='status_1' value={1}>Preparing</option>
                            <option className='status_2' value={2}>Shipping</option>
                            <option className='status_3' value={3}>Waiting</option>
                            <option className='status_4' value={4}>Customer Receive</option>
                            <option className='status_5' value={5}>Success</option>
                            <option className='status_6' value={6}>Refuse</option>
                            <option className='status_7' value={7}>Return</option>
                            <option className='status_8' value={8}>Shop Receive</option>
                            <option className='status_9' value={9}>Customer Cancelled</option>
                            <option className='status_10' value={10}>Shop Cancelled</option>
                        </select>
                    </div>
                    <div className='field'>
                        <select id='formSelectPaymentStatus' value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)}>
                            <option className='option' value={''}>-- Payment status --</option>
                            <option className='status_0' value={0}>Not yet</option>
                            <option className='status_5' value={1}>Success</option>
                            <option className='status_10' value={2}>Fail</option>
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
                                <th>PRODUCT</th>
                                <th>STATUS</th>
                                <th>ADDRESS</th>
                                <th>CUSTOMER</th>
                                <th>DATE</th>
                                <th>PAYMENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersFilter?.map((order, index) => (
                                <tr key={index}>
                                    <td>#{index + 1}/ID{order.id}</td>
                                    <td>
                                        <div className='product'>
                                            <div className='product-image'>
                                                <img src={`${order.product?.image}`} alt='avatar' />
                                            </div>
                                            <div className='product-info'>
                                                <span className='name'>{order.product?.name}</span>
                                                <span className='price'>{order.product?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                                <span className='quantity'>Quantity: {order.quantity}</span>
                                                <span>Total: <span className='total'>{(order.quantity * order.product?.price)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {(changeStatusLoading == index) ? <SmallSpinner />
                                            :
                                            <form className='form-status'>
                                                <select className={`status_${order.status}`} id='formStatus' value={order.status} onChange={(e) => { changeStatus({ index: index, order: order, value: e.target.value }), handleSendNotification(e.target.value, order?.address?.customer?.account?.id) }}>
                                                    <option className='status_-1' value={-1}>In Cart</option>
                                                    <option className='status_0' value={0}>Pending</option>
                                                    <option className='status_1' value={1}>Preparing</option>
                                                    <option className='status_2' value={2}>Shipping</option>
                                                    <option className='status_3' value={3}>Waiting</option>
                                                    <option className='status_4' value={4}>Customer Receive</option>
                                                    <option className='status_5' value={5}>Success</option>
                                                    <option className='status_6' value={6}>Refuse</option>
                                                    <option className='status_7' value={7}>Return</option>
                                                    <option className='status_8' value={8}>Shop Receive</option>
                                                    <option className='status_9' value={9}>Customer Cancelled</option>
                                                    <option className='status_10' value={10}>Shop Cancelled</option>
                                                </select>
                                            </form>
                                        }
                                    </td>
                                    <td><div className='address'>{order.address?.address}</div></td>
                                    <td>
                                        <div className='contact'>
                                            <div className='name'>{order.address?.customer?.account?.name}</div>
                                            <div className='contact-phone'><i className='fa-solid fa-phone' />{order.address?.phone}</div>
                                            <div className='contact-email'><i className='fa-solid fa-envelope' />{order.address?.customer?.account?.email}</div>
                                        </div>
                                    </td>
                                    <td><div>{order.orderDate}</div></td>
                                    <td>
                                        {/* <div className='payment'>
                                            {order.payment[0]?.status == 1 && <span className='success'>Success</span>}
                                            {order.payment[0]?.status == 0 && <span className='notyet'>Not yet</span>}
                                        </div> */}
                                        <div className='method'>
                                            <span>{order.payment[0]?.method}</span>
                                        </div>
                                        {(changePaymentLoading == index) ? <SmallSpinner />
                                            :
                                            <form className='form-payment'>
                                                <select className={`status_${order.payment[0]?.status}`} id='formPayment' value={order.payment[0]?.status} onChange={(e) => changePayment({ index: index, payment: order.payment[0], value: e.target.value })}>
                                                    <option className='status_0' value={0}>Not yet</option>
                                                    <option className='status_1' value={1}>Success</option>
                                                    <option className='status_2' value={2}>Fail</option>
                                                </select>
                                            </form>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* {editing && (
                    <EditUserModal
                        userprop={editing}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                    />
                )} */}

                {popupProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to ${popupProps.account?.status == 1 ? 'ban' : 'active'} this customer?`}
                        confirm={popupProps.account?.status == 1 ? 'BAN' : 'ACTIVE'}
                        cancel={'CANCEL'}
                        color={popupProps.account?.status == 1 ? '#dc354580' : '#28a74580'}
                        onConfirm={() => { banCustomer(popupProps), setPopupProps(null) }}
                        onCancel={() => setPopupProps(null)}
                    />
                )}

                {errorFunction && (
                    <ConfirmDialog
                        title={'ERROR'}
                        message={`An error has occurred!`}
                        confirm={'OKAY'}
                        cancel={''}
                        color={'#dc354580'}
                        onConfirm={() => setErrorFunction(null)}
                        onCancel={() => setErrorFunction(null)}
                    />
                )}
            </div>
        </div>
    )
}
