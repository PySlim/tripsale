import { z } from 'zod';

export const ProviderSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: 'Provider name is required' }),
    code: z.string().min(2).max(10, { message: 'Provider code must be between 2 and 10 characters' }),
    active: z.boolean().default(true),
});

export type Provider = z.infer<typeof ProviderSchema>;

export class ProviderEntity implements Provider {
    id?: number;
    name: string;
    code: string;
    active: boolean;

    constructor(provider: Provider) {
        this.id = provider.id;
        this.name = provider.name;
        this.code = provider.code;
        this.active = provider.active;
    }

    static create(provider: unknown): ProviderEntity {
        const validatedProvider = ProviderSchema.parse(provider);
        return new ProviderEntity(validatedProvider);
    }
}
