import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { tracer } from '../Telemetry/Tracer.js';

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const spanName = `prisma:${model}.${operation}`;
                const attributes: Record<string, any> = {
                    'db.system': 'postgresql',
                    'db.model': model,
                    'db.operation': operation
                };

                // Dynamically tag gameId if model is Game or args reference gameId (Zero hardcoding)
                const anyArgs = args as any;
                if (model === 'Game' && anyArgs?.where?.id && typeof anyArgs.where.id === 'string') {
                    attributes['gameId'] = anyArgs.where.id;
                } else if (anyArgs?.where?.gameId && typeof anyArgs.where.gameId === 'string') {
                    attributes['gameId'] = anyArgs.where.gameId;
                }

                const span = tracer.startSpan(spanName, 'DB', attributes);

                try {
                    const result = await query(args);
                    tracer.endSpan(span, 'OK');
                    return result;
                } catch (err: any) {
                    tracer.endSpan(span, 'ERROR', err);
                    throw err;
                }
            }
        }
    }
});
