import React, { useState, useEffect } from "react";
import styles from "./NewGoalForm.module.css";
import { X } from "lucide-react";

interface NewGoalFormProps {
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (goalData: {
		title: string;
		targetAmount: number;
		tags?: string[];
		amountSaved?: number;
	}) => void;
	type: "budget" | "savings";
	initialData?: {
		title: string;
		targetAmount: number;
		tags?: { name: string }[];
		amountSaved?: number;
	};
}

const NewGoalForm: React.FC<NewGoalFormProps> = ({
	isVisible,
	onClose,
	onSubmit,
	type,
	initialData,
}) => {
	const [formData, setFormData] = useState<{
		title: string;
		targetAmount: string;
		amountSaved?: string;
		tags?: string;
	}>({
		title: initialData?.title || "",
		targetAmount: initialData?.targetAmount.toString() || "",
		amountSaved: initialData?.amountSaved?.toString() || "",
		tags:
			type === "budget"
				? initialData?.tags?.map((tag) => tag.name).join(", ") || ""
				: undefined,
	});

	const [isClosing, setIsClosing] = useState(false);

	// Reset form when initialData changes
	useEffect(() => {
		if (initialData) {
			setFormData({
				title: initialData.title,
				targetAmount: initialData.targetAmount.toString(),
				amountSaved: initialData.amountSaved?.toString() || "",
				tags:
					type === "budget"
						? initialData.tags?.map((tag) => tag.name).join(", ") ||
						  ""
						: undefined,
			});
		} else {
			setFormData({
				title: "",
				targetAmount: "",
				amountSaved: type === "savings" ? "" : undefined,
				tags: type === "budget" ? "" : undefined,
			});
		}
	}, [initialData, type]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			...formData,
			targetAmount: parseFloat(formData.targetAmount),
			amountSaved: formData.amountSaved
				? parseFloat(formData.amountSaved)
				: undefined,
			tags: formData.tags?.split(",").map((tag) => tag.trim()) || [],
		});
		onClose();
	};

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			onClose();
			setIsClosing(false);
		}, 300);
	};

	if (!isVisible) return null;

	return (
		<div className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}>
			<div
				className={`${styles.container} ${
					isClosing ? styles.closing : ""
				}`}
			>
				<button onClick={handleClose} className={styles.closeButton}>
					<X size={24} />
				</button>
				<div className={styles.header}>
					<h2>
						{type === "budget"
							? "New Budget Goal"
							: "New Savings Goal"}
					</h2>
				</div>

				<div className={styles.formContent}>
					<form onSubmit={handleSubmit}>
						<div className={styles.formGroup}>
							<label htmlFor='title'>Title</label>
							<input
								type='text'
								id='title'
								value={formData.title}
								onChange={(e) =>
									setFormData({
										...formData,
										title: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor='targetAmount'>Target Amount</label>
							<input
								type='number'
								id='targetAmount'
								value={formData.targetAmount}
								onKeyDown={(e) => {
									if (e.key === "-") e.preventDefault();
								}}
								onChange={(e) =>
									setFormData({
										...formData,
										targetAmount: e.target.value,
									})
								}
								required
							/>
						</div>

						{type === "savings" && (
							<div className={styles.formGroup}>
								<label htmlFor='amountSaved'>
									Amount Saved
								</label>
								<input
									type='number'
									id='amountSaved'
									value={formData.amountSaved}
									onChange={(e) =>
										setFormData({
											...formData,
											amountSaved: e.target.value,
										})
									}
									onKeyDown={(e) => {
										if (e.key === "-") e.preventDefault();
									}}
								/>
							</div>
						)}

						{type === "budget" && (
							<div className={styles.formGroup}>
								<label htmlFor='tags'>
									Tags you want to Track (comma-separated)
								</label>
								<input
									type='text'
									id='tags'
									value={formData.tags}
									onChange={(e) =>
										setFormData({
											...formData,
											tags: e.target.value,
										})
									}
									placeholder='e.g., groceries, coffee, dining'
								/>
							</div>
						)}

						<div className={styles.formActions}>
							<button
								type='button'
								onClick={handleClose}
								className={styles.cancelBtn}
							>
								Cancel
							</button>
							<button type='submit' className={styles.submitBtn}>
								Create Goal
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default NewGoalForm;
