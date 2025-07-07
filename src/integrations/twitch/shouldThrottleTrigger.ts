import { ShouldThrottle } from "./shouldThrottle";

export function ShouldThrottleTrigger(
  lastTriggered: Date | null,
  cooldownSeconds: number,
  userThrottle: boolean): boolean {

	let timePeriod = 0;
	if (lastTriggered !== null) {
		timePeriod = Date.now() - lastTriggered.getTime();
	}

	return ShouldThrottle({
					any: timePeriod,
					user: 0
				}, 
				cooldownSeconds, 
				userThrottle);
}
