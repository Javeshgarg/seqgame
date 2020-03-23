import React, { Component } from 'react';
import Dialog from '../Dialog';
import classnames from 'classnames';
import styles from '../styles.css';

export default props => {
	const content = (
		<div>
			{props.options.map(card => (
				<div
					className={classnames(styles['card'], styles[`card_${card}`])}
					onClick={() => props.onClose(card)}
				/>
			))}
		</div>
	);
	return props.options.length ? (
		<Dialog title='Pick one of your cards'>{content}</Dialog>
	) : null;
};
