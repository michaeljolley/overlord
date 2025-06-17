import { Credit, CreditRoll } from "../types/credit";

export abstract class CreditStore {

	static credits: Record<string, Credit> = {};

	public static addCredit = (payload: Credit) => {
		const { type, user } = payload;

		const key = `${type}:${user.id}`;

		if (!this.credits[key]) {
			this.credits[key] = payload;
		}
	}

	public static clearCredits = () => {
		this.credits = {};
	}

	public static getCredits = (): CreditRoll[] => {
		const types: string[] = [];
		const results: CreditRoll[] = [];
		
		Object.values(this.credits).forEach((credit) => {
			if (!types.includes(credit.type)) {
				types.push(credit.type);
			}
		});

		types.forEach((type) => {
			const users = Object.values(this.credits)
													.filter((credit) => credit.type === type)
													.map((credit) => credit.user);
			results.push({ type, users });
		});

		return results;
	}
}
