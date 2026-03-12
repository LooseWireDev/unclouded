import {
	avatarColorFromName,
	avatarTextColorFromName,
} from "~/lib/avatar-color";
import { cn } from "~/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
	xs: "size-5 rounded text-[10px]",
	sm: "size-8 rounded-lg text-sm",
	md: "size-10 rounded-lg text-base",
	lg: "size-16 rounded-xl text-2xl",
};

interface AppAvatarProps {
	name: string;
	iconUrl?: string | null;
	size?: AvatarSize;
	className?: string;
}

export function AppAvatar({
	name,
	iconUrl,
	size = "md",
	className,
}: AppAvatarProps) {
	const sizeClass = sizeClasses[size];

	if (iconUrl) {
		return (
			<img
				src={iconUrl}
				alt=""
				className={cn("shrink-0 object-cover", sizeClass, className)}
				loading="lazy"
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center font-semibold",
				sizeClass,
				className,
			)}
			style={{
				backgroundColor: avatarColorFromName(name),
				color: avatarTextColorFromName(name),
			}}
		>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
