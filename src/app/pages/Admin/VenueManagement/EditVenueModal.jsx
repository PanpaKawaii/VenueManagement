import { useState } from 'react';
import { postData, putData } from '../../../../mocks/CallingAPI';
import LeafletMap from './LeafletMap';

export default function EditVenueModal({ venueprop, user, onClose, setRefresh, action }) {
    const [venue, setVenue] = useState(venueprop);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const DefaultAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxXTuxRJzWsUA0uiZKT-_79osm34J9fwZ9A&s';

    const Update = async (venue) => {
        const token = '';
        const newVenue = { ...venue, longitude: `${venue.longitude}`, latitude: `${venue.latitude}` };
        try {
            const VenueResult = await putData(`Venue/${newVenue.id}`, newVenue, token);
            onClose();
            setRefresh(p => p + 1);
        } catch (error) {
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    const Upload = async (venue) => {
        const token = '';
        const newVenue = { ...venue, longitude: `${venue.longitude}`, latitude: `${venue.latitude}` };
        try {
            const VenueResult = await postData('Venue', newVenue, token);
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
        setVenue((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (action == 'edit') Update(venue);
        else if (action == 'create') Upload(venue);
    };

    return (
        <div className='edit-modal'>
            <div className='modal-box venue-box'>
                <button className='btn close-btn' onClick={() => onClose()}><i className='fa-solid fa-xmark'></i></button>
                <div className='flex'>
                    <form onSubmit={handleSubmit} className='user-edit-form'>
                        <div className='edit-title'>Edit Venue</div>
                        <div className='input-group'>
                            <select id='formUserId' name='userId' value={venue.userId} onChange={handleChange}>
                                {user?.map((u, i) => (
                                    <option key={i} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <label htmlFor='userId'>User</label>
                        </div>
                        <div className='input-group'>
                            <input name='name' placeholder=' ' value={venue.name} onChange={handleChange} required />
                            <label htmlFor='name'>Name</label>
                        </div>
                        {venue.id &&
                            <div className='input-group'>
                                <input name='id' placeholder=' ' value={venue.id} disabled />
                                <label htmlFor='id' className='disable'>ID</label>
                            </div>
                        }
                        <div className='input-group'>
                            <input name='contact' placeholder=' ' value={venue.contact} onChange={handleChange} required />
                            <label htmlFor='contact'>Phone</label>
                        </div>
                        <div className='input-group group-1'>
                            <label htmlFor='address'>Address</label>
                            <textarea
                                name='address'
                                placeholder=' '
                                value={venue.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='column'>
                            <div className='flex'>
                                <div className='input-group'>
                                    <input name='latitude' placeholder=' ' value={venue.latitude} onChange={handleChange} required />
                                    <label htmlFor='latitude'>Latitude</label>
                                </div>
                                <div className='input-group'>
                                    <input name='longitude' placeholder=' ' value={venue.longitude} onChange={handleChange} required />
                                    <label htmlFor='longitude'>Longitude</label>
                                </div>
                            </div>
                        </div>
                        <div className='btn-box'>
                            <button type='submit' className='btn-save' disabled={loading}>SAVE</button>
                            <button type='button' onClick={() => onClose()}>CANCEL</button>
                        </div>
                    </form>
                    <div className='leafletmap-div'>
                        <LeafletMap
                            location={{
                                name: venue.name,
                                latitude: Number(venue.latitude) || 0,
                                longitude: Number(venue.longitude) || 0
                            }}
                            height={'240px'}
                            getLocation={true}
                            onMapClick={(coords) => {
                                // alert(`Bạn đã click vào: ${coords.latitude}, ${coords.longitude}, ${coords.address}`);
                                setVenue((prev) => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude, address: coords.address }))
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
