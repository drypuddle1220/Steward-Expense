// db.d.ts
declare module "../../Backend/config/db" {
	export function register(
		email: string,
		password: string,
		firstName: string,
		lastName: string
	): Promise<void>;
}
