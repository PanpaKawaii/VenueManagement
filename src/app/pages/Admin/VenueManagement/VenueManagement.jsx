import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteData, fetchData, putData } from '../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Cube from '../../../components/Cube/Cube';
import './VenueManagement.css';
import EditVenueModal from './EditVenueModal';
import LeafletMap from './LeafletMap';

export default function VenueManagement() {
    const [VENUEs, setVENUEs] = useState([]);
    const [USERs, setUSERs] = useState([]);
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
                const VenueResponse = await fetchData('Venue', token);
                console.log('VenueResponse', VenueResponse);
                const ImageResponse = await fetchData('Image', token);
                console.log('ImageResponse', ImageResponse);
                const UserResponse = await fetchData('User/GetIdAndName', token);
                console.log('UserResponse', UserResponse);

                const Venues = VenueResponse.map(venue => ({
                    ...venue,
                    user: UserResponse.find(user => user.id == venue.userId) || null,
                    images: ImageResponse.filter(image => image.venueId == venue.id) || null
                }));
                console.log('Venues', Venues);

                setVENUEs(Venues);
                setUSERs(UserResponse);
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

    const disableVenue = async (venue) => {
        const token = '';
        const newVenue = { ...venue, status: venue.status == 1 ? 0 : 1 };
        try {
            const VenueResult = await putData(`Venue/${newVenue.id}`, newVenue, token);
            console.log('VenueResult', VenueResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const deleteVenue = async (venue) => {
        const token = '';
        try {
            const VenueResult = await deleteData(`Venue/${venue.id}`, token);
            console.log('VenueResult', VenueResult);
            setRefresh(p => p + 1);
        } catch (error) {
            setErrorFunction('Error');
        }
    }

    const [searchVenue, setSearchVenue] = useState('');
    const [select, setSelect] = useState(1);
    const venuesFilter = VENUEs.filter((venue) => {
        const venueName = venue.name?.toLowerCase();
        const venuePhone = venue.contact?.toLowerCase();
        const venueAddress = venue.address?.toLowerCase();
        const venueStatus = venue.status;

        const matchSearch = !searchVenue
            || venueName?.includes(searchVenue.toLowerCase())
            || venuePhone?.includes(searchVenue.toLowerCase())
            || venueAddress?.includes(searchVenue.toLowerCase());
        const matchSelect = !select || venueStatus == select;

        return matchSearch && matchSelect;
    });
    const handleClear = () => {
        setSearchVenue('');
        setSelect('');
    }

    if (loading) return <div className='admin-container'><Cube color={'#007bff'} setRefresh={() => { }} /></div>
    if (error) return <div className='admin-container'><Cube color={'#dc3545'} setRefresh={setRefresh} /></div>
    return (
        <div className='admin-container'>
            <div className='inner-container management-container venue-management-container'>

                <header className='main-header'>
                    <h1>Venue Management</h1>
                    <button className='btn-primary' onClick={() => openCreateModal(true)}>
                        <i className='fa-solid fa-plus' />
                        Add more venue
                    </button>
                </header>

                <form className='controls'>
                    <div className='count'>{venuesFilter?.length} results</div>
                    <div className='search-bar'>
                        <i className='fa-solid fa-magnifying-glass' />
                        <input type='text' placeholder='Search by name, phone, address...' value={searchVenue} onChange={(e) => setSearchVenue(e.target.value)} />
                    </div>
                    <div className='field'>
                        <select id='formSelect' value={select} onChange={(e) => setSelect(e.target.value)}>
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
                                <th>VENUE</th>
                                <th>CONTACT</th>
                                <th>ADDRESS</th>
                                <th>LOCATION</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venuesFilter?.map((venue, index) => (
                                <tr key={index}>
                                    <td>#{index + 1}/ID{venue.id}</td>
                                    <td className='relative'>
                                        <Link to={`./${venue.id}/field-management`} className='venue-name-cell'>
                                            <div className='image'>
                                                <img src={venue.images?.[0]?.link || null} alt={venue.name} />
                                            </div>
                                        </Link>
                                        <Link to={`./${venue.id}/image-management`} className='to-image'><i className='fa-solid fa-plus'/></Link>
                                    </td>
                                    <td>
                                        <div className='contact'>
                                            <div className='name'>{venue.name}</div>
                                            <div className='contact-user'><i className='fa-solid fa-user' />{venue.user?.name}</div>
                                            <div className='contact-phone'><i className='fa-solid fa-phone' />{venue.contact}</div>
                                        </div>
                                    </td>
                                    <td><div className='address'>{venue.address}</div></td>
                                    <td>
                                        <LeafletMap location={{ name: venue.name, latitude: Number(venue.latitude) || 0, longitude: Number(venue.longitude) || 0 }} height={'160px'} getLocation={false} />
                                    </td>
                                    <td>
                                        <div className='action-buttons'>
                                            <button onClick={() => openEditModal(venue)}>
                                                <span>Modify</span>
                                                <i className='fa-solid fa-pencil' />
                                            </button>
                                            <button className={`btn-active ${venue.status == 0 && 'abb'}`} onClick={() => setPopupProps(venue)} disabled={venue.status == 1}>
                                                <span>Active</span>
                                                <i className='fa-solid fa-unlock' />
                                            </button>
                                            <button className={`btn-banned ${venue.status == 1 && 'abb'}`} onClick={() => setPopupProps(venue)} disabled={venue.status == 0}>
                                                <span>Disable</span>
                                                <i className='fa-solid fa-lock' />
                                            </button>
                                            <button className='btn-delete abb' onClick={() => setDeleteProps(venue)}>
                                                <span>Delete</span>
                                                <i className='fa-solid fa-trash-can' />
                                            </button>
                                            <Link to={`./${venue.id}/field-management`}>
                                                <button>
                                                    <span>Detail ({venue.fields?.length} fields)</span>
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
                    <EditVenueModal
                        venueprop={editing}
                        user={USERs}
                        onClose={closeEditModal}
                        setRefresh={setRefresh}
                        action={'edit'}
                    />
                )}

                {creating && (
                    <EditVenueModal
                        venueprop={{
                            name: 'venue_name',
                            address: 'venue_address',
                            longitude: 0,
                            latitude: 0,
                            contact: 'venue_contact',
                            status: 1,
                            userId: 1
                        }}
                        user={USERs}
                        onClose={closeCreateModal}
                        setRefresh={setRefresh}
                        action={'create'}
                    />
                )}

                {popupProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to ${popupProps.status == 1 ? 'disable' : 'active'} this venue?`}
                        confirm={popupProps.status == 1 ? 'DISABLE' : 'ACTIVE'}
                        cancel={'CANCEL'}
                        color={popupProps.status == 1 ? '#dc354580' : '#28a74580'}
                        onConfirm={() => { disableVenue(popupProps), setPopupProps(null) }}
                        onCancel={() => setPopupProps(null)}
                    />
                )}

                {deleteProps && (
                    <ConfirmDialog
                        title={'CONFIRMATION'}
                        message={`Are you sure you want to delete this venue?`}
                        confirm={'DELETE'}
                        cancel={'CANCEL'}
                        color={'#ff0000'}
                        onConfirm={() => { deleteVenue(deleteProps), setDeleteProps(null) }}
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
