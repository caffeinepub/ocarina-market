import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { StripeConfiguration, ShoppingItem, StripeSessionStatus } from '../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isStripeConfigured();
      } catch (error) {
        console.error('Error checking Stripe configuration:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ 
      items, 
      successUrl, 
      cancelUrl 
    }: { 
      items: ShoppingItem[]; 
      successUrl: string; 
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');

      // Validate all items have 'aud' currency
      const invalidItems = items.filter(item => item.currency !== 'aud');
      if (invalidItems.length > 0) {
        throw new Error('All items must use AUD currency');
      }

      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      return session;
    }
  });
}

export function useCreateCheckoutSessionFromBasket() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ 
      successUrl, 
      cancelUrl 
    }: { 
      successUrl: string; 
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');

      const result = await actor.createCheckoutSessionFromBasket(successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      return session;
    }
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<StripeSessionStatus> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    }
  });
}
