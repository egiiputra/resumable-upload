import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let provider: FilesService;
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    provider = module.get<FilesService>(FilesService);
    controller = module.get<FilesController>(FilesController);
  });

  describe('module definition', () => {
    it('provider should be defined', () => {
      expect(provider).toBeDefined();
    });

    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  desribe('test files service', () => {
    it('pass invalid metadata', () => {
      expect(() => provider.parseMetadata());
    });
  });
});
