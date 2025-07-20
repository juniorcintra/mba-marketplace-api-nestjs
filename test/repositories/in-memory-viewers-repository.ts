import { ViewersRepository } from "@/domain/marketplace/application/repositories/viewers-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";
import { Viewer } from "@/domain/marketplace/enterprise/entities/user/viewer";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { InMemoryUserAttachmentsRepository } from "./in-memory-user-attachments-repository";

export class InMemoryViewersRepository implements ViewersRepository {
  public items: Viewer[] = [];

  constructor(
    private userAttachmentsRepository: InMemoryUserAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async findById(id: string) {
    const viewer = this.items.find((item) => item.id.toString() === id);

    if (!viewer) {
      return null;
    }

    return viewer;
  }

  async findWithAvatarById(id: string) {
    const viewer = this.items.find((item) => item.id.toString() === id);

    if (!viewer) {
      return null;
    }

    let avatar: Attachment | null = null;

    const viewerAttachment = await this.userAttachmentsRepository.findByUserId(
      viewer.id.toString(),
    );

    if (viewerAttachment) {
      avatar = await this.attachmentsRepository.findById(
        viewerAttachment.attachmentId.toString(),
      );
    }

    const viewerWithAvatar = UserWithAvatar.create({
      userId: viewer.id,
      name: viewer.name,
      phone: viewer.phone,
      email: viewer.email,
      password: viewer.password,
      avatar,
    });

    return viewerWithAvatar;
  }

  async create(viewer: Viewer) {
    this.items.push(viewer);
  }
}
