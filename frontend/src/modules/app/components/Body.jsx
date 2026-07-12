import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router';
import Container from 'react-bootstrap/Container';

import AppGlobalComponents from './AppGlobalComponents';
import Home from './Home';
import { Login, SignUp, Profile, Logout, Notifications, NotificationDetail } from '../../users';
import users from '../../users';

const Body = () => {

    const loggedIn = useSelector(users.selectors.isLoggedIn);

    return (

        <Container className="my-4 justify-content-center flex-grow-1">
            <AppGlobalComponents />
            <Routes>
                <Route path="/*" element={<Home />} />
                {loggedIn && <Route path="/users/profile" element={<Profile />} />}
                {loggedIn && <Route path="/users/notifications" element={<Notifications />} />}
                {loggedIn && <Route path="/users/notifications/:notificationId" element={<NotificationDetail />} />}
                {loggedIn && <Route path="/users/logout" element={<Logout />} />}
                {!loggedIn && <Route path="/users/login" element={<Login />} />}
                {!loggedIn && <Route path="/users/signup" element={<SignUp />} />}
            </Routes>
        </Container>

    );

};

export default Body;
