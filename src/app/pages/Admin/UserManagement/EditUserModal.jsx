import { useState } from 'react';
import { postData, putData } from '../../../../mocks/CallingAPI';
import '../EditModal.css';

export default function EditUserModal({ userprop, onClose, setRefresh, action }) {
    const [customer, setCustomer] = useState(userprop);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const DefaultAvatar = 'https://cdn-icons-png.flaticon.com/512/11485/11485970.png';

    const Update = async (customer) => {
        const token = '';
        const newAccount = { ...customer.account };
        const newCustomer = { id: customer.id, point: Number(customer.point) || 0, type: customer.type, accountId: customer.accountId };
        try {
            const AccountResult = await putData(`accounts/${newAccount.id}`, newAccount, token);
            const CustomerResult = await putData(`customers/${newCustomer.id}`, newCustomer, token);
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const Upload = async (customer) => {
        const token = '';
        const newAccount = { ...customer.account };
        try {
            const AccountResult = await postData('accounts', newAccount, token);
            if (AccountResult) {
                const newCustomer = { point: Number(customer.point) || 0, type: customer.type, accountId: AccountResult.id };
                const CustomerResult = await postData('customers', newCustomer, token);
            }
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('account.')) {
            const key = name.split('.')[1];
            setCustomer((prev) => ({
                ...prev,
                account: { ...prev.account, [key]: value },
            }));
        } else {
            setCustomer((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (action == 'edit') Update(customer);
        else if (action == 'create') Upload(customer);
    };

    return (
        <div className='edit-modal'>
            <div className='modal-box'>
                <button className='btn close-btn' onClick={() => onClose()}><i className='fa-solid fa-xmark'></i></button>
                <form onSubmit={handleSubmit} className='user-edit-form'>
                    <div className='edit-title'>Edit User</div>
                    <div className='flex'>
                        <div className='image-container'><img src={customer.account?.image || DefaultAvatar} alt='avatar' /></div>
                        <div className='column'>
                            <div className='input-group'>
                                <input name='account.name' placeholder=' ' value={customer.account?.name} onChange={handleChange} required />
                                <label htmlFor='name'>Name</label>
                            </div>
                            <div className='input-group'>
                                <input name='account.image' placeholder=' ' value={customer.account?.image} onChange={handleChange} required />
                                <label htmlFor='image'>Image URL</label>
                            </div>
                        </div>
                    </div>
                    {customer.account?.id &&
                        <div className='input-group'>
                            <input name='id' placeholder=' ' value={customer.account?.id} disabled />
                            <label htmlFor='id' className='disable'>ID</label>
                        </div>
                    }
                    <div className='input-group'>
                        <input name='account.email' placeholder=' ' value={customer.account?.email} onChange={handleChange} disabled={action != 'create'} />
                        <label htmlFor='email' className={`${action == 'create' ? '' : 'disable'}`}>Email</label>
                    </div>
                    <div className='column'>
                        <div className='flex'>
                            <div className='input-group group-1'>
                                <select id='formType' name='type' onChange={handleChange}>
                                    <option value={customer.type}>{customer.type}</option>
                                    {customer.type !== 'Regular' && <option value={'Regular'}>Regular</option>}
                                    {customer.type !== 'Vip' && <option value={'Vip'}>Vip</option>}
                                </select>
                                <label htmlFor='type'>Type</label>
                            </div>
                            <div className='input-group'>
                                <input name='point' min={0} type='number' placeholder=' ' value={customer.point} onChange={handleChange} required />
                                <label htmlFor='point'>Point</label>
                            </div>
                        </div>
                    </div>
                    <div className='input-group'>
                        <input name='account.phone' placeholder=' ' value={customer.account?.phone} onChange={handleChange} required />
                        <label htmlFor='phone'>Phone</label>
                    </div>
                    <div className='input-group group-1'>
                        <label htmlFor='description'>Description</label>
                        <textarea
                            name='account.description'
                            placeholder=' '
                            value={customer.account?.description || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='btn-box'>
                        <button type='submit' className='btn-save' disabled={loading}>SAVE</button>
                        <button type='button' onClick={() => onClose()}>CANCEL</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
