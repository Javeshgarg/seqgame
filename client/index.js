import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/App';
import Game from './components/Game';
import Home from './components/Home';
import configure from './store';

const store = configure();
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Route path='/' component={App}>
				<IndexRoute component={Home} />
				<Route path='/room/:gameId' component={Game} />
			</Route>
		</Router>
	</Provider>,
	document.getElementById('root'),
);
