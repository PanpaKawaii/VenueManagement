import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/Login.jsx';
import NavigationBar from '../pages/Admin/NavigationBar/NavigationBar.jsx';
import UserManagement from '../pages/Admin/UserManagement/UserManagement.jsx';
import OrderManagement from '../pages/Admin/OrderManagement/OrderManagement.jsx';
import TransactionManagement from '../pages/Admin/TransactionManagement/TransactionManagement.jsx';
import RevenueManagement from '../pages/Admin/RevenueManagement/RevenueManagement.jsx';

import VenueManagement from '../pages/Admin/VenueManagement/VenueManagement.jsx';
import FieldManagement from '../pages/Admin/VenueManagement/FieldManagement/FieldManagement.jsx';
import ImageManagement from '../pages/Admin/VenueManagement/ImageManagement/ImageManagement.jsx';
import SlotManagement from '../pages/Admin/VenueManagement/FieldManagement/SlotManagement/SlotManagement.jsx';

export default function MainRoutes() {
    return (
        <BrowserRouter>
            <></>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/admin' element={<Navigate to='/admin/venue-management' replace />} />
                <Route path='/admin' element={<NavigationBar />} >
                    {/* <Route path='user-management' element={<UserManagement />} />
                    <Route path='order-management' element={<OrderManagement />} />
                    <Route path='transaction-management' element={<TransactionManagement />} />
                    <Route path='revenue-management' element={<RevenueManagement />} /> */}

                    <Route path='venue-management' element={<VenueManagement />} />
                    <Route path='venue-management/:VenueId/field-management' element={<FieldManagement />} />
                    <Route path='venue-management/:VenueId/image-management' element={<ImageManagement />} />
                    <Route path='venue-management/:VenueId/field-management/:FieldId/slot-management' element={<SlotManagement />} />
                </Route>
                <Route path='*' element={<></>} />
            </Routes>
            <></>
        </BrowserRouter>
    )
}
