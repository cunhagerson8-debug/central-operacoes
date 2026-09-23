import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolderDto } from './dto/create-holder.dto';
import { CreateHolderDocumentDto } from './dto/create-holder-document.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';


@Injectable()
export class HoldersService {

  private readonly s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.holder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const holder = await this.prisma.holder.findUnique({
      where: { id },
    });

    if (!holder) {
      throw new NotFoundException('Responsável não encontrado.');
    }

    return holder;
  }
    async create(dto: CreateHolderDto) {
    return this.prisma.holder.create({
      data: {
        fullName: dto.fullName,
        cpf: dto.cpf,
        phone: dto.phone,
        email: dto.email,
      },
    });
  }

  async createDocument(holderId: string, dto: CreateHolderDocumentDto, file?: any) {
    await this.findOne(holderId);

let fileUrl = dto.fileUrl;

if (file) {
  const key = `holders/${holderId}/${Date.now()}-${file.originalname}`;

  await this.s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  fileUrl = key;
}

    return this.prisma.holderDocument.create({
      data: {
        holderId,
        category: dto.category,
        name: dto.name,
        fileUrl: fileUrl,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: dto.status || 'PENDING',
        notes: dto.notes,
      },
    });
  }

async findDocuments(holderId: string) {
  await this.findOne(holderId);

  return this.prisma.holderDocument.findMany({
    where: {
      holderId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}
