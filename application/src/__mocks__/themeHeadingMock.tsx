import type { ElementType, JSX, ReactNode } from "react";

export default function Heading({
	as = "h2",
	children,
	...props
}: {
	as?: keyof JSX.IntrinsicElements;
	children?: ReactNode;
	[key: string]: unknown;
}) {
	const Component = as as ElementType;
	return <Component {...props}>{children}</Component>;
}
