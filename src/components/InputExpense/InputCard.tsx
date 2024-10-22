import React from "react";
// import Popup from 'reactjs-popup';
import styles from "./inputCard.module.css";

export default function InputCard() {
	return (
		<div>
			<h4>Popup - GeeksforGeeks</h4>
			<Popup trigger={<button>Click to open modal</button>} modal nested>
				hi
			</Popup>
		</div>
	);
}
