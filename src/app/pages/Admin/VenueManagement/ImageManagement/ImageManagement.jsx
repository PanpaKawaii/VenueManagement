import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteData, fetchData, putData } from '../../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import Cube from '../../../../components/Cube/Cube';
import EditImageModal from './EditImageModal';

export default function ImageManagement() {
    const Params = useParams();
    const VenueId = Params.VenueId;
    const navigate = useNavigate();

    const [IMAGEs, setIMAGEs] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorFunction, setErrorFunction] = useState(null);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [popupProps, setPopupProps] = useState(null);
    const [deleteProps, setDeleteProps] = useState(null);

    useEffect(() => {
        const fetchDataAPI = async () => {
            setError(null);
            setLoading(true);
            const token = '';
            try {
                const ImageResponse = await fetchData('Image', token);
                console.log('ImageResponse', ImageResponse);

                const Images = ImageResponse.filter(image => image.venueId == VenueId);
                console.log('Images', Images);

                setIMAGEs(Images);
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

    const disableImage = async (image) => {
        const token = '';
        const newImage = { ...image, status: image.status == 1 ? 0 : 1 };
        try {
            const ImageResult = await putData(`Image/${newImage.id}`, newImage, token);
            console.log('ImageResult', ImageResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const deleteSlot = async (slot) => {
        const token = '';
        try {
            const SlotResult = await deleteData(`Slot/${slot.id}`, token);
            console.log('SlotResult', SlotResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const [searchImage, setSearchImage] = useState('');
    const imagesFilter = IMAGEs.filter((image) => {
        const imageName = image.name?.toLowerCase();
        const matchSearch = !searchImage || imageName?.includes(searchImage.toLowerCase());
        return matchSearch;
    });
    const handleClear = () => {
        setSearchImage('');
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container image-management-container'>

                <header className='main-header'>
                    <div className='flex'>
                        <button className='btn-back' onClick={() => navigate(-1)}>
                            <i className='fa-solid fa-chevron-left' />
                        </button>
                        <h1>Image Management</h1>
                    </div>
                    <button className='btn-primary' onClick={() => openCreateModal(true)}>
                        <i className='fa-solid fa-plus' />
                        Add more image
                    </button>
                </header>

                <form className='controls'>
                    <div className='count'>{imagesFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by name, email, phone...' value={searchImage} onChange={(e) => setSearchImage(e.target.value)} />
                    </div>
                    <button type='button' className='btn-secondary' onClick={handleClear}>
                        CLEAR
                    </button>
                    <button type='button' className='btn-secondary' onClick={() => setRefresh(p => p + 1)}>
                        Refresh
                    </button>
                </form>

                <div className='images'>
                    <div className='img-row'>
                        {imagesFilter.map((image, index) => (
                            <div key={index} className='img-col'>
                                <div className='grid-card'>
                                    <div className='image'>
                                        <img src={`${image.link}`} alt={image.name} />
                                    </div>
                                    <div className='name'>{image.name}</div>
                                    <button onClick={() => openEditModal(image)}>
                                        <span>Modify</span>
                                        <i className='fa-solid fa-pencil' />
                                    </button>
                                    <button className={`btn-banned`} onClick={() => setPopupProps(image)}>
                                        <span>Delete</span>
                                        <i className='fa-solid fa-trash-can' />
                                    </button>
                                    <button className='btn-delete abb' onClick={() => setDeleteProps(slot)}>
                                        <span>Delete</span>
                                        <i className='fa-solid fa-trash-can' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FIX==Edit */}
                {editing && (
                    <EditImageModal
                        imageprop={editing}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                        action={'edit'}
                    />
                )}

                {/* FIX==Add */}
                {creating && (
                    <EditImageModal
                        imageprop={{ name: '', link: '', status: 1, venueId: VenueId }}
                        onClose={closeCreateModal}
                        setRefresh={setRefresh}
                        action={'create'}
                    />
                )}

                {popupProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to delete this image?`}
                        confirm={'DELETE'}
                        cancel={'CANCEL'}
                        color={'#dc354580'}
                        onConfirm={() => { disableImage(popupProps), setPopupProps(null) }}
                        onCancel={() => setPopupProps(null)}
                    />
                )}

                {deleteProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to delete this field?`}
                        confirm={'DELETE'}
                        cancel={'CANCEL'}
                        color={'#ff0000'}
                        onConfirm={() => { deleteSlot(deleteProps), setDeleteProps(null) }}
                        onCancel={() => setDeleteProps(null)}
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
