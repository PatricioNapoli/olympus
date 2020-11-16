import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import rootReducer from './reducers/index';

export const store = createStore(rootReducer, applyMiddleware(ReduxThunk));
