import { combineReducers } from 'redux';
import headerTitleReducer from './HeaderTitleReducer';
import loaderReducer from './LoaderReducer';
import messageReducer from './MessageReducer';
import authReducer from './AuthReducer';
import modalReducer from './ModalReducer';

const rootReducer = combineReducers({ headerTitleReducer, loaderReducer, messageReducer, authReducer, modalReducer });

export default rootReducer;
