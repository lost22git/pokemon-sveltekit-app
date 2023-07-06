export const load = async ({
  // @ts-ignore i dont knonw the type of fetch, fix me
  fetch,
}) => {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
    if (res.ok) {
      const content = await res.json();
      return { err: false, content: content };
    } else {
      const content = await res.text();
      return { err: true, status: res.status, content: content };
    }
  } catch (error) {
    return { err: true, status: 1111, content: error };
  }
};
