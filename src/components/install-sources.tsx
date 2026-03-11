import { ObtainiumButton } from "~/components/obtainium-button";
import { SourceBadge } from "~/components/source-badge";

interface InstallSourcesProps {
	sources: Array<{
		id: string;
		source: string;
		url: string;
		packageName: string | null;
		metadata?: Record<string, unknown> | null;
	}>;
	appName: string;
}

export function InstallSources({ sources, appName }: InstallSourcesProps) {
	return (
		<section>
			<h2 className="mb-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
				Install Sources
			</h2>
			<div className="flex flex-wrap items-center gap-2">
				{sources.map((source) => (
					<SourceBadge
						key={source.id}
						source={source.source}
						url={source.url}
					/>
				))}
			</div>
			<div className="mt-4">
				<ObtainiumButton appName={appName} sources={sources} />
			</div>
		</section>
	);
}
