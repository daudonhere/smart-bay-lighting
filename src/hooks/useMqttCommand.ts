import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mqttService } from '@/lib/mqtt/service';

interface SendCommandDto {
  command: 'turn_on' | 'turn_off' | 'reset_error';
  bay_id: string;
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
      const response = await api.post<CommandResponse>('/mqtt/command', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      mqttService.sendCommand({
        command: 'status_request',
        bay_id: variables.bay_id,
      });
    },
  });
}
