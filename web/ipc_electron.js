const ipcRenderer  = window.require('electron').ipcRenderer;
//Clear the localstorage when application is quitted/closed
window.addEventListener("message", ({ data }) => {
  if (data.type === "electron:reload") {
    ipcRenderer.send("electron:reload");
  }
});

ipcRenderer.on("pdf:url", _ => localStorage.clear());
