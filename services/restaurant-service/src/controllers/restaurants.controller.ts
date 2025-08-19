import { Controller, Get } from '@nestjs/common';
import { MenuService } from '../services/menu.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly menuService: MenuService) {}
  @Get()
  list() {
    return this.menuService.list();
  }
}


