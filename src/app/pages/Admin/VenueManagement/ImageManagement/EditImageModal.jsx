import { useState } from 'react';
import { postData, putData } from '../../../../../mocks/CallingAPI';

export default function EditImageModal({ imageprop, onClose, setRefresh, action }) {
    const [image, setImage] = useState(imageprop);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Update = async (image) => {
        const token = '';
        try {
            const ImageResult = await putData(`Image/${image.id}`, image, token);
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const Upload = async (image) => {
        const token = '';
        try {
            const ImageResult = await postData('Image', image, token);
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
        setImage((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (action == 'edit') Update(image);
        else if (action == 'create') Upload(image);
    };

    return (
        <div className='edit-modal'>
            <div className='modal-box'>
                <button className='btn close-btn' onClick={() => onClose()}><i className='fa-solid fa-xmark'></i></button>
                <form onSubmit={handleSubmit} className='user-edit-form'>
                    <div className='edit-title'>Edit Image</div>
                    <div className='image-container edit-image'><img src={image.link || null} alt='avatar' /></div>
                    {image.id &&
                        <div className='input-group'>
                            <input name='id' placeholder=' ' value={image.id} disabled />
                            <label htmlFor='id' className='disable'>ID</label>
                        </div>
                    }
                    <div className='input-group'>
                        <input name='name' placeholder=' ' value={image.name} onChange={handleChange} required />
                        <label htmlFor='name'>Name</label>
                    </div>
                    <div className='input-group'>
                        <input name='link' placeholder=' ' value={image.link} onChange={handleChange} required />
                        <label htmlFor='link'>Image URL</label>
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
