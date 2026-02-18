import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Item, UserProfile, Branding } from '../backend';

export function useGetItems() {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItem(itemId: Uint8Array | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['item', itemId?.toString()],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getItem(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useGetMultipleItems(itemIds: Uint8Array[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['multipleItems', itemIds.map(id => id.toString()).join(',')],
    queryFn: async () => {
      if (!actor || itemIds.length === 0) return [];
      const items = await Promise.all(
        itemIds.map(async (id) => {
          try {
            return await actor.getItem(id);
          } catch {
            return null;
          }
        })
      );
      return items.filter((item): item is Item => item !== null);
    },
    enabled: !!actor && !isFetching && itemIds.length > 0,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetItemPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, priceInCents }: { itemId: Uint8Array; priceInCents: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setItemPrice(itemId, priceInCents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
    },
  });
}

export function useUpdateItemDescription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, description }: { itemId: Uint8Array; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateItemDescription(itemId, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
    },
  });
}

export function useUpdateItemPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, file }: { itemId: Uint8Array; file: File }) => {
      if (!actor) throw new Error('Actor not available');

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const { ExternalBlob } = await import('../backend');
      const blob = ExternalBlob.fromBytes(bytes);

      return actor.updateItemPhoto(itemId, blob, file.type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
    },
  });
}

export function useBulkUploadPhotos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      files, 
      onProgress 
    }: { 
      files: File[]; 
      onProgress?: (index: number, percentage: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const creations: Array<[any, string, string | null]> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Import ExternalBlob from backend
        const { ExternalBlob } = await import('../backend');
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          if (onProgress) {
            onProgress(i, percentage);
          }
        });

        creations.push([blob, file.type, null]);
      }

      return actor.bulkUploadPhotos(creations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useGetBranding() {
  const { actor, isFetching } = useActor();

  return useQuery<Branding | null>({
    queryKey: ['branding'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBranding();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetBranding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branding: Branding) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setBranding(branding);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding'] });
    },
  });
}
