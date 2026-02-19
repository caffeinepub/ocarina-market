import { useMutation, useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ShoppingItem, StripeConfiguration } from '../backend';

export function useIsStripeConfigured() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      return session;
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}
