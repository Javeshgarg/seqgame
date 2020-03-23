import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions';

class App extends Component {
	render() {
		const { children, ...others } = this.props;
		return <div>{React.cloneElement(children, { ...others })}</div>;
	}
}

function mapStateToProps(state) {
	return {
		...state.data,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(Actions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
