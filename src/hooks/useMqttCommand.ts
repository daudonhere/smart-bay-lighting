import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SendCommandDto {
  command: 'turn_on' | 'turn_off' | 'reset_error' | 'status_request';
  bay_id?: string;
}

interface CommandResponse {
  success: boolean;
  message: string;
  data: {
    command: string;
    bay_id: string;
  };
}

export function useMqttCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendCommandDto) => {
      const response = await api.post<CommandResponse>('/command', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.command !== 'status_request') {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    },
  });
}
