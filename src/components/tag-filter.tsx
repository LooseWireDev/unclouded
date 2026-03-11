import { Checkbox } from "~/components/ui/checkbox";

interface Tag {
	name: string;
	slug: string;
}

interface TagFilterProps {
	tags: Record<string, Tag[]>;
	selectedSlugs: string[];
	onToggle: (slug: string) => void;
}

export function TagFilter({ tags, selectedSlugs, onToggle }: TagFilterProps) {
	return (
		<div className="flex flex-col gap-6">
			{Object.entries(tags).map(([group, groupTags]) => (
				<div key={group}>
					<h3 className="mb-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
						{group}
					</h3>
					<div className="flex flex-col gap-2">
						{groupTags.map((tag) => (
							// biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders an input inside the label
							<label
								key={tag.slug}
								className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
							>
								<Checkbox
									checked={selectedSlugs.includes(tag.slug)}
									onCheckedChange={() => onToggle(tag.slug)}
								/>
								{tag.name}
							</label>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
