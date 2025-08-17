export const prerender = false;

export async function load({ params }) {
	return {
		book_id: params.book_id
	};
}
