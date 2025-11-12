import { useState } from 'react';
import { postData, putData } from '../../../../../mocks/CallingAPI';

export default function EditFieldModal({ fieldprop, type, onClose, setRefresh, action }) {
    const [field, setField] = useState(fieldprop);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Update = async (field) => {
        const token = '';
        try {
            const FieldResult = await putData(`Field/${field.id}`, field, token);
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const Upload = async (field) => {
        const token = '';
        try {
            const FieldResult = await postData('Field', field, token);
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
        setField((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (action == 'edit') Update(field);
        else if (action == 'create') Upload(field);
    };

    return (
        <div className='edit-modal'>
            <div className='modal-box'>
                <button className='btn close-btn' onClick={() => onClose()}><i className='fa-solid fa-xmark'></i></button>
                <form onSubmit={handleSubmit} className='user-edit-form'>
                    <div className='edit-title'>Edit Field</div>
                    <div className='input-group'>
                        <input name='name' placeholder=' ' value={field.name} onChange={handleChange} required />
                        <label htmlFor='name'>Name</label>
                    </div>
                    {field.id &&
                        <div className='input-group'>
                            <input name='id' placeholder=' ' value={field.id} disabled />
                            <label htmlFor='id' className='disable'>ID</label>
                        </div>
                    }
                    <div className='input-group'>
                        <select id='formTypeId' name='typeId' value={field.typeId} onChange={handleChange}>
                            {type?.map((cate, i) => (
                                <option key={i} value={cate.id}>{cate.name}</option>
                            ))}
                        </select>
                        <label htmlFor='typeId'>Type</label>
                    </div>
                    <div className='input-group group-1'>
                        <label htmlFor='description'>Description</label>
                        <textarea
                            name='description'
                            placeholder=' '
                            value={field.description || ''}
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
