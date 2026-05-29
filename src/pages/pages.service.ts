import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PagesService {
  constructor() {
    // TODO : 타 서비스에 레포에 대한 INJECT
  }
  // create(createPageDto: CreatePageDto) {
  //   return 'This action adds a new page';
  // }
  // findAll() {
  //   return `This action returns all pages`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} page`;
  // }
  // update(id: number, updatePageDto: UpdatePageDto) {
  //   return `This action updates a #${id} page`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} page`;
  // }

  async getHomePageData(userId: string) {}
  async getSearchPageData() {}
  async searchChallenges(target: string) {}
  async getLastestDanceData(type: string) {}
}
