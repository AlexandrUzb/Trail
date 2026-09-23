async function test() {
  try {
    const res = await fetch('https://lex.uz/docs/97664');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Length:', text.length);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
