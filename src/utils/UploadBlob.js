import { BlobServiceClient } from "@azure/storage-blob";

async function uploadToContainer(containerSasUrl, blobName, data) {
  const blobServiceClient = new BlobServiceClient(containerSasUrl);
  const containerClient = blobServiceClient.getContainerClient("");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: data.type },
  });
}

export default uploadToContainer;
