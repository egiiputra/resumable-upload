import { Test, TestingModule } from '@nestjs/testing';
import { FormUploadController } from './form-upload.controller';

describe('FormUploadController', () => {
  let controller: FormUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormUploadController],
    }).compile();

    controller = module.get<FormUploadController>(FormUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
