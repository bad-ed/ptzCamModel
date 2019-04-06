import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import rootReducer from './reducers';
import { Article } from './components/Article';

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <Article />
    </Provider>,
document.getElementById('root'));
