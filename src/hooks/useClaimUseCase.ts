import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4UseCaseService, type ClaimPayload } from '@/lib/api/services/v4UseCaseService';

export function useClaimUseCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ useCaseId, data }: { useCaseId: string; data: ClaimPayload }) =>
      v4UseCaseService.claimUseCase(useCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v4-use-cases'] });
      queryClient.invalidateQueries({ queryKey: ['v4-use-case'] });
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
    },
  });
}
