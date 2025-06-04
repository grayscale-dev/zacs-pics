import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";

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

  return (
    <div className="App p-2 max-w-2xl m-auto">
      <div className="flex flex-col items-center my-0 sm:my-10">
        <img src="/image.png" className="w-16 mt-4 mb-2" alt="logo"></img>
        <h1 className="text-4xl font-bold mb-1 tracking-tighter">Zac's Pics</h1>
        <p className="text-sm mb-4 text-neutral-500">
          Open an image to save it to your camera roll.
        </p>
      </div>
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
      alt={src}
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
