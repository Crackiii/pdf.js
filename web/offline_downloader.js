class Downloader {
  embedsData = null;
  videoFiles = null;
  videoData = null;
  videoURLs = null;
  el = null;
  videos = null;

  constructor() {
    this.embedsData = JSON.parse(localStorage.getItem("electron:embeds"));
    this.videoFiles = this.embedsData.data.map(datum => datum.clip.files);
    this.videoData = this.videoFiles
      .map(vidObj =>
        Object.values(vidObj).filter(v => /video/g.test(v.mimetype) && v.url)
      )
      .flat(Infinity)
      .map(video => ({ uuid: this.uuid(), ...video }));
    this.videoURLs = this.videoData.map(video => video.url + "/" + video.uuid);
    this.el = document.getElementById("downloads");
    this.videos = this.videoURLs.flat(Infinity);
  }

  initializeUI() {
    this.videoData.forEach(datum => {
      let name = datum.url.split("/");
      const id =
        name[name.length - 1].split(".")[0] +
        "/" +
        name[name.length - 2] +
        "/" +
        datum.uuid;
      this.el.insertAdjacentHTML(
        "beforeend",
        `<div class="single-download" data-id='${id}'>
                  <div class="download-sec">
                      <span>Video </span> <span class="name">${
                        name[name.length - 2]
                      } - ${this.bytesToSize(
          datum.size
        )} <span class="progress-text"></span></span>
                  </div>
                  <div class="progress-bar"></div>
              </div>`
      );
    });
  }

  _addDownloadState() {
    [...this.el.querySelectorAll(".progress-text")].forEach(
      el => (el.textContent = " - Downloading")
    );
  }

  // _chunksIntoSingle() {
  //   let chunksAll = new Uint8Array(this.receivedLength);
  //   let position = 0;
  //   for(let chunk of chunks) {
  //     chunksAll.set(chunk, position);
  //     position += chunk.length;
  //   }
  // }

  initializeDownload() {
    this._addDownloadState();
    this.videos.map(async video => {
      let name = video.split("/");
      const id =
        name[name.length - 2].split(".")[0] +
        "/" +
        name[name.length - 3] +
        "/" +
        name[name.length - 1];
      name.pop();
      const url = name.join("/");
      let response = await fetch(url, { method: "GET" });
      const reader = response.body.getReader();
      const contentLength = +response.headers.get("Content-Length");
      let receivedLength = 0;
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const event = new CustomEvent("onDownload", {
            detail: {
              id,
              chunks,
            },
          });
          window.dispatchEvent(event);
          break;
        }
        chunks.push(value);
        receivedLength += value.length;
        const event = new CustomEvent("onValueChanged", {
          detail: {
            progress: ((receivedLength / contentLength) * 100).toFixed(2),
            id,
          },
        });
        window.dispatchEvent(event);
      }
    });
  }

  bytesToSize(bytes) {
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }

  uuid() {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
}


export { Downloader };
