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
      
      try {
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        
        // Validate result is a string before parsing
        if (typeof result !== 'string') {
          throw new Error('Invalid response from backend: expected JSON string');
        }
        
        const session = JSON.parse(result) as CheckoutSession;
        
        if (!session?.url || typeof session.url !== 'string' || session.url.trim() === '') {
          throw new Error('Stripe session missing valid url');
        }
        
        return session;
      } catch (error) {
        console.error('Checkout session creation error:', error);
        throw error;
      }
    },
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
      
      try {
        const result = await actor.createCheckoutSessionFromBasket(successUrl, cancelUrl);
        
        // Validate result is a string before parsing
        if (typeof result !== 'string') {
          throw new Error('Invalid response from backend: expected JSON string');
        }
        
        const session = JSON.parse(result) as CheckoutSession;
        
        if (!session?.url || typeof session.url !== 'string' || session.url.trim() === '') {
          throw new Error('Stripe session missing valid url');
        }
        
        return session;
      } catch (error) {
        console.error('Basket checkout session creation error:', error);
        throw error;
      }
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StripeSessionStatus | null>({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      try {
        return await actor.getStripeSessionStatus(sessionId);
      } catch (error) {
        console.error('Error fetching Stripe session status:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
  });
}
