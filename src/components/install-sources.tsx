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
	appId: string;
	appName: string;
}

export function InstallSources({ sources, appId, appName }: InstallSourcesProps) {
	return (
		<div>
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
				<ObtainiumButton appId={appId} appName={appName} sources={sources} />
			</div>
		</div>
	);
}
