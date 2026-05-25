import { supabase } from '../../db/supabase';
import { ServiceUnavailableError } from '../../middleware/errors';
import { WashService } from './wash-services.types';

export class WashServicesService {
  async listActiveServices(): Promise<WashService[]> {
    const { data, error } = await supabase
      .from('wash_services')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }

    return data || [];
  }
}
