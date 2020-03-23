import React, { Component } from 'react';
import styles from '../styles.css';

export default props => {
	return (
		<div className={styles['overlay']}>
			<div className={styles['popup']}>
				<h2>{props.title}</h2>
				{props.children}
			</div>
		</div>
	);
};
