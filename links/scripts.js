function addLink() {
  const title = document.getElementById("link-title").value.trim();
  const url = document.getElementById("link-url").value.trim();

  if (!title || !url) {
    alert("Please fill in both fields.");
    return;
  }

  const linkList = document.getElementById("link-list");
  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  a.target = "_blank";
  linkList.appendChild(a);

  // Clear inputs
  document.getElementById("link-title").value = "";
  document.getElementById("link-url").value = "";
}
