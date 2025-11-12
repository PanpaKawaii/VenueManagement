import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteData, fetchData, putData } from '../../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import Cube from '../../../../components/Cube/Cube';
import EditFieldModal from './EditFieldModal';

export default function FieldManagement() {
    const Params = useParams();
    const VenueId = Params.VenueId;
    const navigate = useNavigate();

    const [FIELDs, setFIELDs] = useState([]);
    const [TYPEs, setTYPEs] = useState([]);
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
                const FieldResponse = await fetchData('Field', token);
                console.log('FieldResponse', FieldResponse);
                const TypeResponse = await fetchData('Type', token);
                console.log('TypeResponse', TypeResponse);
                const SlotResponse = await fetchData('Slot', token);
                console.log('SlotResponse', SlotResponse);
                const BookingResponse = await fetchData('Booking', token);
                console.log('BookingResponse', BookingResponse);

                const Fields = FieldResponse
                    .filter(field => field.venueId == VenueId)
                    .map(field => ({
                        ...field,
                        type: TypeResponse.find(type => type.id == field.typeId) || null,
                        slots: SlotResponse.filter(slot => slot.fieldId == field.id) || []
                    }));
                const fieldsWithRating = Fields.map(field => {
                    const relatedBookings = BookingResponse.filter(
                        booking => booking.fieldId == field.id
                        // && booking.rating > 0
                    );
                    // console.log(`relatedBookings ${field.id}`, relatedBookings);/
                    const averageRating =
                        relatedBookings.length > 0
                            ? (
                                relatedBookings.reduce((sum, o) => sum + o.rating, 0) /
                                relatedBookings.length
                            ).toFixed(1)
                            : 0;
                    return { ...field, rating: parseFloat(averageRating) };
                });
                console.log('fieldsWithRating', fieldsWithRating);

                setFIELDs(fieldsWithRating);
                setTYPEs(TypeResponse);
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

    const disableField = async (field) => {
        const token = '';
        const newField = {
            name: field.name,
            description: field.description,
            status: field.status == 1 ? 0 : 1, // New Status
            venueId: field.venueId,
            typeId: field.typeId,
            id: field.id
        };
        try {
            const FieldResult = await putData(`Field/${newField.id}`, newField, token);
            console.log('FieldResult', FieldResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const deleteField = async (field) => {
        const token = '';
        try {
            const FieldResult = await deleteData(`Field/${field.id}`, token);
            console.log('FieldResult', FieldResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const [searchField, setSearchField] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const fieldsFilter = FIELDs.filter((field) => {
        const fieldName = field.name?.toLowerCase();
        const fieldType = field.type?.id;
        const fieldStatus = field.status;

        const matchSearch = !searchField || fieldName?.includes(searchField.toLowerCase());
        const matchSelectType = !selectedType || fieldType == selectedType;
        const matchSelectStatus = !selectedStatus || fieldStatus == selectedStatus;

        return matchSearch && matchSelectType && matchSelectStatus;
    });
    const handleClear = () => {
        setSearchField('');
        setSelectedType('');
        setSelectedStatus('');
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container field-management-container'>

                <header className='main-header'>
                    <div className='flex'>
                        <button className='btn-back' onClick={() => navigate(`/admin/venue-management`)}>
                            <i className='fa-solid fa-chevron-left' />
                        </button>
                        <h1>Field Management</h1>
                    </div>
                    <button className='btn-primary' onClick={() => openCreateModal(true)}>
                        <i className='fa-solid fa-plus' />
                        Add more field
                    </button>
                </header>

                <form className='controls'>
                    <div className='count'>{fieldsFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by name...' value={searchField} onChange={(e) => setSearchField(e.target.value)} />
                    </div>
                    <div className='field'>
                        <select id='formSelectedType' value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                            <option className='option' value={''}>-- Type --</option>
                            {TYPEs.map((type, i) => (
                                <option key={i} className='option' value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='field'>
                        <select id='formSelectedStatus' value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option className='option' value={''}>-- Status --</option>
                            <option className='option-active' value={1}>Active</option>
                            <option className='option-banned' value={0}>Disable</option>
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
                                <th>FIELD</th>
                                <th>RATING</th>
                                <th>DESCRIPTION</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fieldsFilter?.map((field, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`./${field.id}/slot-management`} className='field'>
                                            <div className='field-info'>
                                                <span className='name'>{field.name}</span>
                                                <span className='type'>{field.type?.name}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td><span className='rating'>{field.rating}<i className='fa-solid fa-star' /></span></td>
                                    <td><div className='description'>{field.description}</div></td>
                                    <td>
                                        <div className='action-buttons flex-buttons'>
                                            <button onClick={() => openEditModal(field)}>
                                                <span>Modify</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button>
                                            <button className={`btn-active ${field.status == 0 && 'abb'}`} onClick={() => setPopupProps(field)} disabled={field.status == 1}>
                                                <span>Active</span>
                                                <i className='fa-solid fa-unlock' />
                                            </button>
                                            <button className={`btn-banned ${field.status == 1 && 'abb'}`} onClick={() => setPopupProps(field)} disabled={field.status == 0}>
                                                <span>Disable</span>
                                                <i className='fa-solid fa-lock' />
                                            </button>
                                            <button className='btn-delete abb' onClick={() => setDeleteProps(field)}>
                                                <span>Delete</span>
                                                <i className='fa-solid fa-trash-can' />
                                            </button>
                                            <Link to={`./${field.id}/slot-management`}>
                                                <button>
                                                    <span>Detail ({field.slots?.length} slots)</span>
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {editing && (
                    <EditFieldModal
                        fieldprop={editing}
                        type={TYPEs}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                        action={'edit'}
                    />
                )}

                {creating && (
                    <EditFieldModal
                        fieldprop={{
                            name: 'field_name',
                            description: 'field_description',
                            status: 1,
                            venueId: VenueId,
                            typeId: 2
                        }}
                        type={TYPEs}
                        onClose={closeCreateModal}
                        setRefresh={setRefresh}
                        action={'create'}
                    />
                )}

                {popupProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to ${popupProps.status == 1 ? 'disable' : 'active'} this field?`}
                        confirm={popupProps.status == 1 ? 'DISABLE' : 'ACTIVE'}
                        cancel={'CANCEL'}
                        color={popupProps.status == 1 ? '#dc354580' : '#28a74580'}
                        onConfirm={() => { disableField(popupProps), setPopupProps(null) }}
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
                        onConfirm={() => { deleteField(deleteProps), setDeleteProps(null) }}
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
