// Usage:
// <ObtainiumButton appId={app.id} appName={app.name} sources={app.sources} />
// Place in app detail install-sources section and alternative-card

import { ArrowDown01Icon, Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { getObtainiumSources, type SourceInfo } from "~/lib/obtainium";
import { trackDownload } from "~/lib/server-fns";
import type { SourceType } from "../../db/schema";

interface ObtainiumButtonProps {
	appId: string;
	appName: string;
	sources: SourceInfo[];
}

function track(appId: string, source: string) {
	trackDownload({ data: { appId, source: source as SourceType } }).catch(
		() => {},
	);
}

export function ObtainiumButton({
	appId,
	appName,
	sources,
}: ObtainiumButtonProps) {
	const obtainiumSources = getObtainiumSources(appName, sources);

	if (obtainiumSources.length === 0) return null;

	if (obtainiumSources.length === 1) {
		const { link, source } = obtainiumSources[0];
		return (
			<Tooltip>
				<TooltipTrigger
					render={
						// biome-ignore lint/a11y/useAnchorContent: Button children provide content
						<Button
							render={<a href={link} />}
							onClick={() => track(appId, source)}
						>
							<HugeiconsIcon
								icon={Download04Icon}
								strokeWidth={2}
								data-icon="inline-start"
							/>
							Add to Obtainium
						</Button>
					}
				/>
				<TooltipContent>
					Obtainium is an Android app for installing and updating open source
					apps
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Tooltip>
			<DropdownMenu>
				<TooltipTrigger
					render={
						<DropdownMenuTrigger
							render={
								<Button>
									<HugeiconsIcon
										icon={Download04Icon}
										strokeWidth={2}
										data-icon="inline-start"
									/>
									Add to Obtainium
									<HugeiconsIcon
										icon={ArrowDown01Icon}
										strokeWidth={2}
										data-icon="inline-end"
									/>
								</Button>
							}
						/>
					}
				/>
				<DropdownMenuContent align="end">
					{obtainiumSources.map((entry) => (
						<DropdownMenuItem
							key={entry.source}
							render={
								// biome-ignore lint/a11y/useAnchorContent: MenuItem children provide content
								<a href={entry.link} />
							}
							onClick={() => track(appId, entry.source)}
						>
							{entry.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<TooltipContent>
				Obtainium is an Android app for installing and updating open source apps
			</TooltipContent>
		</Tooltip>
	);
}
