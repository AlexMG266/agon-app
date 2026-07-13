import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Header from './Header';
import Body from './Body';
import ScrollToTop from './ScrollToTop';
import users from '../../users';
import backend from '../../../backend';

const App = () => {

    const dispatch = useDispatch();

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
            <Header/>
            <Body/>
        </div>
    );

}
    
export default App;