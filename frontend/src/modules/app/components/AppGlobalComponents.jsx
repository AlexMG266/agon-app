import {useSelector, useDispatch} from 'react-redux';

import {ErrorDialog} from '../../common';
import * as actions from '../actions';
import * as selectors from '../selectors';

const ConnectedErrorDialog = () => {

    const error = useSelector(selectors.getError);
    const dispatch = useDispatch();

    return <ErrorDialog error={error} 
                onClose={() => dispatch(actions.error(null))}/>

};

const AppGlobalComponents = () => (

    <div>
        <ConnectedErrorDialog/>
    </div>

);

export default AppGlobalComponents;
