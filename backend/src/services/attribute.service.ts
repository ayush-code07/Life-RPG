import { query } from '../config/database';
import { Attribute, ProfileAttribute } from '../types';

export class AttributeService {
  /**
   * Retrieves all available attribute definitions (public catalog)
   */
  static async getAllAttributes(): Promise<Attribute[]> {
    const { rows } = await query<Attribute>(
      'SELECT attribute_id, attribute_name, description FROM public.attributes ORDER BY attribute_id ASC'
    );
    return rows;
  }

  /**
   * Retrieves a character/profile's specific attribute levels and XP
   */
  static async getProfileAttributes(userId: string): Promise<ProfileAttribute[]> {
    const { rows } = await query<ProfileAttribute>(
      `SELECT pa.profile_id, pa.attribute_id, a.attribute_name, a.description, 
              pa.attribute_value, pa.attribute_xp
       FROM public.profile_attributes pa
       JOIN public.attributes a ON pa.attribute_id = a.attribute_id
       WHERE pa.profile_id = $1
       ORDER BY pa.attribute_id ASC`,
      [userId]
    );
    return rows;
  }

  /**
   * Seeds/initializes attribute rows for a profile (e.g. at value 0, XP 0 on onboarding)
   */
  static async seedProfileAttributes(userId: string): Promise<ProfileAttribute[]> {
    // Insert initial rows for all attributes in the catalog if they don't exist yet
    await query(
      `INSERT INTO public.profile_attributes (profile_id, attribute_id, attribute_value, attribute_xp)
       SELECT $1, attribute_id, 0, 0
       FROM public.attributes
       ON CONFLICT (profile_id, attribute_id) DO NOTHING`,
      [userId]
    );

    return this.getProfileAttributes(userId);
  }
}
