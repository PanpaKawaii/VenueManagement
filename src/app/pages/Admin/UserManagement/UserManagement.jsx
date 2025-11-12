import { useEffect, useState } from 'react';
import { fetchData, putData } from '../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Cube from '../../../components/Cube/Cube';
import EditUserModal from './EditUserModal';
import './UserManagement.css';

export default function UserManagement() {
    const [CUSTOMERs, setCUSTOMERs] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorFunction, setErrorFunction] = useState(null);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [popupProps, setPopupProps] = useState(null);
    const DefaultAvatar = 'https://cdn-icons-png.flaticon.com/512/11485/11485970.png';

    useEffect(() => {
        const fetchDataAPI = async () => {
            setError(null);
            setLoading(true);
            const token = '';
            try {
                const AccountResponse = await fetchData('accounts', token);
                console.log('AccountResponse', AccountResponse);
                const CustomerResponse = await fetchData('customers', token);
                console.log('CustomerResponse', CustomerResponse);

                const Customers = CustomerResponse.map(customer => ({
                    ...customer,
                    account: AccountResponse.find(acc => acc.id === customer.accountId) || null
                }));
                console.log('Customers', Customers);

                setCUSTOMERs(Customers);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh]);

    const openEditModal = (data) => { setEditing(data); };
    const closeEditModal = () => { setEditing(null); };
    const openCreateModal = () => { setCreating(true); };
    const closeCreateModal = () => { setCreating(false); };

    const banCustomer = async (customer) => {
        const token = '';
        const newAccount = { ...customer.account, status: customer.account?.status == 1 ? 0 : 1 };
        try {
            const AccountResult = await putData(`accounts/${newAccount.id}`, newAccount, token);
            console.log('AccountResult', AccountResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const [searchCustomer, setSearchCustomer] = useState('');
    const [select, setSelect] = useState('');
    const customersFilter = CUSTOMERs.filter((customer) => {
        const customerName = customer.account?.name?.toLowerCase();
        const customerEmail = customer.account?.email?.toLowerCase();
        const customerPhone = customer.account?.phone?.toLowerCase();
        const customerType = customer.type?.toLowerCase();
        const customerStatus = customer.account?.status;

        const matchSearch = !searchCustomer
            || customerName?.includes(searchCustomer.toLowerCase())
            || customerEmail?.includes(searchCustomer.toLowerCase())
            || customerPhone?.includes(searchCustomer.toLowerCase());
        const matchSelect = !select || customerType?.includes(select.toLowerCase()) || customerStatus == select;

        return matchSearch && matchSelect;
    });
    const handleClear = () => {
        setSearchCustomer('');
        setSelect('');
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            {/* {JSON.stringify(customersFilter?.[0], null, 0)} */}
            <div className='inner-container management-container user-management-container'>

                <header className='main-header'>
                    <h1>User Management</h1>
                    <button className='btn-primary' onClick={() => openCreateModal(true)}>
                        <i className='fa-solid fa-plus' />
                        Add more account
                    </button>
                </header>

                <form className='controls'>
                    <div className='count'>{customersFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by name, email, phone...' value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
                    </div>
                    <div className='field'>
                        <select id='formSelect' value={select} onChange={(e) => setSelect(e.target.value)}>
                            <option className='option' value={''}>-- Type / Status --</option>
                            <option className='option-vip' value={'Vip'}>Vip</option>
                            <option className='option-regular' value={'Regular'}>Regular</option>
                            <option className='option-active' value={'1'}>Active</option>
                            <option className='option-banned' value={'0'}>Banned</option>
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
                                <th>EMAIL</th>
                                <th>PHONE</th>
                                <th>POINT</th>
                                <th>TYPE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customersFilter?.map((customer, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className='customer-name-cell'>
                                            <div className='avatar'>
                                                <img src={`${customer.account?.image || DefaultAvatar}`} alt='avatar' />
                                            </div>
                                            <div className='customer-info'>
                                                <span className='name'>{customer.account?.name}</span>
                                                <span className='role'>{customer.account?.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='email'>
                                            <span>{customer.account?.email}</span>
                                        </div>
                                    </td>
                                    <td><span>{customer.account?.phone}</span></td>
                                    <td><span>{customer.point}</span></td>
                                    <td><span>{customer.type}</span></td>
                                    <td>
                                        <div className='action-buttons'>
                                            <button onClick={() => openEditModal(customer)}>
                                                <span>Modify</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button>
                                            <button className={`btn-active ${customer.account?.status == 0 && 'abb'}`} onClick={() => setPopupProps(customer)} disabled={customer.account?.status == 1}>
                                                <span>Active</span>
                                                <i className='fa-solid fa-unlock' />
                                            </button>
                                            <button className={`btn-banned ${customer.account?.status == 1 && 'abb'}`} onClick={() => setPopupProps(customer)} disabled={customer.account?.status == 0}>
                                                <span>Banned</span>
                                                <i className='fa-solid fa-lock' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {editing && (
                    <EditUserModal
                        userprop={editing}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                        action={'edit'}
                    />
                )}

                {creating && (
                    <EditUserModal
                        userprop={{
                            point: 0,
                            type: 'Regular',
                            account: {
                                name: '',
                                email: '',
                                password: '123456',
                                phone: '',
                                image: '',
                                role: 'Customer',
                                description: '',
                                status: 1,
                            }
                        }}
                        onClose={closeCreateModal}
                        setRefresh={setRefresh}
                        action={'create'}
                    />
                )}

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
