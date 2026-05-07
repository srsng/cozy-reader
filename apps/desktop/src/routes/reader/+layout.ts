export const prerender = false;

export async function load({ params }) {
    return {
        ...params
    };
}
