import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { tribeService } from '@/lib/api/services/tribeService';

const ERROR_MESSAGES: Record<string, string> = {
  'Tribe not found': 'Tribe not found',
  'This tribe is not yet open for joining': 'This tribe is not open yet',
  'You have already joined this tribe': 'You have already joined this tribe',
};

export function useJoinTribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tribeId, message, walletAddress }: { tribeId: string; message?: string; walletAddress?: string }) => {
      const body: { message?: string; walletAddress?: string } = {};
      if (message) body.message = message;
      if (walletAddress) body.walletAddress = walletAddress;
      return tribeService.joinTribe(tribeId, Object.keys(body).length > 0 ? body : undefined);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tribe', variables.tribeId] });
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      queryClient.invalidateQueries({ queryKey: ['my-tribes'] });
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      const serverMessage = axiosError?.response?.data?.message;
      const displayMessage =
        (serverMessage && ERROR_MESSAGES[serverMessage]) || 'Failed to join tribe';
      toast.error(displayMessage);
    },
  });
}
