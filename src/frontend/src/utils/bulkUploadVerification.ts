import { ExternalBlob } from '../backend';

/**
 * Verifies that uploaded items are retrievable and their images are accessible.
 * @param itemIds - Array of item IDs returned from bulkUploadPhotos
 * @param actor - Backend actor instance
 * @returns Promise that resolves if verification passes, rejects otherwise
 */
export async function verifyBulkUpload(
  itemIds: Uint8Array[],
  actor: any
): Promise<void> {
  if (!itemIds || itemIds.length === 0) {
    throw new Error('No item IDs returned from upload');
  }

  // Verify each item can be fetched and has a valid image
  const verificationPromises = itemIds.map(async (itemId, index) => {
    try {
      // Fetch the item from backend
      const item = await actor.getItem(itemId);
      
      if (!item) {
        throw new Error(`Item ${index + 1} not found after upload`);
      }

      // Verify the photo blob exists
      if (!item.photo) {
        throw new Error(`Item ${index + 1} has no photo`);
      }

      // Get the direct URL for the image
      const imageUrl = item.photo.getDirectURL();
      
      if (!imageUrl) {
        throw new Error(`Item ${index + 1} has invalid image URL`);
      }

      // Perform a lightweight fetch check to verify the image is accessible
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Item ${index + 1} image not accessible (status: ${response.status})`);
        }
      } catch (fetchError) {
        throw new Error(`Item ${index + 1} image fetch failed: ${fetchError}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Verification failed for item ${index + 1}: ${error}`);
    }
  });

  // Wait for all verifications to complete
  await Promise.all(verificationPromises);
}
