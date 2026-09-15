import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { hashDeviceToken } from './device-token.util';

/**
 * Autentica o próprio aparelho (Agente MIL) via token opaco, separado do JWT
 * de administradores. Nunca aceita nem herda permissões de InternalUser.
 */
@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Credencial de aparelho ausente.');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Credencial de aparelho ausente.');
    }

    const tokenHash = hashDeviceToken(token);

    const device = await this.prisma.device.findUnique({
      where: { deviceApiKeyHash: tokenHash },
      select: { id: true, status: true },
    });

    if (!device || device.status !== 'ACTIVE') {
      throw new UnauthorizedException('Credencial de aparelho inválida.');
    }

    const routeDeviceId = request.params?.id;

    // Impede que o token de um aparelho opere sobre o :id de outro (IDOR).
    if (routeDeviceId && routeDeviceId !== device.id) {
      throw new UnauthorizedException('Credencial não autorizada para este aparelho.');
    }

    request.device = { id: device.id };

    return true;
  }
}
