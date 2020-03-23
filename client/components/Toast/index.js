import React, { Component } from 'react';
import styles from '../styles.css';
export default props => {
	return <div className={styles['toast']}>{props.message}</div>;
};
