const sender = document.getElementById("sender");
const output = document.getElementById("output");

sender.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const url = form.get("url").trim();

  try {
    const res = await fetch("/api/shorten", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!res.ok) {
      output.innerHTML = `<span class="error">${data.message}</span>`;
      return;
    }

    output.innerHTML = `<a href="${data.short}" target="_blank">${data.short}</a>`;
  } catch (err) {
    output.innerHTML = `<span class="error">Error: ${err.message}</span>`;
  }
});
