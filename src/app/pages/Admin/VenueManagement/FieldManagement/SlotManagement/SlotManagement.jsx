import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteData, fetchData, putData } from '../../../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../../../components/ConfirmDialog/ConfirmDialog';
import Cube from '../../../../../components/Cube/Cube';
import EditSlotModal from './EditSlotModal';

export default function SlotManagement() {
    const Params = useParams();
    const FieldId = Params.FieldId;
    const navigate = useNavigate();

    const [SLOTs, setSLOTs] = useState([]);
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
                const SlotResponse = await fetchData('Slot', token);
                console.log('SlotResponse', SlotResponse);

                const Slots = SlotResponse.filter(slot => slot.fieldId == FieldId);
                console.log('Slots', Slots);

                setSLOTs(Slots);
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

    const disableSlot = async (slot) => {
        const token = '';
        const newSlot = { ...slot, status: slot.status == 1 ? 0 : 1 };
        try {
            const SlotResult = await putData(`Slot/${newSlot.id}`, newSlot, token);
            console.log('SlotResult', SlotResult);
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

    // FIX==Filter
    const [searchSlot, setSearchSlot] = useState('');
    const slotsFilter = SLOTs.filter((slot) => {
        const slotName = slot.name?.toLowerCase();
        const matchSearch = !searchSlot || slotName?.includes(searchSlot.toLowerCase());
        return matchSearch;
    });
    const handleClear = () => {
        setSearchSlot('');
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container slot-management-container'>

                <header className='main-header'>
                    <div className='flex'>
                        <button className='btn-back' onClick={() => navigate(-1)}>
                            <i className='fa-solid fa-chevron-left' />
                        </button>
                        <h1>Slot Management</h1>
                    </div>
                    <button className='btn-primary' onClick={() => openCreateModal(true)}>
                        <i className='fa-solid fa-plus' />
                        Add more slot
                    </button>
                </header>

                <form className='controls'>
                    <div className='count'>{slotsFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by name, email, phone...' value={searchSlot} onChange={(e) => setSearchSlot(e.target.value)} />
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
                                <th>NAME</th>
                                <th>START</th>
                                <th>END</th>
                                <th>PRICE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slotsFilter?.map((slot, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{slot.name}</td>
                                    <td>{slot.startTime}</td>
                                    <td>{slot.endTime}</td>
                                    <td>{Number(slot.price || 0)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                    <td>
                                        <div className='action-buttons flex-buttons'>
                                            <button onClick={() => openEditModal(slot)}>
                                                <span>Modify</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button>
                                            <button className={`btn-active ${slot.status == 0 && 'abb'}`} onClick={() => setPopupProps(slot)} disabled={slot.status == 1}>
                                                <span>Active</span>
                                                <i className='fa-solid fa-unlock' />
                                            </button>
                                            <button className={`btn-banned ${slot.status == 1 && 'abb'}`} onClick={() => setPopupProps(slot)} disabled={slot.status == 0}>
                                                <span>Disable</span>
                                                <i className='fa-solid fa-lock' />
                                            </button>
                                            <button className='btn-delete abb' onClick={() => setDeleteProps(slot)}>
                                                <span>Delete</span>
                                                <i className='fa-solid fa-trash-can' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {editing && (
                    <EditSlotModal
                        slotprop={editing}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                        action={'edit'}
                    />
                )}

                {creating && (
                    <EditSlotModal
                        slotprop={{
                            name: 'slot_name',
                            startTime: '00:00:00',
                            endTime: '00:00:00',
                            price: 0,
                            status: 1,
                            fieldId: FieldId
                        }}
                        onClose={closeCreateModal}
                        setRefresh={setRefresh}
                        action={'create'}
                    />
                )}

                {popupProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to delete this slot?`}
                        confirm={'DELETE'}
                        cancel={'CANCEL'}
                        color={'#dc354580'}
                        onConfirm={() => { disableSlot(popupProps), setPopupProps(null) }}
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
