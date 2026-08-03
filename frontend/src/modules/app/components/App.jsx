import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Header from './Header';
import Body from './Body';
import ScrollToTop from './ScrollToTop';
import users from '../../users';
import backend from '../../../backend';

const App = () => {

    const dispatch = useDispatch();

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const toggleMobileDrawer = useCallback(() => {
        setMobileDrawerOpen(prev => !prev);
    }, []);

    const closeMobileDrawer = useCallback(() => {
        setMobileDrawerOpen(false);
    }, []);

    useEffect(() => {

        const tryLoginFromServiceToken = async () => {
            const response = await backend.userService.tryLoginFromServiceToken(
                () => dispatch(users.actions.logout()));
            if (response.ok) {
                dispatch(users.actions.loginCompleted(response.payload));
            }
        }

        tryLoginFromServiceToken();
    
    }, [dispatch]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <ScrollToTop />
            <Header
                mobileDrawerOpen={mobileDrawerOpen}
                onToggleMobileDrawer={toggleMobileDrawer}
                onCloseMobileDrawer={closeMobileDrawer}
            />
            <Body mobileDrawerOpen={mobileDrawerOpen} onCloseMobileDrawer={closeMobileDrawer} />
        </div>
    );

}
    
export default App;