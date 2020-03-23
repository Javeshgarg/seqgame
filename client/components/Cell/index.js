import React, { Component } from 'react';
import classnames from 'classnames';
import styles from '../styles.css';

export default props => {
	const { color, ...others } = props;
	return (
		<td {...others}>
			<div
				className={classnames(
					color && [styles['coin'], styles['coin-' + color]],
				)}
			/>
		</td>
	);
};
