import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateSmsDto } from './dto/create-sms.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { LocationDto } from './dto/location.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

const deviceInclude = {
  company: {
    select: { id: true, name: true, status: true },
  },
  currentStatus: true,
  smsMessages: {
    orderBy: { receivedAt: 'desc' as const },
    take: 5,
  },
  _count: {
    select: { smsMessages: true },
  },
} as const;

type DeviceWithRelations = {
  currentStatus: { batteryLevel: number | null } | null;
} & Record<string, unknown>;

function batterySurvivalStatus(batteryLevel: number | null | undefined) {
  if (batteryLevel === null || batteryLevel === undefined) {
    return 'UNKNOWN';
  }

  if (batteryLevel <= 10) {
    return 'EMERGENCY';
  }

  if (batteryLevel <= 20) {
    return 'CRITICAL';
  }

  if (batteryLevel <= 50) {
    return 'ATTENTION';
  }

  return 'NORMAL';
}

function presentDevice(device: DeviceWithRelations) {
  return {
    ...device,
    batterySurvivalStatus: batterySurvivalStatus(device.currentStatus?.batteryLevel),
  };
}

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const devices = await this.prisma.device.findMany({
      include: deviceInclude,
      orderBy: { createdAt: 'desc' },
    });

    return devices.map((device) => presentDevice(device));
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: deviceInclude,
    });

    if (!device) {
      throw new NotFoundException('Aparelho não encontrado.');
    }

    return presentDevice(device);
  }

  async create(dto: CreateDeviceDto) {
    return this.prisma.device.create({
      data: {
        companyId: dto.companyId,
        phoneNumber: dto.phoneNumber,
        imei: dto.imei,
        manufacturer: dto.manufacturer,
        model: dto.model,
        androidVersion: dto.androidVersion,
        simCarrier: dto.simCarrier,
        connectionType: dto.connectionType,
        status: dto.status,
        notes: dto.notes,
        currentStatus: { create: {} },
      },
      include: deviceInclude,
    }).then((device) => presentDevice(device));
  }

  async update(id: string, dto: UpdateDeviceDto) {
    await this.findOne(id);

    const device = await this.prisma.device.update({
      where: { id },
      data: {
        companyId: dto.companyId,
        phoneNumber: dto.phoneNumber,
        imei: dto.imei,
        manufacturer: dto.manufacturer,
        model: dto.model,
        androidVersion: dto.androidVersion,
        simCarrier: dto.simCarrier,
        connectionType: dto.connectionType,
        status: dto.status,
        notes: dto.notes,
      },
      include: deviceInclude,
    });

    return presentDevice(device);
  }

  async heartbeat(id: string, dto: HeartbeatDto) {
    await this.findOne(id);
    const communicationAt = new Date(dto.timestamp);
    const synchronizedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.device.update({
        where: { id },
        data: { connectionType: dto.connectionType },
      }),
      this.prisma.deviceCurrentStatus.upsert({
        where: { deviceId: id },
        update: {
          isOnline: dto.online,
          batteryLevel: dto.batteryLevel,
          isCharging: dto.isCharging,
          lastSeenAt: communicationAt,
          lastSyncAt: synchronizedAt,
        },
        create: {
          deviceId: id,
          isOnline: dto.online,
          batteryLevel: dto.batteryLevel,
          isCharging: dto.isCharging,
          lastSeenAt: communicationAt,
          lastSyncAt: synchronizedAt,
        },
      }),
      this.prisma.deviceStatusHistory.create({
        data: {
          deviceId: id,
          isOnline: dto.online,
          batteryLevel: dto.batteryLevel,
          isCharging: dto.isCharging,
          connectionType: dto.connectionType,
          recordedAt: communicationAt,
        },
      }),
    ]);

    return this.findOne(id);
  }

  async location(id: string, dto: LocationDto) {
    await this.findOne(id);
    const capturedAt = new Date(dto.timestamp);

    await this.prisma.$transaction([
      this.prisma.deviceLocationHistory.create({
        data: {
          deviceId: id,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          capturedAt,
        },
      }),
      this.prisma.deviceCurrentStatus.upsert({
        where: { deviceId: id },
        update: {
          lastLatitude: dto.latitude,
          lastLongitude: dto.longitude,
          lastLocationAt: capturedAt,
        },
        create: {
          deviceId: id,
          lastLatitude: dto.latitude,
          lastLongitude: dto.longitude,
          lastLocationAt: capturedAt,
        },
      }),
    ]);

    return this.findOne(id);
  }

  async locations(id: string) {
    await this.findOne(id);

    return this.prisma.deviceLocationHistory.findMany({
      where: { deviceId: id },
      orderBy: { capturedAt: 'desc' },
    });
  }

  async receiveSms(id: string, dto: CreateSmsDto) {
    await this.findOne(id);

    return this.prisma.deviceSmsMessage.create({
      data: {
        deviceId: id,
        sender: dto.sender,
        message: dto.message,
        receivedAt: new Date(dto.receivedAt),
      },
    });
  }

  async findSmsForDevice(id: string) {
    await this.findOne(id);

    return this.prisma.deviceSmsMessage.findMany({
      where: { deviceId: id },
      orderBy: { receivedAt: 'desc' },
    });
  }
}
