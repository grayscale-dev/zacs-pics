import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import uploadToContainer from "./utils/UploadBlob";
import resizeImageFile from "./utils/ResizeImage";

function App() {
  // ← Drop the "<string[]>" type annotation — useState([]) is all you need in plain JS
  const [blobs, setBlobs] = useState([]);

  async function listBlobsInContainer() {
    try {
      const listBlobsUrl =
        "https://stgzaqcam.blob.core.windows.net/content?restype=container&comp=list";

      const response = await fetch(listBlobsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const blobElements = xmlDoc.getElementsByTagName("Blob");
      const blobList = Array.from(blobElements)
        .map((blob) => blob.getElementsByTagName("Url")[0]?.textContent)
        .filter((url) => url);

      let newBlobs = [];

      blobList.forEach((url, idx) => {
        newBlobs.push({
          image: url,
          thumbnail: url.replace("content", "thumbnails"),
        });
      });
      return newBlobs.reverse();
    } catch (error) {
      console.error("Error listing blobs:", error);
      return [];
    }
  }

  useEffect(() => {
    listBlobsInContainer().then((blobList) => {
      setBlobs(blobList);
    });
  }, []);

  const onInit = () => {
    console.log("LightGallery has been initialized");
  };

  const handleLongPress = (e, fullImageUrl) => {
    e.preventDefault();
    alert("Open an image to save it.");
  };

  const fileInputRef = useRef(null);

  const handleDoubleClick = () => {
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const fullContainerUrl =
      "https://stgzaqcam.blob.core.windows.net/content?sp=racwdli&st=2025-06-08T15:36:23Z&se=2026-01-02T00:36:23Z&spr=https&sv=2024-11-04&sr=c&sig=D6UhqtpHaIzVneeuz7QqAYAJE6MqY3%2BOasrcAzGAS2Q%3D";
    const thumbContainerUrl =
      "https://stgzaqcam.blob.core.windows.net/thumbnails?sp=racwdli&st=2025-06-08T15:35:15Z&se=2026-01-02T00:35:15Z&spr=https&sv=2024-11-04&sr=c&sig=wYqrVZ1B%2Fh0ZSN74ufwUhxXletb%2BcNPSPrTuq9NRxP0%3D";

    for (const file of files) {
      try {
        await uploadToContainer(fullContainerUrl, file.name, file);

        const thumbBlob = await resizeImageFile(file, 300, 300);
        const thumbName = `${file.name.replace(/\.[^.]+$/, ".JPG")}`;
        await uploadToContainer(thumbContainerUrl, thumbName, thumbBlob);

        console.log(`Uploaded ${file.name} + ${thumbName}`);
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
      }
    }
  };

  return (
    <div className="App p-2 max-w-2xl m-auto">
      <header className="flex flex-col items-center my-0 sm:my-10">
        <img
          src="/image.png"
          className="w-20 mt-3 mb-1"
          alt="📸"
          onDoubleClick={handleDoubleClick}
        ></img>
        <h1 className="text-4xl font-bold mb-1 tracking-tighter">Zac's Pics</h1>
        <p className="text-sm mb-4 text-neutral-500">
          Open an image to save it to your camera roll.
        </p>
      </header>

      <LightGallery
        onInit={onInit}
        speed={500}
        elementClassNames="grid grid-cols-3 gap-1"
      >
        {blobs.length > 0 ? (
          blobs.map((item, index) => (
            <a key={index} href={item.image} className="block overflow-hidden">
              <Thumbnail
                src={item.thumbnail}
                onLongPress={(e) => handleLongPress(e, item.image)}
              />
            </a>
          ))
        ) : (
          <p className="text-center col-span-3">Loading images…</p>
        )}
      </LightGallery>

      <footer className="py-10 text-center text-neutral-500 text-sm">
        © 2025 Grayscale Development
      </footer>

      <input
        type="file"
        id="fileInput"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}

function Thumbnail({ src, onLongPress }) {
  const timerRef = useRef(null);

  const handleTouchStart = (e) => {
    timerRef.current = setTimeout(() => {
      onLongPress(e);
    }, 230);
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
  };

  const handleTouchMove = () => {
    clearTimeout(timerRef.current);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onLongPress(e);
  };

  return (
    <img
      src={src}
      alt="📸"
      className="w-full h-32 object-cover transition-opacity duration-500 ease-in-out opacity-0"
      loading="lazy"
      onLoad={(e) => e.currentTarget.classList.add("opacity-100")}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    />
  );
}

export default App;
