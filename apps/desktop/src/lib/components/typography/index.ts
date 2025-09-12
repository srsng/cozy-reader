import Blockquote from './blockquote.svelte';
import Heading from './heading.svelte';
import Image from './image.svelte';
import Link from './link.svelte';
import Text from './text.svelte';
import Strong from './strong.svelte';
import Html from './html.svelte';
import Paragraph from './paragraph.svelte';
import Br from './br.svelte';
import Em from './em.svelte';
import Code from './code.svelte';
import { Separator as Hr } from '@cozy/ui/separator';
import ListItem from './list-item.svelte';
import List from './list.svelte';
import Codespan from './codespan.svelte';

const renderers = {
	blockquote: Blockquote,
	code: Code,
	codespan: Codespan,
	heading: Heading,
	image: Image,
	link: Link,
	text: Text,
	strong: Strong,
	html: Html,
	paragraph: Paragraph,
	br: Br,
	em: Em,
	hr: Hr,
	list: List,
	list_item: ListItem
};

export {
	Blockquote,
	Heading,
	Image,
	Link,
	Text,
	Strong,
	Html,
	Paragraph,
	Br,
	Em,
	Hr,
	Code,
	renderers
};
