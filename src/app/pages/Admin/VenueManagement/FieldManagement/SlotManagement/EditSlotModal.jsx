import { useState } from 'react';
import { postData, putData } from '../../../../../../mocks/CallingAPI';

export default function EditSlotModal({ slotprop, onClose, setRefresh, action }) {
    const [slot, setSlot] = useState(slotprop);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Update = async (slot) => {
        const token = '';
        try {
            const SlotResult = await putData(`Slot/${slot.id}`, slot, token);
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const Upload = async (slot) => {
        const token = '';
        try {
            const SlotResult = await postData('Slot', slot, token);
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
        setSlot((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (action == 'edit') Update(slot);
        else if (action == 'create') Upload(slot);
    };

    return (
        <div className='edit-modal'>
            <div className='modal-box'>
                <button className='btn close-btn' onClick={() => onClose()}><i className='fa-solid fa-xmark'></i></button>
                <form onSubmit={handleSubmit} className='user-edit-form'>
                    <div className='edit-title'>Edit Slot</div>
                    {slot.id &&
                        <div className='input-group'>
                            <input name='id' placeholder=' ' value={slot.id} disabled />
                            <label htmlFor='id' className='disable'>ID</label>
                        </div>
                    }
                    <div className='input-group'>
                        <input name='name' placeholder=' ' value={slot.name} onChange={handleChange} required />
                        <label htmlFor='name'>Name</label>
                    </div>
                    <div className='flex'>
                        <div className='input-group group-1'>
                            <input name='startTime' type='time' placeholder=' ' value={slot.startTime} onChange={handleChange} required />
                            <label htmlFor='startTime'>Start Time</label>
                        </div>
                        <div className='input-group group-1'>
                            <input name='endTime' type='time' placeholder=' ' value={slot.endTime} onChange={handleChange} required />
                            <label htmlFor='endTime'>End Time</label>
                        </div>
                    </div>
                        <div className='input-group'>
                            <input name='price' type='number' min={0} placeholder=' ' value={slot.price} onChange={handleChange} required />
                            <label htmlFor='price'>Price</label>
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
